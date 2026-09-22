import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { url } = await request.json();

    // L'URL doit être un média de ce site : sinon n'importe quelle clé du
    // bucket pouvait être supprimée en forgeant la requête.
    const prefix = `${process.env.R2_PUBLIC_URL}/`;
    if (typeof url !== 'string' || !url.startsWith(prefix)) {
      return NextResponse.json({ error: 'URL non autorisée' }, { status: 400 });
    }
    const key = url.slice(prefix.length);
    if (!/^(photos|videos)\/[\w.-]+$/.test(key)) {
      return NextResponse.json({ error: 'Chemin non autorisé' }, { status: 400 });
    }

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