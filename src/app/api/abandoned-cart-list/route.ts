import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiHelpers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const g = requirePermission(req, "orders.viewAll");
  if (g instanceof Response) return g;
  const leads = await prisma.abandonedCartLead.findMany({
    take: 100,
    orderBy: { lastSeenAt: "desc" },
  });
  return NextResponse.json({ ok: true, leads });
}
