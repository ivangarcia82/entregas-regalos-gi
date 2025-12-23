import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import seedData from '@/data/prod-seed.json';

export async function GET() {
    try {
        console.log(`Starting Smart Seed for ${seedData.length} records...`);

        let newSellers = 0;
        let newOrders = 0;

        // 1. Get existing data cache to minimize lookups
        const allOrders = await prisma.order.findMany({
            select: { customerName: true, company: true }
        });
        const existingOrderSet = new Set(allOrders.map(o => `${o.customerName}|${o.company}`));

        for (const row of seedData as any[]) {
            const sellerEmail = row['Correo Asesor']?.trim();
            const sellerName = row['Nombre Asesor']?.trim();

            if (!sellerEmail) continue;

            const password = await bcrypt.hash('generandoideas2025', 10);

            // Upsert Seller
            const seller = await prisma.user.upsert({
                where: { email: sellerEmail },
                update: { password: password },
                create: {
                    email: sellerEmail,
                    name: sellerName || 'Vendedor',
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

        const totalUsers = await prisma.user.count();
        const totalOrders = await prisma.order.count();

        return NextResponse.json({
            status: 'success',
            message: 'Seed completed successfully.',
            stats: {
                newOrdersCreated: newOrders,
                totalUsers,
                totalOrders
            },
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
