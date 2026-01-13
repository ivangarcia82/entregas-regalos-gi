import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import seedData from '@/data/adicionales-seed.json';

export async function GET() {
    try {
        console.log(`Starting Adicionales Seed for ${seedData.length} records...`);

        let newOrders = 0;
        let createdSellers = 0;

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

            // Upsert Seller (Create or Update)
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
                // Determine Address
                // Some rows might have address split or combined, simple check
                const addressPart1 = row['Dirección. Calle'] || '';
                const addressPart2 = row['#exterior #Interior '] || '';
                const colonia = row['Colonia'] || '';
                const delegacion = row['Delegación'] || '';
                const estado = row['Estado'] || '';
                const cp = row['CP'] || '';

                const address = `${addressPart1} ${addressPart2}, ${colonia}, ${delegacion}, ${estado}, CP ${cp}`.trim();

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

        return NextResponse.json({
            status: 'success',
            message: 'Adicionales Seed completed successfully.',
            stats: {
                processedRows: seedData.length,
                newOrdersCreated: newOrders
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
