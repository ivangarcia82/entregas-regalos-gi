import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;

    if (!file) {
        return NextResponse.json({ error: 'No files received.' }, { status: 400 });
    }

    try {
        const buffer = await file.arrayBuffer();
        const filename = `${orderId}_${Date.now()}_${file.name.replaceAll(' ', '_')}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Supabase Storage Error:', error);
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('uploads')
            .getPublicUrl(filename);

        await prisma.order.update({
            where: { id: orderId },
            data: {
                evidenceUrl: publicUrl,
                status: 'IN_REVIEW'
            }
        });

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
