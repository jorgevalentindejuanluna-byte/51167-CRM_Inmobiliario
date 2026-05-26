'use client';

import Link from 'next/link';
import styles from './page.module.css';

const sections = [
  {
    title: 'Mensajería',
    description: 'Configuración de correo electrónico, WhatsApp, plantillas y firma',
    items: [
      {
        href: '/settings/messaging',
        icon: 'chat',
        color: 'var(--color-primary)',
        label: 'Centro de Mensajería',
        desc: 'Gestiona todas las configuraciones de comunicación',
      },
    ],
  },
  {
    title: 'Correo Electrónico',
    description: 'Servidor SMTP, cuentas y firma de correo',
    items: [
      {
        href: '/settings/email',
        icon: 'mail',
        color: 'var(--color-secondary)',
        label: 'Servidor SMTP',
        desc: 'Configura el envío de correos electrónicos desde el CRM',
      },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="text-headline">Configuración</h1>
        <p className="text-helper text-muted">Gestiona la configuración de tu agencia</p>
      </header>

      {sections.map(section => (
        <div key={section.title} className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className="text-title">{section.title}</h2>
            <p className="text-helper text-muted">{section.description}</p>
          </div>
          <div className={styles.grid}>
            {section.items.map(item => (
              <Link key={item.href} href={item.href} className={`card ${styles.card}`}>
                <div className={styles.cardIcon}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: item.color }}>
                    {item.icon}
                  </span>
                </div>
                <div className={styles.cardContent}>
                  <h3 className="text-title" style={{ fontSize: '0.95rem' }}>{item.label}</h3>
                  <p className="text-helper text-muted">{item.desc}</p>
                </div>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-outline)' }}>chevron_right</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
