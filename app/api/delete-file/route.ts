import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
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
    const { url } = await request.json();
    
    // Extrait le chemin du fichier depuis l'URL publique
    const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');

    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}