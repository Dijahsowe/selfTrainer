import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAIProvider } from "@/lib/ai/factory";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import { getApiSession } from "@/lib/mobile-auth";

function parseStoredJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

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
      return NextResponse.json({ error: "Material has no valid source text to summarize" }, { status: 400 });
    }

    const job = await prisma.generationJob.create({
      data: {
        userId: session.user.id,
        studyMaterialId: material.id,
        type: "summary",
        status: "processing",
        model: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "mock",
      },
    });

    const provider = getAIProvider();
    const result = await provider.generateSummary(safeSourceText);

    const summary = await prisma.summary.create({
      data: {
        studyMaterialId: material.id,
        userId: session.user.id,
        content: result.summary,
        keyPoints: JSON.stringify(result.keyPoints),
        keyTerms: JSON.stringify(result.keyTerms),
        model: provider.name,
        promptVersion: "v1.0",
      },
    });

    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      summary: {
        ...summary,
        keyPoints: parseStoredJson(summary.keyPoints, []),
        keyTerms: parseStoredJson(summary.keyTerms, []),
      },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate summary";
    return NextResponse.json({ error: "Unable to generate summary right now.", details: message }, { status: 500 });
  }
}
