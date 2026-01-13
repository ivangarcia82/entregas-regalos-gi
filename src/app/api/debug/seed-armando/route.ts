import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import seedData from '@/data/armando-seed.json';

export async function GET() {
    try {
        console.log(`Starting Armando Seed for ${seedData.length} records...`);

        let newOrders = 0;

        // 1. Get existing data cache to minimize lookups
        const allOrders = await prisma.order.findMany({
            select: { customerName: true, company: true }
        });
        const existingOrderSet = new Set(allOrders.map(o => `${o.customerName}|${o.company}`));

        for (const row of seedData as any[]) {
            // Force the email as requested, although it seems to be in the excel too
            const sellerEmail = 'aparedes@generandoideas.com';

            // Use Name from excel if present, otherwise default
            const sellerName = row['Nombre Asesor']?.trim() || 'Armando Paredes';

            const password = await bcrypt.hash('generandoideas2025', 10);

            // Upsert Seller
            const seller = await prisma.user.upsert({
                where: { email: sellerEmail },
                update: { password: password },
                create: {
                    email: sellerEmail,
                    name: sellerName,
                    password: password,
                    role: 'SELLER',
                }
            });

            // Prepare Order Data
            const customerName = `${row['Nombre Cliente'] || ''} ${row['Apellido Cliente'] || ''}`.trim();
            const company = row['Nombre Empresa'] || '';
            const uniqueKey = `${customerName}|${company}`;

            if (!existingOrderSet.has(uniqueKey)) {
                // Determine Gift Type Logic if needed, or use column
                const address = `${row['Dirección. Calle'] || ''} ${row['#exterior #Interior '] || ''}, ${row['Colonia'] || ''}, ${row['Delegación'] || ''}, ${row['Estado'] || ''}, CP ${row['CP'] || ''}`.trim();

                await prisma.order.create({
                    data: {
                        customerName,
                        company,
                        address,
                        details: JSON.stringify(row),
                        giftType: row['Tipo de Regalo'],
                        sellerId: seller.id,
                        status: 'PENDING'
                    }
                });
                newOrders++;
                existingOrderSet.add(uniqueKey); // Prevent dups within the same run
            }
        }

        const stats = {
            processedRows: seedData.length,
            newOrdersCreated: newOrders,
            targetUser: 'aparedes@generandoideas.com'
        };

        return NextResponse.json({
            status: 'success',
            message: 'Armando Seed completed successfully.',
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Seed Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
