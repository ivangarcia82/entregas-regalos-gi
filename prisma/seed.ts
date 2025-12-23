import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import * as path from 'path'
import * as fs from 'fs'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const filePath = path.join(process.cwd(), 'entregasv2.xlsx')
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath)
        return
    }

    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data: any[] = XLSX.utils.sheet_to_json(sheet)

    console.log(`Found ${data.length} rows in Excel`)

    // 1. Create Admin User
    const adminEmail = 'admin@generandoideas.com'
    const adminPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: adminPassword,
            role: 'ADMIN',
        },
    })
    console.log('Admin user created')

    // 2. Process rows
    for (const row of data) {
        /*
        Expected Columns based on previous inspection:
        'Nombre Cliente', 'Apellido Cliente', 'Nombre Asesor', 'Correo Asesor', ...
        */

        const sellerEmail = row['Correo Asesor']?.trim()
        const sellerName = row['Nombre Asesor']?.trim()

        if (!sellerEmail) continue

        // Create or ensure Seller exists
        const password = await bcrypt.hash('generandoideas2025', 10)

        const seller = await prisma.user.upsert({
            where: { email: sellerEmail },
            update: { password: password }, // Force update password
            create: {
                email: sellerEmail,
                name: sellerName || 'Vendedor',
                password: password,
                role: 'SELLER',
            },
        })

        // Create Order
        const customerName = `${row['Nombre Cliente'] || ''} ${row['Apellido Cliente'] || ''}`.trim()
        const company = row['Nombre Empresa'] || ''
        const address = `${row['Dirección. Calle'] || ''} ${row['#exterior #Interior '] || ''}, ${row['Colonia'] || ''}, ${row['Delegación'] || ''}, ${row['Estado'] || ''}, CP ${row['CP'] || ''}`.trim()

        // Store all raw details as JSON string just in case
        const details = JSON.stringify(row)

        await prisma.order.create({
            data: {
                customerName,
                company,
                address,
                details,
                giftType: row['Tipo de Regalo'],
                sellerId: seller.id,
                status: 'PENDING'
            }
        })
    }

    console.log('Seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
