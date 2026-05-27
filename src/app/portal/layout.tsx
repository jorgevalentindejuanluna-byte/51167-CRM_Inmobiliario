'use client';

import React from 'react';
import styles from './layout.module.css';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.portalContainer}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>
            real_estate_agent
          </span>
          <span className={styles.logoText}>Real Top State <span className={styles.portalTag}>Portal Cliente</span></span>
        </div>
        <nav className={styles.nav}>
          <button className="btn btn--ghost btn--sm">
            <span className="material-symbols-outlined">help_outline</span>
            Ayuda
          </button>
          <button className="btn btn--ghost btn--sm">
            <span className="material-symbols-outlined">logout</span>
            Salir
          </button>
        </nav>
      </header>
      
      <main className={styles.main}>
        {children}
      </main>
      
      <footer className={styles.footer}>
        <p>© 2026 Real Top State CRM - Conectando personas con su hogar ideal.</p>
        <div className={styles.footerLinks}>
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
        </div>
      </footer>
    </div>
  );
}
