import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { email, role } = await request.json();

    const adminCheck = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.userId } }
    });

    if (!adminCheck || adminCheck.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: userToAdd.id,
        role: role || 'MEMBER'
      }
    });

    return NextResponse.json({ member });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const adminCheck = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: session.userId } }
    });

    if (!adminCheck || adminCheck.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: id, userId } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
