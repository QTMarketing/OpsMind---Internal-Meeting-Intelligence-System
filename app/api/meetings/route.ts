import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/meetings
 *
 * Returns the list of past meetings with their summaries.
 */
export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { tasks: true, decisions: true, ideas: true }
        }
      }
    });

    return NextResponse.json({ meetings }, { status: 200 });
  } catch (error: any) {
    console.error("[Meetings API] Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}
