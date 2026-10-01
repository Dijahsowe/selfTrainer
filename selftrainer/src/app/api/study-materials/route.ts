import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createStudyMaterialSchema } from "@/lib/schemas/study-material";
import { getApiSession } from "@/lib/mobile-auth";

export async function GET(req: Request) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const search = searchParams.get("search");

    const materials = await prisma.studyMaterial.findMany({
      where: {
        userId: session.user.id,
        ...(subjectId ? { subjectId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { sourceText: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        subjectRef: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ materials });
  } catch {
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createStudyMaterialSchema.parse(body);

    const wordCount = validatedData.sourceText.trim().split(/\s+/).filter(Boolean).length;

    const material = await prisma.studyMaterial.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        subjectId: validatedData.subjectId || null,
        sourceText: validatedData.sourceText,
        wordCount,
        status: "completed",
      },
      include: {
        subjectRef: true,
      },
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create material" }, { status: 500 });
  }
}
