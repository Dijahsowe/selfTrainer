import { decode, encode } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const MOBILE_TOKEN_SALT = "selftrainer-mobile-v1";
const MOBILE_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

type ApiSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
};

function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET must be configured to enable mobile sign-in.");
  }
  return secret;
}

export async function createMobileAccessToken(user: {
  id: string;
  name: string | null;
  email: string | null;
}): Promise<string> {
  return encode({
    token: { sub: user.id, name: user.name, email: user.email },
    secret: getAuthSecret(),
    salt: MOBILE_TOKEN_SALT,
    maxAge: MOBILE_TOKEN_MAX_AGE,
  });
}

export async function getApiSession(req: Request): Promise<ApiSession | null> {
  const authorization = req.headers.get("authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!bearer) {
    return getServerSession(authOptions);
  }

  try {
    const token = await decode({
      token: bearer,
      secret: getAuthSecret(),
      salt: MOBILE_TOKEN_SALT,
    });

    if (!token?.sub) return null;

    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { id: true, name: true, email: true },
    });

    return user ? { user } : null;
  } catch {
    return null;
  }
}
