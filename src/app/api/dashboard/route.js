import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.userId;

    // Get all projects the user is a member of
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId } } },
      select: { id: true }
    });
    
    const projectIds = projects.map(p => p.id);

    // Get all tasks in those projects
    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } }
    });

    // Calculate stats
    const totalTasks = tasks.length;
    const tasksByStatus = {
      TODO: tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      DONE: tasks.filter(t => t.status === 'DONE').length,
    };
    
    const myTasks = tasks.filter(t => t.assignedToId === userId);
    
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length;

    return NextResponse.json({
      totalTasks,
      tasksByStatus,
      myTasksCount: myTasks.length,
      overdueTasks
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
