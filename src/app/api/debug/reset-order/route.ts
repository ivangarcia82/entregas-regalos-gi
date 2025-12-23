import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderIdToReset = searchParams.get('id');

    try {
        if (orderIdToReset) {
            // Reset specific order
            const updated = await prisma.order.update({
                where: { id: orderIdToReset },
                data: {
                    status: 'PENDING',
                    evidenceUrl: null
                }
            });
            return NextResponse.json({
                status: 'success',
                message: `Order ${orderIdToReset} reset to PENDING and evidence removed.`,
                order: updated
            });
        } else {
            // List orders that might need resetting (non-pending or with evidence)
            const modifiedOrders = await prisma.order.findMany({
                where: {
                    OR: [
                        { status: { not: 'PENDING' } },
                        { evidenceUrl: { not: null } }
                    ]
                },
                select: { id: true, customerName: true, status: true, evidenceUrl: true }
            });

            return NextResponse.json({
                status: 'info',
                message: modifiedOrders.length > 0
                    ? 'Found these modified orders. To reset one, add ?id=ORDER_ID to the URL.'
                    : 'No modified orders found.',
                orders: modifiedOrders
            });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
