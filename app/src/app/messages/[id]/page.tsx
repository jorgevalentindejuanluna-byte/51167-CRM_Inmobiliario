import { MOCK_EMAIL_THREADS } from '@/lib/mock-data';
import MessageDetailClient from './MessageDetailClient';

export function generateStaticParams() {
  return MOCK_EMAIL_THREADS.map(thread => ({ id: thread.id }));
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <MessageDetailClient params={params} />;
}
