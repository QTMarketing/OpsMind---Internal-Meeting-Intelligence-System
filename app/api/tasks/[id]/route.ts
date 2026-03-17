import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * PATCH /api/tasks/[id]
 * 
 * Updates a task's status, assignee, title, or description.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Whitelist allowed fields for update
    const { title, description, status, assignee, dueDate, project } = body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(assignee !== undefined && { assignee }),
        ...(project !== undefined && { project }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    return NextResponse.json({ task }, { status: 200 });
  } catch (error: unknown) {
    const id = (await params).id;
    console.error(`[Tasks ID API] Error updating task ${id}:`, error);
    
    // Handle P2025 (Record not found)
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * 
 * Removes a task from the database.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const id = (await params).id;
    console.error(`[Tasks ID API] Error deleting task ${id}:`, error);
    
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
