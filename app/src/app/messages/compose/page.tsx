'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendEmail, getEmailAccounts } from '@/app/actions/email';
import styles from './page.module.css';
import { useMessageModal } from '@/lib/message-modal-context';

export default function ComposePage() {
  const router = useRouter();
  const modal = useMessageModal();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    setSending(true);
    setError('');

    const toList = to.split(',').map(e => {
      const trimmed = e.trim();
      return trimmed.includes('<')
        ? { name: trimmed.split('<')[0].trim(), email: trimmed.split('<')[1].replace('>', '').trim() }
        : { name: trimmed, email: trimmed };
    });

    // Try to get SMTP config from saved account
    let smtpConfig = undefined;
    try {
      const accounts = await getEmailAccounts();
      if (accounts.success && accounts.data && accounts.data.length > 0) {
        const acct = accounts.data[0];
        smtpConfig = {
          host: acct.smtp_host,
          port: acct.smtp_port,
          user: acct.smtp_user,
          pass: acct.smtp_pass || '',
          fromName: acct.display_name,
          fromEmail: acct.email,
        };
      }
    } catch {}

    const res = await sendEmail({
      to: toList,
      subject,
      body_text: body,
      smtp_config: smtpConfig,
    });

    setSending(false);
    if (res.success) {
      modal.showSuccess('Éxito', 'Mensaje enviado correctamente.');
    } else {
      modal.showError('Error', res.error || 'Error al enviar. Verifica la configuración SMTP en Configuración > Correo.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/messages" className="btn btn--ghost">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Volver
        </Link>
        <h1 className="text-headline">Redactar mensaje</h1>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Para</label>
          <input
            className={styles.input}
            placeholder="email@ejemplo.com"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Asunto</label>
          <input
            className={styles.input}
            placeholder="Asunto del mensaje"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Mensaje</label>
          <textarea
            className={styles.textarea}
            placeholder="Escribe tu mensaje..."
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: 'var(--color-error)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Link href="/messages" className="btn btn--ghost">Cancelar</Link>
          <button
            className="btn btn--primary"
            disabled={sending}
            onClick={handleSend}
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>

    </div>
  );
}
