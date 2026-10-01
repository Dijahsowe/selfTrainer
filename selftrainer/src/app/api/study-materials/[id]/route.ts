import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { updateStudyMaterialSchema } from "@/lib/schemas/study-material";
import { getApiSession } from "@/lib/mobile-auth";

function parseStoredJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const material = await prisma.studyMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        subjectRef: true,
        summaries: {
          orderBy: { createdAt: "desc" },
        },
        flashcardDecks: {
          orderBy: { createdAt: "desc" },
          include: {
            flashcards: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        quizzes: {
          orderBy: { createdAt: "desc" },
          include: {
            questions: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    return NextResponse.json({
      material: {
        ...material,
        summaries: material.summaries.map((summary) => ({
          ...summary,
          keyPoints: parseStoredJson(summary.keyPoints, []),
          keyTerms: parseStoredJson(summary.keyTerms, []),
        })),
        quizzes: material.quizzes.map((quiz) => ({
          ...quiz,
          questions: quiz.questions.map((question) => ({
            id: question.id,
            questionText: question.questionText,
            options: parseStoredJson(question.options, []),
            explanation: question.explanation,
            difficulty: question.difficulty,
          })),
        })),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch material" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = updateStudyMaterialSchema.parse(body);

    const existing = await prisma.studyMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    const wordCount = validatedData.sourceText
      ? validatedData.sourceText.trim().split(/\s+/).filter(Boolean).length
      : existing.wordCount;

    const material = await prisma.studyMaterial.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.sourceText ? { wordCount } : {}),
      },
      include: {
        subjectRef: true,
      },
    });

    return NextResponse.json({ material });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const material = await prisma.studyMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    await prisma.studyMaterial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }
}
