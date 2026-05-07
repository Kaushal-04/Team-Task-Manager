import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await request.json();

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { members: true } } }
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const membership = task.project.members.find(m => m.userId === session.userId);
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Members can only update status if it's assigned to them, OR if they are an admin
    const isAdmin = membership.role === 'ADMIN';
    const isAssignee = task.assignedToId === session.userId;

    if (!isAdmin && !isAssignee) {
      return NextResponse.json({ error: 'Forbidden. You can only update tasks assigned to you.' }, { status: 403 });
    }

    // Members can only update status. Admins can update everything.
    const updateData = {};
    if (data.status) updateData.status = data.status;
    
    if (isAdmin) {
      if (data.title) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
      if (data.priority) updateData.priority = data.priority;
      if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { members: true } } }
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const membership = task.project.members.find(m => m.userId === session.userId);
    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
