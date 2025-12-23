import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const userCount = await prisma.user.count();
        const adminUser = await prisma.user.findUnique({
            where: { email: 'admin@generandoideas.com' },
            select: { id: true, email: true, role: true }
        });

        // Safety check: mask sensitive URL
        const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
        const maskedUrl = dbUrl.substring(0, 15) + '...';

        return NextResponse.json({
            status: 'ok',
            userCount,
            adminExists: !!adminUser,
            adminData: adminUser,
            dbUrlPrefix: maskedUrl,
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
