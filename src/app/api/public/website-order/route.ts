import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildOrderCode } from "@/lib/excel";

export const runtime = "nodejs";

const ALLOWED_ORIGINS = new Set([
  "https://takat-delta.vercel.app",
  "https://takat-amritayurvedas-projects.vercel.app",
]);

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    ...(allowed ? { "Access-Control-Allow-Origin": allowed } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(origin: string | null, body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders(origin) });
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return new NextResponse(null, { status: 403, headers: corsHeaders(origin) });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return json(origin, { ok: false, error: "Origin not allowed" }, 403);
  }

  const b = await req.json().catch(() => ({} as any));
  const customerName = String(b.customerName || "").trim().slice(0, 120);
  const phone = String(b.contactNumber || "").replace(/\D/g, "").slice(-10);
  const address = String(b.address || "").trim().slice(0, 1000);
  const pincode = String(b.pincode || "").replace(/\D/g, "").slice(0, 6);
  const stateName = String(b.state || "").trim().slice(0, 120);
  const city = String(b.city || "").trim().slice(0, 120);
  const productName = String(b.productName || "Takat Power X").trim().slice(0, 160);
  const quantity = Math.max(1, Math.min(10, Number(b.quantity) || 1));
  const price = Math.max(0, Number(b.price) || 999);

  if (!customerName || !/^\d{10}$/.test(phone) || !address || !/^\d{6}$/.test(pincode)) {
    return json(origin, { ok: false, error: "Valid name, 10-digit mobile, address and 6-digit pincode are required" }, 400);
  }

  // Protect against accidental double-click/resubmit: return the same recent website order.
  const recent = await prisma.order.findFirst({
    where: {
      contactNumber: phone,
      source: "Website",
      isDeleted: false,
      dateTime: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
    orderBy: { id: "desc" },
  });
  if (recent) return json(origin, { ok: true, order: recent, duplicate: true }, 200);

  let stateId: number | null = null;
  if (stateName) {
    const state = await prisma.state.findFirst({
      where: { name: { equals: stateName, mode: "insensitive" } },
      select: { id: true },
    }).catch(() => null);
    stateId = state?.id ?? null;
  }

  const maxRow = await prisma.order.aggregate({ _max: { id: true } });
  const nextSeq = (maxRow._max.id || 0) + 1;
  const totalAmount = price * quantity;

  const order = await prisma.order.create({
    data: {
      orderCode: buildOrderCode(349317 + nextSeq),
      customerName,
      contactNumber: phone,
      productName,
      quantity,
      price,
      totalAmount,
      address,
      city,
      stateId,
      pincode,
      source: "Website",
      sourceTags: JSON.stringify(["Website"]),
      orderStatus: "New",
      paymentStatus: "Pending",
      paymentMode: "COD",
      onlinePaid: 0,
      remark: stateName && !stateId ? `Website state: ${stateName}` : "Website order",
    },
  });

  return json(origin, { ok: true, order: { id: order.id, orderCode: order.orderCode } }, 201);
}
