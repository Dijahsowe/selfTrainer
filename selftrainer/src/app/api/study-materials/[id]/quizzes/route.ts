import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/factory";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import { getApiSession } from "@/lib/mobile-auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const rateLimit = checkRateLimit(session.user.id, 10, 60_000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many AI requests. Please wait a moment before trying again.",
          retryAfterMs: rateLimit.resetInMs,
        },
        { status: 429 },
      );
    }

    const material = await prisma.studyMaterial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Study material not found" }, { status: 404 });
    }

    const safeSourceText = sanitizeText(material.sourceText ?? "");
    if (!safeSourceText) {
      return NextResponse.json({ error: "Material has no valid source text for quiz generation" }, { status: 400 });
    }

    const job = await prisma.generationJob.create({
      data: {
        userId: session.user.id,
        studyMaterialId: material.id,
        type: "quiz",
        status: "processing",
        model: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "mock",
      },
    });

    const provider = getAIProvider();
    const generatedQuestions = await provider.generateQuiz(safeSourceText, 3);

    const quiz = await prisma.quiz.create({
      data: {
        studyMaterialId: material.id,
        title: `${material.title} - Quiz`,
        difficulty: "mixed",
        questionCount: generatedQuestions.length,
        questions: {
          create: generatedQuestions.map((question) => ({
            questionText: question.questionText,
            options: JSON.stringify(question.options),
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    const safeQuiz = {
      ...quiz,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        quizId: question.quizId,
        questionText: question.questionText,
        options: question.options,
        explanation: question.explanation,
        difficulty: question.difficulty,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      })),
    };
    return NextResponse.json({ quiz: safeQuiz }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate quiz";
    return NextResponse.json({ error: "Unable to generate quiz right now.", details: message }, { status: 500 });
  }
}
