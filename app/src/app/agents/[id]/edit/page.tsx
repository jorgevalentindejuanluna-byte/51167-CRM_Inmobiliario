import { MOCK_AGENTS, toUUID } from '@/lib/mock-data';
import EditAgentClient from './EditAgentClient';

export function generateStaticParams() {
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

export default async function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditAgentClient id={id} />;
}
