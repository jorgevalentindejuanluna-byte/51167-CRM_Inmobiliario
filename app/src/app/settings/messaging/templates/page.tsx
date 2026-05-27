'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function TemplatesSettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/settings/messaging" className="btn btn--ghost btn--sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Volver
        </Link>
        <h1 className="text-headline">Plantillas de Mensajes</h1>
        <p className="text-helper text-muted">Crea y gestiona plantillas para respuestas rápidas y automatizaciones</p>
      </div>

      <div className={`card ${styles.placeholder}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-tertiary)' }}>article</span>
        <h3>Próximamente</h3>
        <p>El módulo de plantillas de mensajes estará disponible en una próxima actualización. Podrás crear plantillas reutilizables para email, WhatsApp y SMS.</p>
      </div>
    </div>
  );
}
