'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SignatureSettingsPage() {
  const [signature, setSignature] = useState(
    '---\n' +
    'Real Top State CRM\n' +
    'Tu inmobiliaria de confianza\n' +
    'T. +34 900 123 456\n' +
    'info@real-top-state.com\n' +
    'www.real-top-state.com'
  );
  const [previewHtml, setPreviewHtml] = useState(
    `<div style="font-family: Arial, sans-serif; font-size: 13px; color: #333; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px;">
      <strong>Real Top State CRM</strong><br>
      <span style="color: #666;">Tu inmobiliaria de confianza</span><br>
      <span style="color: #888;">T. +34 900 123 456</span><br>
      <a href="mailto:info@real-top-state.com" style="color: #1a73e8;">info@real-top-state.com</a><br>
      <a href="https://www.real-top-state.com" style="color: #1a73e8;">www.real-top-state.com</a>
    </div>`
  );
  const [saved, setSaved] = useState(false);
  const [expiryYears, setExpiryYears] = useState(5);

  useEffect(() => {
    const saved = localStorage.getItem('signed_url_expiry_years');
    if (saved) setExpiryYears(Number(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem('signed_url_expiry_years', String(expiryYears));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/settings/messaging" className="btn btn--ghost btn--sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Volver
        </Link>
        <h1 className="text-headline">Firma de Correo</h1>
        <p className="text-helper text-muted">Personaliza la firma que se adjunta automáticamente al final de cada correo</p>
      </div>

      <div className={`card ${styles.formCard}`}>
        <h3 className="text-title">Firma en texto plano</h3>
        <textarea
          className={styles.textarea}
          rows={6}
          value={signature}
          onChange={e => setSignature(e.target.value)}
        />

        <h3 className="text-title" style={{ marginTop: '1.5rem' }}>Firma HTML (vista previa)</h3>
        <textarea
          className={styles.textarea}
          rows={6}
          value={previewHtml}
          onChange={e => setPreviewHtml(e.target.value)}
        />

        <div className={styles.preview}>
          <h4 className={styles.previewLabel}>Vista previa:</h4>
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline-variant)', margin: '1rem 0' }} />

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Duración URLs firmadas (años)</label>
          <p className={styles.fieldDesc}>Tiempo durante el cual el enlace de descarga del documento firmado será válido</p>
          <input
            className={styles.input}
            type="number"
            min={1}
            max={99}
            value={expiryYears}
            onChange={e => setExpiryYears(Math.max(1, Number(e.target.value)))}
          />
        </div>

        {saved && (
          <div className={styles.savedBanner}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-secondary)' }}>check_circle</span>
            Firma guardada correctamente
          </div>
        )}

        <div className={styles.actions}>
          <button className="btn btn--primary" onClick={handleSave}>
            Guardar Firma
          </button>
        </div>
      </div>
    </div>
  );
}
