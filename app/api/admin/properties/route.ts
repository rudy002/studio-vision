import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/auth';

/**
 * Écritures sur les biens, réservées à l'admin connecté.
 *
 * Elles passaient auparavant par le navigateur avec la clé publique Supabase,
 * ce qui obligeait à laisser la table ouverte en écriture à tout le monde.
 * Ici la clé de service ne quitte jamais le serveur : la table peut être
 * fermée en écriture côté Supabase.
 *
 * Tant que SUPABASE_SERVICE_ROLE_KEY n'est pas renseignée, on retombe sur la
 * clé publique : le comportement reste celui d'avant, rien ne casse.
 */
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);

export const serviceKeyConfigured = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const payload = await request.json();
  const { error } = await db.from('properties').insert(payload);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id, payload } = await request.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await db.from('properties').update(payload).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
  const { error } = await db.from('properties').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
