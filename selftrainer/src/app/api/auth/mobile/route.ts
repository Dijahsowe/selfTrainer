import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth-utils";
import { createMobileAccessToken } from "@/lib/mobile-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const clientKey = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`mobile-login:${clientKey}`, 10, 60_000).success) {
    return NextResponse.json({ error: "Too many sign-in attempts. Try again shortly." }, { status: 429 });
  }

  try {
    const { email, password } = signInSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user?.password || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email };
    const accessToken = await createMobileAccessToken(safeUser);

    return NextResponse.json({ accessToken, user: safeUser, expiresIn: 30 * 24 * 60 * 60 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    }

    console.error("Mobile sign-in failed:", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
