import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { requireAuth, ok, bad, audit } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  const g = requireAuth(req); if (g instanceof Response) return g;
  const b = await req.json().catch(() => ({}));
  if (typeof b.currentPassword !== "string" || typeof b.newPassword !== "string") return bad("Passwords required");
  if (b.newPassword.length < 10 || Buffer.byteLength(b.newPassword, "utf8") > 72) return bad("Use at least 10 characters and no more than 72 bytes");
  const user = await prisma.user.findUnique({ where: { id: g.user.id } });
  if (!user?.isActive || !(await verifyPassword(b.currentPassword, user.passwordHash))) return bad("Current password is incorrect", 403);
  const result = await prisma.user.updateMany({ where: { id: user.id, passwordHash: user.passwordHash }, data: { passwordHash: await hashPassword(b.newPassword), mustChangePw: false } });
  if (!result.count) return bad("Password changed meanwhile. Please sign in again", 409);
  await audit(user.id, "auth.password_changed", "user", user.id);
  return ok({ success: true });
}
