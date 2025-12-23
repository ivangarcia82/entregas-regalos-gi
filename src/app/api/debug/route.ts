import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userCount = await prisma.user.count();
        const adminUser = await prisma.user.findUnique({
            where: { email: 'admin@generandoideas.com' },
            select: { id: true, email: true, role: true }
        });

        const envVars = {
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
            VERCEL_URL: process.env.VERCEL_URL,
            NODE_ENV: process.env.NODE_ENV,
        };

        return NextResponse.json({
            status: 'ok',
            session,
            envVars,
            userCount,
            adminExists: !!adminUser,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
