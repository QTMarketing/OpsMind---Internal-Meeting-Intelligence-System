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
    const { id } = await params;
    console.error(`[Meetings ID API] Error fetching meeting ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch meeting details" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/meetings/[id]
 * 
 * Updates a meeting's title or summary.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, summary } = await request.json();

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(summary !== undefined && { summary }),
      },
      include: {
        _count: { select: { tasks: true } },
      }
    });

    return NextResponse.json({ 
      meeting: {
        ...meeting,
        taskCount: meeting._count.tasks
      } 
    }, { status: 200 });
  } catch (error: unknown) {
    const { id } = await params;
    console.error(`[Meetings ID API] Error updating meeting ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meetings/[id]
 * 
 * Deletes a meeting and its associated records.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use a transaction to ensure all associated records are deleted if necessary,
    // though Prisma cascading deletes (if configured in schema) might handle this.
    // Meeting model in our schema likely has tasks, decisions, ideas.
    await prisma.meeting.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const { id } = await params;
    console.error(`[Meetings ID API] Error deleting meeting ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
