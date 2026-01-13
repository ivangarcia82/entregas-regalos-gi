import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const email = 'aparedes@generandoideas.com';
        const newName = 'Armando Paredes';

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { name: newName }
        });

        return NextResponse.json({
            status: 'success',
            message: `User ${email} updated name to '${newName}'`,
            user: updatedUser
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    }
}
