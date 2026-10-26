import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const configuredSecret = process.env.ABANDONED_CART_API_TOKEN;
  const suppliedSecret = req.headers.get("authorization");
  if (!configuredSecret || configuredSecret.length < 32 || !suppliedSecret || suppliedSecret !== `Bearer ${configuredSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const raw = await req.text();
    if (raw.length > 3000) return NextResponse.json({ ok: false }, { status: 413 });
    const b = JSON.parse(raw) as Record<string, unknown>;
    const phone = String(b.phone ?? "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(phone) || b.consent !== true) {
      return NextResponse.json({ ok: false, error: "Valid phone and consent required" }, { status: 400 });
    }
    const name = String(b.customer ?? "").trim().slice(0, 120);
    const now = new Date();
    const existingOrder = await prisma.order.findFirst({
      where: { contactNumber: phone, isDeleted: false, source: { notIn: ["Abandoned Cart", "Amrit Urja Abandoned Cart"] }, dateTime: { gte: new Date(Date.now() - 30 * 86400000) } },
      select: { id: true },
    });
    if (existingOrder) return NextResponse.json({ ok: true, alreadyOrdered: true });
    await prisma.abandonedCartLead.upsert({
      where: { phone },
      create: { phone, customerName: name || null, productName: "AMRIT URJA Capsule + Oil Combo", consentAt: now, lastSeenAt: now },
      update: { ...(name ? { customerName: name } : {}), consentAt: now, lastSeenAt: now, status: "Follow-up Pending" },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Lead could not be saved" }, { status: 500 });
  }
}
