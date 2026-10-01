import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { extractTextFromUploadedFile } from "@/lib/document-parser";
import { getApiSession } from "@/lib/mobile-auth";

export async function POST(req: Request) {
  try {
    const session = await getApiSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await extractTextFromUploadedFile(file);
    if (!text || text.trim().length < 100) {
      return NextResponse.json(
        { error: "Uploaded document does not contain enough readable text. Please upload a larger document." },
        { status: 400 },
      );
    }

    const title = file.name.replace(/\.[^.]+$/, "") || "Uploaded Study Material";
    const trimmedText = text.trim();

    const material = await prisma.studyMaterial.create({
      data: {
        userId: session.user.id,
        title,
        sourceText: trimmedText,
        wordCount: trimmedText.split(/\s+/).filter(Boolean).length,
        status: "completed",
      },
    });

    return NextResponse.json({
      material,
      title,
      sourceText: trimmedText,
    }, { status: 201 });
  } catch (error) {
    console.error("Upload processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process uploaded file" },
      { status: 500 },
    );
  }
}
