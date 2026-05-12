import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import PropertyModal from '../../../../components/PropertyModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default async function BienPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (!property) notFound();

  return (
    <main className="bg-[#f5f2ec] min-h-screen pt-32 px-16">
      <PropertyModal property={property} onClose={() => {}} />
    </main>
  );
}
