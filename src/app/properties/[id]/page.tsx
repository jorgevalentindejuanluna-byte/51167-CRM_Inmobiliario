import { PropertyDetailClient } from './PropertyDetailClient';

export const dynamic = 'force-dynamic';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <PropertyDetailClient key={resolvedParams.id} id={resolvedParams.id} />;
}
