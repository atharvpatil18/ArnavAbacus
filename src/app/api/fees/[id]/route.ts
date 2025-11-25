// src/app/api/fees/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole, requireRole } from '@/lib/rbac';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
      const session = await auth();
      if (!session) {
          return new NextResponse('Unauthorized', { status: 401 });
      }

      // RBAC: Parents can only view their own child's fee record
      const fee = await prisma.feeRecord.findUnique({
          where: { id: params.id },
          include: {
              student: {
                  select: { name: true, level: true, parentId: true },
              },
        },
    });

      if (!fee) {
          return new NextResponse('Not Found', { status: 404 });
      }

      if (session.user.role === 'PARENT') {
          // Ensure the parent owns this student
          if (fee.student?.parentId !== session.user.id) {
              return new NextResponse('Forbidden', { status: 403 });
          }
      }

      // Admin/Teacher can view any fee
      return NextResponse.json(fee);
  } catch (error) {
      console.error('[FEES_GET_BY_ID]', error);
      return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
      const session = await auth();
      if (!session) {
          return new NextResponse('Unauthorized', { status: 401 });
      }
      // Only admins can delete fee records
      requireRole(session, [UserRole.ADMIN]);

      const deleted = await prisma.feeRecord.delete({ where: { id: params.id } });
      return NextResponse.json(deleted);
  } catch (error) {
      console.error('[FEES_DELETE]', error);
      return new NextResponse('Internal Error', { status: 500 });
  }
}
