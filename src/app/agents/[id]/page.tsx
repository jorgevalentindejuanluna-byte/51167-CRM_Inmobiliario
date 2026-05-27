import { MOCK_AGENTS, toUUID } from '@/lib/mock-data';
import AgentDetailClient from './AgentDetailClient';

export async function generateStaticParams() {
  const params = [];
  for (const agent of MOCK_AGENTS) {
    params.push({ id: agent.id });
    const uuid = toUUID(agent.id);
    if (uuid) {
      params.push({ id: uuid });
    }
  }
  return params;
}

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentDetailClient id={id} />;
}
