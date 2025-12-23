import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const emailToReset = 'admin@generandoideas.com';
        const newPasswordPlain = 'generandoideas2025';

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { email: emailToReset },
            data: {
                password: hashedPassword
            }
        });

        return NextResponse.json({
            status: 'success',
            message: `Password for ${updatedUser.email} has been reset manually.`,
            newPassword: newPasswordPlain,
            userRole: updatedUser.role,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
