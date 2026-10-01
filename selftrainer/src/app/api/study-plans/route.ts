import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getApiSession } from "@/lib/mobile-auth";

const studyPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  topic: z.string().min(1, "Topic is required"),
  goals: z.string().optional(),
  durationMin: z.coerce.number().int().min(15).max(240).default(30),
});

export async function GET(req: Request) {
  const session = await getApiSession(req);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.studyPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  const session = await getApiSession(req);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = studyPlanSchema.parse(body);

    const plan = await prisma.studyPlan.create({
      data: {
        title: data.title,
        topic: data.topic,
        goals: data.goals ?? null,
        durationMin: data.durationMin,
        userId,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
