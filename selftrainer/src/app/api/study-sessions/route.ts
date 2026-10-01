import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getApiSession } from "@/lib/mobile-auth";

const studySessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  topic: z.string().min(1, "Topic is required"),
  durationMin: z.coerce.number().int().min(15).max(240).default(30),
  completed: z.boolean().optional().default(false),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getApiSession(req);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.studySession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const session = await getApiSession(req);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = studySessionSchema.parse(body);

    const studySession = await prisma.studySession.create({
      data: {
        title: data.title,
        topic: data.topic,
        durationMin: data.durationMin,
        completed: data.completed,
        notes: data.notes ?? null,
        userId,
      },
    });

    return NextResponse.json({ studySession }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
