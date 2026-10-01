import path from "node:path";
import { pathToFileURL } from "node:url";
import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

const workerUrl = pathToFileURL(path.resolve(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs")).href;
GlobalWorkerOptions.workerSrc = workerUrl;

if (typeof globalThis.DOMMatrix === "undefined") {
  class DOMMatrixShim {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;

    constructor(init?: number[] | { a?: number; b?: number; c?: number; d?: number; e?: number; f?: number }) {
      if (Array.isArray(init)) {
        this.a = init[0] ?? 1;
        this.b = init[1] ?? 0;
        this.c = init[2] ?? 0;
        this.d = init[3] ?? 1;
        this.e = init[4] ?? 0;
        this.f = init[5] ?? 0;
      } else if (init && typeof init === "object") {
        this.a = init.a ?? this.a;
        this.b = init.b ?? this.b;
        this.c = init.c ?? this.c;
        this.d = init.d ?? this.d;
        this.e = init.e ?? this.e;
        this.f = init.f ?? this.f;
      }
    }
  }

  // pdfjs-dist expects a global DOMMatrix when running in Node/server contexts.
  // This shim is intentionally minimal because we only need text extraction, not full canvas rendering.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMMatrix = DOMMatrixShim;
}

export async function extractTextFromUploadedFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (fileName.endsWith(".pdf")) {
    return extractTextFromPdf(buffer);
  }

  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (fileName.endsWith(".txt") || fileName.endsWith(".md") || fileName.endsWith(".rtf")) {
    return buffer.toString("utf-8");
  }

  throw new Error("Unsupported file type. Please upload a PDF, DOCX, TXT, MD, or RTF file.");
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdf = await getDocument({
      data: new Uint8Array(buffer),
      disableFontFace: true,
    }).promise;

    const extractedPages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const items = (textContent.items as Array<{ str?: string }> | undefined) ?? [];
      const pageText = items
        .map((item) => item.str ?? "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (pageText) {
        extractedPages.push(pageText);
      }
    }

    await pdf.cleanup();

    const text = extractedPages.join("\n").trim();
    if (!text) {
      throw new Error("Unable to extract text from the uploaded PDF.");
    }

    return text;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Unable to extract text from the uploaded PDF.");
  }
}
