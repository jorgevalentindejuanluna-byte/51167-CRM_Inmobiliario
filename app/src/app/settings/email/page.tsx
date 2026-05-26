'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEmailAccounts, saveEmailAccount } from '@/app/actions/email';
import styles from './page.module.css';

interface SmtpForm {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  encryption: 'ssl' | 'tls' | 'starttls';
}

const emptyForm: SmtpForm = {
  host: '',
  port: 587,
  user: '',
  pass: '',
  fromName: '',
  fromEmail: '',
  encryption: 'starttls',
};

export default function EmailSettingsPage() {
  const [form, setForm] = useState<SmtpForm>(emptyForm);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('smtp_config');
    let localEmail = '';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        localEmail = parsed.fromEmail || '';
        setForm(prev => ({ ...prev, ...parsed }));
      } catch {}
    }

    getEmailAccounts().then(res => {
      if (!res.success || !res.data || res.data.length === 0) return;

      // Deduplicar: última cuenta por email (más reciente)
      const map = new Map<string, any>();
      for (const acct of res.data) {
        if (acct.email) map.set(acct.email, acct);
      }
      const unique = Array.from(map.values());
      setAccounts(unique);

      // Cargar desde la cuenta que coincida con localStorage, o la primera
      const match = localEmail ? unique.find((a: any) => a.email === localEmail) : null;
      const acct = match || unique[unique.length - 1];
      if (acct && (!saved || match)) {
        setForm({
          host: acct.smtp_host || '',
          port: acct.smtp_port || 587,
          user: acct.smtp_user || '',
          pass: '',
          fromName: acct.display_name || '',
          fromEmail: acct.email || '',
          encryption: (acct.smtp_encryption as any) || 'starttls',
        });
      }
    });
  }, []);

  const update = (field: keyof SmtpForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [{ name: 'Test', email: form.fromEmail }],
          subject: 'Prueba de configuración SMTP',
          body_text: 'Este es un correo de prueba desde Real Top State CRM. Si recibes esto, la configuración SMTP es correcta.',
          smtp_config: {
            host: form.host,
            port: form.port,
            user: form.user,
            pass: form.pass,
            fromName: form.fromName,
            fromEmail: form.fromEmail,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: 'Correo de prueba enviado correctamente. Revisa la bandeja de entrada.' });
      } else {
        setTestResult({ success: false, message: data.error || 'Error al enviar correo de prueba' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error de conexión' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);
    try {
      const res = await saveEmailAccount({
        email: form.fromEmail,
        display_name: form.fromName,
        smtp_host: form.host,
        smtp_port: form.port,
        smtp_user: form.user,
        smtp_pass: form.pass,
        provider: 'other',
        sync_enabled: true,
      } as any);

      // Persistir en localStorage como respaldo
      localStorage.setItem('smtp_config', JSON.stringify(form));

      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setTestResult({ success: false, message: res.error || 'Error al guardar en el servidor' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error al guardar' });
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
        <h1 className="text-headline">Configuración de Correo</h1>
        <p className="text-helper text-muted">Configura una cuenta SMTP para enviar correos desde el CRM</p>
      </div>

      <div className={`card ${styles.alert}`}>
        <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)' }}>info</span>
        <p>Los correos se envían a través de tu servidor SMTP. También puedes usar variables de entorno: <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USER</code>, <code>SMTP_PASS</code>.</p>
      </div>

      <div className={`card ${styles.formCard}`}>
        <h3 className="text-title">Servidor SMTP</h3>

        <div className={styles.field}>
          <label className={styles.label}>Servidor SMTP</label>
          <input
            className={styles.input}
            placeholder="smtp.ejemplo.com"
            value={form.host}
            onChange={e => update('host', e.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Puerto</label>
            <input
              className={styles.input}
              type="number"
              placeholder="587"
              value={form.port}
              onChange={e => update('port', Number(e.target.value))}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Cifrado</label>
            <select
              className={styles.input}
              value={form.encryption}
              onChange={e => update('encryption', e.target.value)}
            >
              <option value="starttls">STARTTLS (587)</option>
              <option value="ssl">SSL/TLS (465)</option>
              <option value="tls">TLS (587)</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Usuario</label>
          <input
            className={styles.input}
            placeholder="tu@email.com"
            value={form.user}
            onChange={e => update('user', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Contraseña</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Contraseña SMTP"
            value={form.pass}
            onChange={e => update('pass', e.target.value)}
          />
        </div>

        <h3 className="text-title" style={{ marginTop: '1.5rem' }}>Remitente</h3>

        <div className={styles.field}>
          <label className={styles.label}>Nombre del remitente</label>
          <input
            className={styles.input}
            placeholder="Real Top State"
            value={form.fromName}
            onChange={e => update('fromName', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Dirección de envío</label>
          <input
            className={styles.input}
            placeholder="info@real-top-state.com"
            value={form.fromEmail}
            onChange={e => update('fromEmail', e.target.value)}
          />
        </div>

        {testResult && (
          <div className={`${styles.testResult} ${testResult.success ? styles.testSuccess : styles.testError}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {testResult.success ? 'check_circle' : 'error'}
            </span>
            {testResult.message}
          </div>
        )}

        {saved && (
          <div className={styles.testSuccess} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-secondary)' }}>check_circle</span>
            Configuración guardada correctamente
          </div>
        )}

        <div className={styles.actions}>
          <button
            className="btn btn--secondary"
            onClick={handleTest}
            disabled={testing || !form.host || !form.user}
          >
            {testing ? 'Enviando prueba...' : 'Enviar Correo de Prueba'}
          </button>
          <button
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saving || !form.host || !form.user || !form.fromEmail}
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>

      {accounts.length > 0 && (
        <div className={`card ${styles.listCard}`}>
          <h3 className="text-title">Cuentas configuradas</h3>
          {accounts.map((acct: any) => (
            <div key={acct.id} className={styles.accountItem}>
              <div className={styles.accountInfo}>
                <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>check_circle</span>
                <div>
                  <strong>{acct.display_name}</strong>
                  <p className="text-helper text-muted">{acct.email} · {acct.smtp_host}:{acct.smtp_port}</p>
                </div>
              </div>
              <span className={`badge badge--success`}>Activa</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
