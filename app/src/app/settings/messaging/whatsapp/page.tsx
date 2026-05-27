'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function WhatsAppSettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/settings/messaging" className="btn btn--ghost btn--sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Volver
        </Link>
        <h1 className="text-headline">WhatsApp Business</h1>
        <p className="text-helper text-muted">Conecta tu número de WhatsApp Business API</p>
      </div>

      <div className={`card ${styles.placeholder}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#25D366' }}>chat</span>
        <h3>Próximamente</h3>
        <p>La integración con WhatsApp Business API estará disponible en una próxima actualización. Podrás enviar y recibir mensajes, notificaciones y alertas directamente desde el CRM.</p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-secondary)' }}>check_circle</span>
            Notificaciones automáticas a clientes
          </div>
          <div className={styles.feature}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-secondary)' }}>check_circle</span>
            Plantillas de mensajes aprobadas
          </div>
          <div className={styles.feature}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-secondary)' }}>check_circle</span>
            Historial de conversaciones
          </div>
        </div>
      </div>
    </div>
  );
}
