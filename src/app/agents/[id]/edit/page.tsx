import EditAgentClient from './EditAgentClient';

export const dynamic = 'force-dynamic';

export default async function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditAgentClient id={id} />;
}
