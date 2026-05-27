'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getEmailAccounts, saveEmailAccount } from '@/app/actions/email';
import styles from './page.module.css';

interface EmailAccountForm {
  // SMTP
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  encryption: 'ssl' | 'tls' | 'starttls';

  // IMAP
  imapHost: string;
  imapPort: number;
  imapUser: string;
  imapPass: string;
  imapEncryption: 'ssl' | 'tls' | 'starttls';
}

const emptyForm: EmailAccountForm = {
  host: '',
  port: 587,
  user: '',
  pass: '',
  fromName: '',
  fromEmail: '',
  encryption: 'starttls',
  imapHost: '',
  imapPort: 993,
  imapUser: '',
  imapPass: '',
  imapEncryption: 'ssl',
};

export default function EmailSettingsPage() {
  const [form, setForm] = useState<EmailAccountForm>(emptyForm);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'smtp' | 'imap'>('smtp');

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
          imapHost: acct.imap_host || '',
          imapPort: acct.imap_port || 993,
          imapUser: acct.imap_user || '',
          imapPass: '',
          imapEncryption: (acct.imap_encryption as any) || 'ssl',
        });
      }
    });
  }, []);

  const update = (field: keyof EmailAccountForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    setTestResult(null);
  };

  const handleTest = async () => {
    // Only test SMTP for now
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
        smtp_encryption: form.encryption,
        imap_host: form.imapHost,
        imap_port: form.imapPort,
        imap_user: form.imapUser,
        imap_pass: form.imapPass,
        imap_encryption: form.imapEncryption,
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
        <h1 className="text-headline">Cuentas de Correo</h1>
        <p className="text-helper text-muted">Configura tus servidores de envío (SMTP) y recepción (IMAP) para integrar el correo en el CRM.</p>
      </div>

      <div className={`card ${styles.alert}`}>
        <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)' }}>info</span>
        <p>Asegúrate de proporcionar los datos correctos proporcionados por tu proveedor de hosting (Google Workspace, Microsoft 365 o propio).</p>
      </div>

      <div className={`card ${styles.formCard}`}>
        
        {/* Pestañas (Tabs) */}
        <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--color-outline-variant)', marginBottom: '24px' }}>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '12px 16px', 
              cursor: 'pointer', 
              borderBottom: activeTab === 'smtp' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'smtp' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontWeight: activeTab === 'smtp' ? 600 : 400
            }}
            onClick={() => setActiveTab('smtp')}
          >
            Servidor de Envío (SMTP)
          </button>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '12px 16px', 
              cursor: 'pointer', 
              borderBottom: activeTab === 'imap' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'imap' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontWeight: activeTab === 'imap' ? 600 : 400
            }}
            onClick={() => setActiveTab('imap')}
          >
            Servidor de Recepción (IMAP)
          </button>
        </div>

        {activeTab === 'smtp' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 className="text-title">Configuración SMTP</h3>

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
                  onChange={e => update('encryption', e.target.value as any)}
                >
                  <option value="starttls">STARTTLS (587)</option>
                  <option value="ssl">SSL/TLS (465)</option>
                  <option value="tls">TLS (587)</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Usuario SMTP</label>
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
                placeholder="Contraseña de aplicación o email"
                value={form.pass}
                onChange={e => update('pass', e.target.value)}
              />
            </div>

            <h3 className="text-title" style={{ marginTop: '1.5rem' }}>Identidad del Remitente</h3>

            <div className={styles.field}>
              <label className={styles.label}>Nombre a mostrar</label>
              <input
                className={styles.input}
                placeholder="Real Top State"
                value={form.fromName}
                onChange={e => update('fromName', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Dirección de envío principal</label>
              <input
                className={styles.input}
                placeholder="info@real-top-state.com"
                value={form.fromEmail}
                onChange={e => update('fromEmail', e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'imap' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 className="text-title">Configuración IMAP</h3>
            <p className="text-helper text-muted" style={{ marginBottom: '16px' }}>
              Permite al CRM recibir y sincronizar los correos de tus clientes directamente en la plataforma.
            </p>

            <div className={styles.field}>
              <label className={styles.label}>Servidor IMAP</label>
              <input
                className={styles.input}
                placeholder="imap.ejemplo.com"
                value={form.imapHost}
                onChange={e => update('imapHost', e.target.value)}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Puerto</label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="993"
                  value={form.imapPort}
                  onChange={e => update('imapPort', Number(e.target.value))}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Cifrado</label>
                <select
                  className={styles.input}
                  value={form.imapEncryption}
                  onChange={e => update('imapEncryption', e.target.value as any)}
                >
                  <option value="ssl">SSL/TLS (993)</option>
                  <option value="starttls">STARTTLS (143)</option>
                  <option value="tls">TLS</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Usuario IMAP</label>
              <input
                className={styles.input}
                placeholder="tu@email.com"
                value={form.imapUser}
                onChange={e => update('imapUser', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Contraseña</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Contraseña de aplicación o email"
                value={form.imapPass}
                onChange={e => update('imapPass', e.target.value)}
              />
            </div>
          </div>
        )}

        {testResult && (
          <div className={`${styles.testResult} ${testResult.success ? styles.testSuccess : styles.testError}`} style={{ marginTop: '24px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {testResult.success ? 'check_circle' : 'error'}
            </span>
            {testResult.message}
          </div>
        )}

        {saved && (
          <div className={styles.testSuccess} style={{ marginTop: '24px', padding: '0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-secondary)' }}>check_circle</span>
            Configuración guardada correctamente
          </div>
        )}

        <div className={styles.actions} style={{ marginTop: '32px' }}>
          <button
            className="btn btn--secondary"
            onClick={handleTest}
            disabled={testing || !form.host || !form.user}
          >
            {testing ? 'Enviando prueba...' : 'Probar Envío SMTP'}
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
                  <p className="text-helper text-muted">
                    Envío: {acct.smtp_host}:{acct.smtp_port} <br/>
                    Recepción: {acct.imap_host ? `${acct.imap_host}:${acct.imap_port}` : 'Sin configurar'}
                  </p>
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
