import { MOCK_PROPERTIES, toUUID } from '@/lib/mock-data';
import { PropertyDetailClient } from './PropertyDetailClient';

export function generateStaticParams() {
  return MOCK_PROPERTIES.flatMap(property => {
    const params = [{ id: property.id }];
    const uuid = toUUID(property.id);
    if (uuid) params.push({ id: uuid });
    return params;
  });
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PropertyDetailClient key={resolvedParams.id} id={resolvedParams.id} />;
}
