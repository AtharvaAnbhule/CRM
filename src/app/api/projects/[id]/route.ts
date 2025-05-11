import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updatedProject = await db.project.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        liveLink: body.liveLink || null,
        githubUrl: body.githubUrl || null,
        duration: body.duration,
        startDate: new Date(body.startDate),
        priority: body.priority,
        tasks: body.tasks,
        image:body.image,
        activeTasks: body.activeTasks,
        assignees: body.assignees || [],
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await db.project.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
