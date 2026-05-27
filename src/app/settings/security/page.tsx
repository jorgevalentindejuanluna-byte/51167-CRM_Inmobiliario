'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { toggleMfa } from '@/app/actions/auth-otp';
import styles from './page.module.css';

export default function SecuritySettingsPage() {
  const { user, refreshUser } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.user_metadata?.mfa_enabled) {
      setMfaEnabled(true);
    }
  }, [user]);

  const handleToggleMfa = async () => {
    const newValue = !mfaEnabled;
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('rts_access_token') || '';
      const res = await toggleMfa(newValue, token);
      if (res.success) {
        setMfaEnabled(newValue);
        setMessage({ type: 'success', text: 'Configuración de seguridad actualizada correctamente.' });
        await refreshUser();
      } else {
        setMessage({ type: 'error', text: res.error || 'Error al actualizar configuración' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error de red al actualizar seguridad' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/settings" className="btn btn--ghost btn--sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Volver
        </Link>
        <h1 className="text-headline">Seguridad y Acceso</h1>
        <p className="text-helper text-muted">Gestiona la protección de tu cuenta y la verificación en dos pasos.</p>
      </div>

      <div className={`card ${styles.settingsCard}`}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>security</span>
            <div>
              <h3 className="text-title">Autenticación de Dos Factores (OTP)</h3>
              <p className="text-helper text-muted">
                Al activar esta opción, se enviará un código numérico de 6 dígitos a tu correo electrónico cada vez que intentes iniciar sesión.
              </p>
            </div>
          </div>
          <div className={styles.settingAction}>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={mfaEnabled} 
                onChange={handleToggleMfa} 
                disabled={saving}
              />
              <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
          </div>
        </div>
      </div>

      {message && (
        <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          {message.text}
        </div>
      )}
    </div>
  );
}
