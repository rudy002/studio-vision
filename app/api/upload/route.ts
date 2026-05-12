import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nettoie le nom : décode HTML entities, supprime tout caractère spécial
    const cleanName = file.name
      .replace(/&amp;/g, '-')
      .replace(/&#x5[Bb];/gi, '-')
      .replace(/&#x5[Dd];/gi, '-')
      .replace(/ampx5[Bb]/gi, '-')
      .replace(/ampx5[Dd]/gi, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();

    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
    const filename = `${folder}/${Date.now()}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    }));

    const url = `${process.env.R2_PUBLIC_URL}/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 });
  }
}