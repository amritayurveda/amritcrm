import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/apiHelpers";
import { logStatusActivity } from "@/lib/statusActivity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusText(row: any): string {
  const details = Array.isArray(row?.tracking_details) ? row.tracking_details : [];
  const latest = details[details.length - 1] || details[0] || {};
  return [
    latest.status, latest.event, latest.event_type, latest.event_code,
    latest.event_description, latest.description, latest.activity,
    row?.del_status?.del_status, row?.del_status?.status,
  ].filter(Boolean).join(" ").toLowerCase();
}

function mapIndiaPostStatus(raw: string): { stage: string | null; crmStatus: string | null; delivered: boolean } {
  const s = raw.toLowerCase();
  if (/rto|return to origin|returned to sender/.test(s)) return { stage: "RTO", crmStatus: "RTO", delivered: false };
  if (/delivered to addressee|article delivered|successfully delivered|delivered/.test(s) && !/not delivered|undelivered/.test(s)) {
    return { stage: "Delivered", crmStatus: "GPO Delivered", delivered: true };
  }
  if (/out for delivery/.test(s)) return { stage: "Out For Delivery", crmStatus: "GPO Done", delivered: false };
  if (/dispatched|bagged|received at|item received|in transit|transit/.test(s)) return { stage: "In Transit", crmStatus: "GPO Done", delivered: false };
  if (/not delivered|undelivered/.test(s)) return { stage: "Not Delivered", crmStatus: null, delivered: false };
  return { stage: null, crmStatus: null, delivered: false };
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const body = await req.json().catch(() => ({}));
  const articleNumber = String(body?.articleNumber || body?.consignmentNumber || "").trim().toUpperCase();
  if (!/^[A-Z]{2}\d{9}IN$/.test(articleNumber)) {
    return NextResponse.json({ error: "Valid India Post article number is required (example: ET214339871IN)." }, { status: 400 });
  }

  const gatewayUrl = (process.env.INDIA_POST_GATEWAY_URL || "https://gateway.amritayurveda.shop/v1/tracking/bulk").replace(/\/$/, "");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  // Configure these only if the gateway requires a shared key; header name is deliberately configurable.
  const gatewayKey = process.env.INDIA_POST_GATEWAY_KEY;
  const gatewayHeader = process.env.INDIA_POST_GATEWAY_AUTH_HEADER;
  if (gatewayKey && gatewayHeader) headers[gatewayHeader] = gatewayKey;

  let response: Response;
  try {
    response = await fetch(gatewayUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ bulk: [articleNumber] }),
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });
  } catch (e: any) {
    return NextResponse.json({ error: "India Post Gateway request failed: " + (e?.message || "network error") }, { status: 502 });
  }

  const payload: any = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false || !payload) {
    return NextResponse.json({ error: payload?.message || ("India Post Gateway HTTP " + response.status), gatewayStatus: response.status, gateway: payload }, { status: 502 });
  }

  const rows: any[] = Array.isArray(payload?.data) ? payload.data : [];
  const row = rows.find((x) => String(x?.booking_details?.article_number || "").toUpperCase() === articleNumber) || rows[0];
  if (!row) return NextResponse.json({ error: "Gateway returned no record for this article number.", gateway: payload }, { status: 404 });

  const order = await prisma.order.findFirst({
    where: { isDeleted: false, awbCode: articleNumber },
    select: { id: true, orderCode: true, orderStatus: true, paymentMode: true, paymentStatus: true, leadOwnerId: true, dealerId: true },
  });

  const rawStatus = statusText(row);
  const mapped = mapIndiaPostStatus(rawStatus);
  let updated = false;
  if (order && (mapped.crmStatus || mapped.stage)) {
    const data: any = { lastTrackedAt: new Date(), shippingStatus: rawStatus || "Tracking response received" };
    if (mapped.stage) data.trackingStage = mapped.stage;
    if (mapped.crmStatus) data.orderStatus = mapped.crmStatus;
    if (mapped.delivered && String(order.paymentMode || "").toLowerCase() === "cod") data.paymentStatus = "Completed";

    await prisma.order.update({ where: { id: order.id }, data });
    if ((mapped.crmStatus && mapped.crmStatus !== order.orderStatus) || mapped.stage) {
      await prisma.orderHistory.create({
        data: { orderId: order.id, status: "India Post: " + (mapped.stage || rawStatus) + (mapped.crmStatus ? " -> " + mapped.crmStatus : ""), remark: articleNumber },
      });
    }
    if (mapped.crmStatus && mapped.crmStatus !== order.orderStatus) {
      await logStatusActivity({
        orderId: order.id, previousStatus: order.orderStatus, newStatus: mapped.crmStatus,
        source: "webhook", changedById: null, leadOwnerId: order.leadOwnerId, dealerId: order.dealerId,
      });
    }
    updated = true;
  }

  return NextResponse.json({
    success: true, articleNumber, matchedOrder: order ? { id: order.id, orderCode: order.orderCode } : null,
    mappedStatus: mapped.crmStatus, trackingStage: mapped.stage, updated,
    booking: row.booking_details || null, delivery: row.del_status || null,
    tracking: row.tracking_details || [], gatewayMessage: payload.message || null,
  });
}
