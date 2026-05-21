'use client';

import { useRouter } from 'next/navigation';
import PropertyModal from './PropertyModal';
import { Property } from './PropertyCard';

export default function PropertyPageWrapper({ property }: { property: Property }) {
  const router = useRouter();
  return <PropertyModal property={property} onClose={() => router.back()} />;
}
