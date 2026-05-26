'use client';

import Link from 'next/link';
import styles from './page.module.css';

const modules = [
  {
    href: '/settings/email',
    icon: 'mail',
    bg: 'rgba(242, 190, 140, 0.12)',
    color: 'var(--color-primary)',
    label: 'Servidor SMTP',
    desc: 'Configura el servidor de correo saliente para enviar emails desde el CRM',
    badge: { text: 'Listo', className: styles.badgeReady },
  },
  {
    href: '/settings/messaging/signature',
    icon: 'edit_note',
    bg: 'rgba(64, 239, 183, 0.12)',
    color: 'var(--color-secondary)',
    label: 'Firma de Correo',
    desc: 'Personaliza la firma que se adjunta al final de cada correo electrónico',
    badge: { text: 'Listo', className: styles.badgeReady },
  },
  {
    href: '/settings/messaging/whatsapp',
    icon: 'chat',
    bg: 'rgba(37, 211, 102, 0.12)',
    color: '#25D366',
    label: 'WhatsApp Business',
    desc: 'Conecta tu número de WhatsApp Business para enviar y recibir mensajes',
    badge: { text: 'Próximamente', className: styles.badgeSoon },
  },
  {
    href: '/settings/messaging/templates',
    icon: 'article',
    bg: 'rgba(167, 204, 234, 0.12)',
    color: 'var(--color-tertiary)',
    label: 'Plantillas de Mensajes',
    desc: 'Crea y gestiona plantillas para respuestas rápidas y automatizaciones',
    badge: { text: 'Próximamente', className: styles.badgeSoon },
  },
];

export default function MessagingSettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/settings" className="btn btn--ghost btn--sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Volver
        </Link>
        <h1 className="text-headline">Centro de Mensajería</h1>
        <p className="text-helper text-muted">Configura todos los canales de comunicación de tu agencia</p>
      </div>

      <div className={styles.grid}>
        {modules.map(mod => (
          <Link key={mod.href} href={mod.href} className={`card ${styles.card}`}>
            <div className={styles.cardIcon} style={{ background: mod.bg }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: mod.color }}>
                {mod.icon}
              </span>
            </div>
            <div className={styles.cardContent}>
              <h3 className="text-title">
                {mod.label}
                <span className={`${styles.badge} ${mod.badge.className}`}>{mod.badge.text}</span>
              </h3>
              <p className="text-helper text-muted">{mod.desc}</p>
            </div>
            {mod.badge.text === 'Listo' && (
              <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>chevron_right</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
