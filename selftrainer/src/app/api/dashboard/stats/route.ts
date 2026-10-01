import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getApiSession } from "@/lib/mobile-auth";

export async function GET(req: Request) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [materialCount, summaryCount, deckCount, quizAttemptStats, recentMaterials] = await Promise.all([
      prisma.studyMaterial.count({ where: { userId } }),
      prisma.summary.count({
        where: { userId },
      }),
      prisma.flashcardDeck.count({
        where: { material: { userId } },
      }),
      prisma.quizAttempt.aggregate({
        where: { userId },
        _avg: { score: true },
        _count: { id: true },
      }),
      prisma.studyMaterial.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          subjectRef: true,
          summaries: { select: { id: true } },
          flashcardDecks: { select: { id: true } },
          quizzes: { select: { id: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalMaterials: materialCount,
        totalSummaries: summaryCount,
        totalFlashcardDecks: deckCount,
        totalQuizAttempts: quizAttemptStats._count.id,
        averageQuizScore: Math.round(quizAttemptStats._avg.score || 0),
      },
      recentMaterials: recentMaterials.map((material) => ({
        ...material,
        subject: material.subjectRef,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
