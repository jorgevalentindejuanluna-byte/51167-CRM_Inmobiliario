import { MOCK_PROPERTIES, toUUID } from '@/lib/mock-data';
import { PropertyDetailClient } from './PropertyDetailClient';

export async function generateStaticParams() {
  const params = [];
  for (const property of MOCK_PROPERTIES) {
    // Parámetro con ID original (e.g. 'prop-001')
    params.push({ id: property.id });
    
    // Parámetro con UUID determinista
    const uuid = toUUID(property.id);
    if (uuid) {
      params.push({ id: uuid });
    }
  }
  return params;
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PropertyDetailClient id={resolvedParams.id} />;
}
