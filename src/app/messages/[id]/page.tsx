import MessageDetailClient from './MessageDetailClient';

export const dynamic = 'force-dynamic';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <MessageDetailClient params={params} />;
}
