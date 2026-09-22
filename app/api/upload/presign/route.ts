import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/** Seuls ces dossiers et ces types de fichiers sont acceptés. */
const FOLDERS = ['photos', 'videos'] as const;
const EXTENSIONS: Record<string, string[]> = {
  photos: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  videos: ['mp4', 'webm', 'mov', 'm4v'],
};

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { filename, contentType, folder } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename et contentType requis' }, { status: 400 });
    }

    // Sans ces contrôles, une session admin pouvait déposer n'importe quel
    // fichier (script, HTML…) n'importe où dans le bucket.
    const dir = FOLDERS.includes(folder) ? (folder as (typeof FOLDERS)[number]) : null;
    if (!dir) {
      return NextResponse.json({ error: 'Dossier non autorisé' }, { status: 400 });
    }
    const expected = dir === 'photos' ? 'image/' : 'video/';
    if (!String(contentType).startsWith(expected)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
    }
    const ext = String(filename).split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSIONS[dir].includes(ext)) {
      return NextResponse.json({ error: 'Extension non autorisée' }, { status: 400 });
    }

    const key = `${dir}/${Date.now()}.${ext}`;

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
