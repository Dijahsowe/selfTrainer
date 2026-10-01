import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: "connected",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Health check failed";

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: "disconnected",
        error: message,
      },
      { status: 500 },
    );
  }
}
