import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { status } = await req.json(); // status: VALIDATED or REJECTED

    // If REJECTED, set to PENDING and maybe clear evidenceUrl? Or keep history?
    // Requirements: "valida con el vendedor que ese regalo ha sido entregado".
    // If rejected, usually they need to re-upload.

    let newStatus = status;
    let updateData: any = { status: newStatus };

    if (status === 'REJECTED') {
        updateData = { status: 'PENDING', evidenceUrl: null }; // Reset
    }

    try {
        await prisma.order.update({
            where: { id: id },
            data: updateData
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
