import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/meetings/[id]
 * 
 * Returns a single meeting with its full transcription, 
 * extracted tasks, decisions, and ideas.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { createdAt: "desc" } },
        decisions: { orderBy: { createdAt: "desc" } },
        ideas: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ meeting }, { status: 200 });
  } catch (error: unknown) {
    const id = (await params).id;
    console.error(`[Meetings ID API] Error fetching meeting ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch meeting details" },
      { status: 500 }
    );
  }
}
