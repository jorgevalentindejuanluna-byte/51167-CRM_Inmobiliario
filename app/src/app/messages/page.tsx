'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useEmailThreads } from '@/lib/use-data';
import { EMAIL_FOLDER_LABELS, EMAIL_FOLDER_ICONS } from '@/lib/constants';
import type { EmailFolder } from '@/lib/models/types';
import styles from './page.module.css';

const FOLDERS: { key: EmailFolder | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'inbox', label: 'Recibidos' },
  { key: 'sent', label: 'Enviados' },
  { key: 'drafts', label: 'Borradores' },
  { key: 'archived', label: 'Archivados' },
  { key: 'spam', label: 'Spam' },
  { key: 'trash', label: 'Papelera' },
];

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return date.toLocaleDateString('es-ES', { weekday: 'short' });
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function MessagesPage() {
  const [folder, setFolder] = useState<EmailFolder | 'all'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: threads, loading } = useEmailThreads(folder === 'all' ? undefined : folder);

  const unreadCount = useMemo(() => threads.filter(t => t.flags.includes('unread')).length, [threads]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter(t =>
      t.subject.toLowerCase().includes(q) ||
      t.snippet.toLowerCase().includes(q) ||
      t.participants.toLowerCase().includes(q)
    );
  }, [threads, searchQuery]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className="text-headline">Mensajes</h1>
          {unreadCount > 0 && <span className={styles.unreadCount}>{unreadCount} no leídos</span>}
        </div>
        <Link href="/messages/compose" className={`btn btn--primary ${styles.composeBtn}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
          Redactar
        </Link>
      </div>

      <div className={styles.folderNav}>
        {FOLDERS.map(f => (
          <button
            key={f.key}
            className={`${styles.folderBtn} ${folder === f.key ? styles.folderBtnActive : ''}`}
            onClick={() => setFolder(f.key)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {f.key === 'all' ? 'all_inbox' : EMAIL_FOLDER_ICONS[f.key]}
            </span>
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-on-surface-variant)' }}>search</span>
          <input
            className={styles.searchInput}
            placeholder="Buscar en mensajes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.threadList}>
        {loading ? (
          <div className={styles.emptyState}>
            <span className={`material-symbols-outlined ${styles.emptyIcon}`}>mail</span>
            <p>Cargando mensajes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={`material-symbols-outlined ${styles.emptyIcon}`}>
              {searchQuery ? 'search_off' : 'inbox'}
            </span>
            <p>{searchQuery ? 'Sin resultados' : `No hay mensajes en ${EMAIL_FOLDER_LABELS[folder as EmailFolder] || 'esta carpeta'}`}</p>
          </div>
        ) : (
          filtered.map(thread => (
            <Link
              key={thread.id}
              href={`/messages/${thread.id}`}
              className={`${styles.threadItem} ${thread.flags.includes('unread') ? styles.threadUnread : ''}`}
            >
              <div className={styles.threadContent}>
                <div className={styles.threadRow}>
                  {thread.flags.includes('unread') && <span className={styles.unreadDot} />}
                  <span className={styles.threadSubject}>{thread.subject}</span>
                </div>
                <div className={styles.threadSnippet}>{thread.snippet}</div>
              </div>
              <div className={styles.threadFlags}>
                {thread.flags.includes('starred') && <span className={`material-symbols-outlined ${styles.flagIcon}`}>star</span>}
                {thread.flags.includes('attachment') && <span className={`material-symbols-outlined ${styles.attachmentIcon}`}>attachment</span>}
                {thread.flags.includes('important') && <span className={`material-symbols-outlined ${styles.flagIcon}`}>priority_high</span>}
              </div>
              <div className={styles.threadMeta}>
                <span className={styles.threadDate}>{formatRelativeDate(thread.last_message_at)}</span>
                <span className={styles.threadParticipants}>{thread.participants}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
