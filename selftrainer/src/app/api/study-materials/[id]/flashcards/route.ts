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
      return NextResponse.json({ error: "Material has no valid source text for flashcards" }, { status: 400 });
    }

    const job = await prisma.generationJob.create({
      data: {
        userId: session.user.id,
        studyMaterialId: material.id,
        type: "flashcard",
        status: "processing",
        model: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "mock",
      },
    });

    const provider = getAIProvider();
    const cards = await provider.generateFlashcards(safeSourceText, 5);

    const deck = await prisma.flashcardDeck.create({
      data: {
        studyMaterialId: material.id,
        title: `${material.title} - Flashcards`,
        flashcards: {
          create: cards.map((card) => ({
            question: card.question,
            answer: card.answer,
            explanation: card.explanation || null,
            difficulty: card.difficulty,
          })),
        },
      },
      include: {
        flashcards: true,
      },
    });

    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate flashcards";
    return NextResponse.json({ error: "Unable to generate flashcards right now.", details: message }, { status: 500 });
  }
}
