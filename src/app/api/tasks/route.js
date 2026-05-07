import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    // If projectId is provided, check if user is a member
    if (projectId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: session.userId } }
      });
      if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      
      const tasks = await prisma.task.findMany({
        where: { projectId },
        include: { assignedTo: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ tasks });
    }

    // Else return tasks assigned to the current user
    const tasks = await prisma.task.findMany({
      where: { assignedToId: session.userId },
      include: { project: { select: { name: true } } },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const { title, description, dueDate, priority, projectId, assignedToId } = data;

    if (!title || !projectId) {
      return NextResponse.json({ error: 'Title and projectId are required' }, { status: 400 });
    }

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: session.userId } }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'MEDIUM',
        projectId,
        assignedToId: assignedToId || null
      }
    });

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
