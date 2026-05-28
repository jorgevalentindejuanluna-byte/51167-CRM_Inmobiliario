import { LeadDetailClient } from './LeadDetailClient';

export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <LeadDetailClient id={resolvedParams.id} />;
}
