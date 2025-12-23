
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Data Comparison Report ---');
    console.log(`Time: ${new Date().toISOString()}`);

    const filePath = path.join(process.cwd(), 'entregasv2.xlsx')
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath)
        return
    }

    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data: any[] = XLSX.utils.sheet_to_json(sheet)

    console.log(`Excel file contains ${data.length} rows.`);

    // 1. Fetch all DB data
    const allUsers = await prisma.user.findMany();
    const allOrders = await prisma.order.findMany(); // Retrieve all orders to check duplications/existance

    console.log(`Database contains ${allUsers.length} users and ${allOrders.length} orders.`);

    const missingSellers = new Set<string>();
    const missingOrders: any[] = [];
    let matchCount = 0;

    // 2. Process rows
    for (const row of data) {
        const sellerEmail = row['Correo Asesor']?.trim();
        const sellerName = row['Nombre Asesor']?.trim();

        if (!sellerEmail) {
            console.warn('Skipping row with no Correo Asesor:', row);
            continue;
        }

        // Check Seller
        const existingUser = allUsers.find(u => u.email === sellerEmail);
        if (!existingUser) {
            missingSellers.add(sellerEmail);
        }

        // Check Order
        // Heuristic: Match by customerName + company. Address might vary slightly but name+company is usually unique enough for this context.
        const customerName = `${row['Nombre Cliente'] || ''} ${row['Apellido Cliente'] || ''}`.trim();
        const company = row['Nombre Empresa'] || '';

        // Find if this order matches any in DB
        // We look for an order that has this customerName and company AND belongs to the seller (if seller exists)
        // If seller doesn't exist, the order definitely doesn't exist linked to them.

        const orderExists = allOrders.some(o =>
            o.customerName === customerName &&
            o.company === company
        );

        if (!orderExists) {
            missingOrders.push({
                customerName,
                company,
                sellerEmail,
                details: row
            });
        } else {
            matchCount++;
        }
    }

    console.log('\n--- Results ---');
    console.log(`Matched (Existing) Orders: ${matchCount}`);

    if (missingSellers.size > 0) {
        console.log(`\nMISSING SELLERS (${missingSellers.size}):`);
        missingSellers.forEach(s => console.log(`- ${s}`));
    } else {
        console.log('\nAll sellers from Excel exist in DB.');
    }

    if (missingOrders.length > 0) {
        console.log(`\nMISSING ORDERS (${missingOrders.length}):`);
        missingOrders.slice(0, 10).forEach(o => {
            console.log(`- Customer: ${o.customerName}, Company: ${o.company} (Seller: ${o.sellerEmail})`);
        });
        if (missingOrders.length > 10) {
            console.log(`... and ${missingOrders.length - 10} more.`);
        }
    } else {
        console.log('\nAll orders from Excel appear to exist in DB.');
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
