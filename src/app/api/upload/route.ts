import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;

    if (!file) {
        return NextResponse.json({ error: 'No files received.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = orderId + '_' + Date.now() + '_' + file.name.replaceAll(' ', '_');

    // Ensure directory exists - simplified for now, assuming public/uploads exists or handled manually
    // In production, use S3.
    const uploadDir = path.join(process.cwd(), 'public/uploads');

    // NOTE: In Node/Nextjs in some environments (Vercel), writing to public at runtime isn't persistent.
    // But for this local/VPS task it is fine.
    try {
        // Create uploads dir if not exists logic?
        // I'll assume it exists or I'll create it via command line
        await writeFile(path.join(uploadDir, filename), buffer);

        const evidenceUrl = `/uploads/${filename}`;

        await prisma.order.update({
            where: { id: orderId },
            data: {
                evidenceUrl: evidenceUrl,
                status: 'IN_REVIEW'
            }
        });

        return NextResponse.json({ success: true, url: evidenceUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
