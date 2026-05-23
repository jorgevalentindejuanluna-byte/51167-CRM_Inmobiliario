import { MOCK_LEADS, toUUID } from '@/lib/mock-data';
import { LeadDetailClient } from './LeadDetailClient';

export async function generateStaticParams() {
  const params = [];
  for (const lead of MOCK_LEADS) {
    // Parámetro con ID original (e.g. 'lead-001')
    params.push({ id: lead.id });
    
    // Parámetro con UUID determinista
    const uuid = toUUID(lead.id);
    if (uuid) {
      params.push({ id: uuid });
    }
  }
  return params;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <LeadDetailClient id={resolvedParams.id} />;
}
