import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createSubjectSchema } from "@/lib/schemas/study-material";
import { getApiSession } from "@/lib/mobile-auth";

export async function GET(req: Request) {
  const session = await getApiSession(req);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subjects = await prisma.subject.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ subjects });
}

export async function POST(req: Request) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createSubjectSchema.parse(body);

    const subject = await prisma.subject.create({
      data: {
        name: validatedData.name.trim(),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
