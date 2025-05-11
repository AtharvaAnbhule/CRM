import { db } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(req:Request) {
  try {
    const url = new URL(req.url);
    const subAccountId = url.searchParams.get("subAccountId"); // Extract subAccountId from the query string in the URL

    if (!subAccountId) {
      return NextResponse.json({ error: "subAccountId is required" }, { status: 400 });
    }

    const projects = await db.project.findMany({
      where: {
        projectId: subAccountId, // Filter projects by subAccountId
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }

}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProject = await db.project.create({
      data: {
        title: body.title, 
        projectId:body.projectId,
        image:body.image , 
        description: body.description,
        liveLink: body.liveLink || null,
        githubUrl: body.githubUrl || null,
        duration: body.duration,
        startDate: new Date(body.startDate),
        priority: body.priority,
        tasks: body.tasks,
        activeTasks: body.activeTasks,
        assignees: body.assignees || [],
      },
    });

    return NextResponse.json(newProject);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
