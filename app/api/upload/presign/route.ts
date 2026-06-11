import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
    const { filename, contentType, folder } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename et contentType requis' }, { status: 400 });
    }

    const ext = filename.split('.').pop()?.toLowerCase() || 'mp4';
    const key = `${folder || 'uploads'}/${Date.now()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presignedUrl = await getSignedUrl(r2 as any, command, { expiresIn: 3600 });
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ presignedUrl, publicUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur génération URL' }, { status: 500 });
  }
}
