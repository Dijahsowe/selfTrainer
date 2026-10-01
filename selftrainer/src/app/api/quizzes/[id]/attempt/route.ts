import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
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
    const { userAnswers } = await req.json();

    const quiz = await prisma.quiz.findFirst({
      where: { id, material: { userId: session.user.id } },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const normalizedAnswers = userAnswers && typeof userAnswers === "object" ? userAnswers as Record<string, string> : {};
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const questionResults: Record<string, { correct: boolean; correctAnswer: string; explanation: string }> = {};

    for (const question of quiz.questions) {
      const selectedOption = normalizedAnswers[question.id];
      const correct = selectedOption === question.correctAnswer;
      if (correct) {
        correctCount += 1;
      }
      questionResults[question.id] = {
        correct,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    }

    const scorePercentage = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: session.user.id,
        score: scorePercentage,
        totalQuestions,
        answers: JSON.stringify(normalizedAnswers),
      },
    });

    return NextResponse.json({
      attempt,
      correctCount,
      totalQuestions,
      scorePercentage,
      questionResults,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to record quiz attempt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
