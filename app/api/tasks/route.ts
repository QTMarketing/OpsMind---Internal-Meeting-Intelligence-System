import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/tasks
 *
 * Returns the list of tasks from the database. 
 * Accepts an optional `status` query param to filter.
 * Example: GET /api/tasks?status=pending
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where: statusFilter ? { status: statusFilter } : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        tasks,
        total: tasks.length,
        ...(statusFilter && { filter: { status: statusFilter } }),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Tasks API] Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * 
 * Manually creates a new task associated with a meeting.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, meetingId, assignee, dueDate, description, project } = body;

    if (!title || !meetingId) {
      return NextResponse.json(
        { error: "Title and meetingId are required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        meetingId,
        assignee,
        description,
        ...(project !== undefined && { project }),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error("[Tasks API] Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

