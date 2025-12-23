import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Fetch all orders
        const allOrders = await prisma.order.findMany({
            select: { id: true, customerName: true, company: true, status: true, evidenceUrl: true, createdAt: true },
            orderBy: { createdAt: 'asc' }
        });

        const duplicates: string[] = [];
        const kept: string[] = [];

        // Group by unique key
        const groups = new Map<string, typeof allOrders>();

        for (const order of allOrders) {
            const key = `${order.customerName?.trim()}|${order.company?.trim()}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)?.push(order);
        }

        // Identify duplicates
        for (const [key, orders] of groups) {
            if (orders.length > 1) {
                // Sorting strategy: 
                // 1. Keep if status is NOT PENDING (modified)
                // 2. Keep if evidenceUrl exists
                // 3. Keep oldest

                // Sort by importance descending
                orders.sort((a, b) => {
                    const aScore = (a.status !== 'PENDING' ? 10 : 0) + (a.evidenceUrl ? 5 : 0);
                    const bScore = (b.status !== 'PENDING' ? 10 : 0) + (b.evidenceUrl ? 5 : 0);
                    if (aScore !== bScore) return bScore - aScore;
                    return a.createdAt.getTime() - b.createdAt.getTime(); // Keep oldest if same score
                });

                // First one is the keeper
                kept.push(orders[0].id);

                // The rest are duplicates to delete
                for (let i = 1; i < orders.length; i++) {
                    duplicates.push(orders[i].id);
                }
            } else {
                kept.push(orders[0].id);
            }
        }

        // Batch delete
        if (duplicates.length > 0) {
            await prisma.order.deleteMany({
                where: {
                    id: { in: duplicates }
                }
            });
        }

        return NextResponse.json({
            status: 'success',
            totalOrders: allOrders.length,
            uniqueGroups: groups.size,
            duplicatesFound: duplicates.length,
            duplicatesDeleted: duplicates.length,
            keptCount: kept.length,
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
