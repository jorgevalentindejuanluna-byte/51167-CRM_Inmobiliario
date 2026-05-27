'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEmailThreadMessages, useEmailThreads } from '@/lib/use-data';
import { markThreadAsRead, toggleThreadFlag, moveThreadToFolder, sendEmail } from '@/app/actions/email';
import type { EmailFolder } from '@/lib/models/types';
import styles from './page.module.css';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function MessageDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: messages, loading } = useEmailThreadMessages(id);
  const { data: threads } = useEmailThreads();
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const thread = threads.find(t => t.id === id);

  useEffect(() => {
    if (thread?.flags.includes('unread')) {
      markThreadAsRead(id);
    }
  }, [id, thread?.flags]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !thread) return;
    setSending(true);
    await sendEmail({
      to: [{ name: thread.participants.split(',')[0].trim(), email: '' }],
      subject: `Re: ${thread.subject}`,
      body_text: replyText,
      thread_id: id,
    });
    setReplyText('');
    setSending(false);
  };

  const handleToggleStar = async () => {
    await toggleThreadFlag(id, 'starred');
  };

  const handleToggleImportant = async () => {
    await toggleThreadFlag(id, 'important');
  };

  const handleMoveTo = async (folder: EmailFolder) => {
    await moveThreadToFolder(id, folder);
    router.push('/messages');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <span className="material-symbols-outlined">hourglass_top</span>
          <span>Cargando mensaje...</span>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <span className="material-symbols-outlined">error_outline</span>
          <span>Mensaje no encontrado</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/messages" className={styles.backBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Volver
        </Link>
        <div style={{ flex: 1 }} />
        <button className="btn btn--ghost btn--icon" onClick={handleToggleStar} title={thread.flags.includes('starred') ? 'Quitar estrella' : 'Marcar estrella'}>
          <span className="material-symbols-outlined" style={{ color: thread.flags.includes('starred') ? 'var(--color-warning)' : undefined }}>
            {thread.flags.includes('starred') ? 'star' : 'star_outline'}
          </span>
        </button>
        <button className="btn btn--ghost btn--icon" onClick={handleToggleImportant} title="Marcar como importante">
          <span className={`material-symbols-outlined ${thread.flags.includes('important') ? 'material-symbols-outlined--filled' : ''}`}>priority_high</span>
        </button>
        <button className="btn btn--ghost btn--icon" onClick={() => handleMoveTo('archived')} title="Archivar">
          <span className="material-symbols-outlined">archive</span>
        </button>
        <button className="btn btn--ghost btn--icon" onClick={() => handleMoveTo('trash')} title="Mover a papelera">
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>

      <div className={styles.threadInfo}>
        <div className={styles.threadSubject}>{thread.subject}</div>
        <div className={styles.threadMeta}>
          <span>{thread.participants}</span>
          <span>·</span>
          <span>{thread.message_count} mensajes</span>
        </div>
      </div>

      <div className={styles.messageList}>
        {messages.map(msg => (
          <div key={msg.id} className={styles.messageCard}>
            <div className={styles.messageHeader}>
              <div className={styles.senderInfo}>
                <div className={styles.avatar}>{msg.from_name[0]}</div>
                <div>
                  <div className={styles.senderName}>{msg.from_name}</div>
                  <div className={styles.senderEmail}>{msg.from_email}</div>
                </div>
              </div>
              <div className={styles.msgDate}>{formatDate(msg.sent_at || msg.received_at)}</div>
            </div>
            <div className={styles.messageBody}>{msg.body_text}</div>
            {msg.attachments && msg.attachments.length > 0 && (
              <div className={styles.attachments}>
                {msg.attachments.map(att => (
                  <div key={att.id} className={styles.attachmentItem}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {att.mime_type.includes('pdf') ? 'picture_as_pdf' : att.mime_type.includes('image') ? 'image' : 'attach_file'}
                    </span>
                    <span>{att.filename}</span>
                    <span className={styles.attachmentSize}>({formatSize(att.size)})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.replyBox}>
        <div className={styles.replyHeader}>Responder</div>
        <textarea
          className={styles.replyTextarea}
          placeholder="Escribe tu respuesta..."
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
        />
        <div className={styles.replyActions}>
          <button className="btn btn--ghost" onClick={() => setReplyText('')}>Descartar</button>
          <button
            className="btn btn--primary"
            disabled={!replyText.trim() || sending}
            onClick={handleSendReply}
          >
            {sending ? 'Enviando...' : 'Enviar respuesta'}
          </button>
        </div>
      </div>
    </div>
  );
}
