'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthSignIn } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('carlos@realtopstate.es');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      // Login real en Supabase
      const data = await supabaseAuthSignIn(email, password);
      
      if (data && data.access_token) {
        localStorage.setItem('rts_access_token', data.access_token);
        
        // Actualizar el contexto de autenticación
        await refreshUser();
        
        router.push('/dashboard');
      } else {
        throw new Error('No se recibió el token de acceso');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Fondo decorativo */}
      <div className={styles.bgGlow} />
      <div className={styles.bgGlow2} />

      <div className={styles.loginContainer}>
        {/* Panel izquierdo: Branding */}
        <div className={styles.brandPanel}>
          <div className={styles.brandContent}>
            <div className={styles.logoBlock}>
              <div className={styles.logoIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>apartment</span>
              </div>
              <h1 className={styles.brandName}>Real Top State</h1>
              <p className={styles.brandTag}>CRM Inmobiliario</p>
            </div>
            <div className={styles.brandFeatures}>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">psychology</span>
                <div>
                  <strong>IA Predictiva</strong>
                  <p>Lead scoring y matching automático</p>
                </div>
              </div>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">shield</span>
                <div>
                  <strong>Cumplimiento RGPD</strong>
                  <p>Gestión de consentimiento integrada</p>
                </div>
              </div>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">draw</span>
                <div>
                  <strong>Firma Digital</strong>
                  <p>AutoFirma y firma biométrica</p>
                </div>
              </div>
              <div className={styles.feature}>
                <span className="material-symbols-outlined">description</span>
                <div>
                  <strong>Gestor Documental</strong>
                  <p>Flujo bidireccional agencia-cliente</p>
                </div>
              </div>
            </div>
            <p className={styles.brandFooter}>
              Plataforma SaaS para agencias inmobiliarias en España
            </p>
          </div>
        </div>

        {/* Panel derecho: Formulario */}
        <div className={styles.formPanel}>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formHeader}>
              <h2 className="text-headline">Iniciar sesión</h2>
              <p className="text-helper text-muted">Accede al panel de gestión de tu agencia</p>
            </div>

            {error && (
              <div className={styles.errorBox}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            <div className="input-group">
              <label className="input-label" htmlFor="login-email">Email corporativo</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="tu@agencia.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkLabel}>
                <input type="checkbox" defaultChecked />
                <span>Recordar sesión</span>
              </label>
              <a href="#" className={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
            </div>

            <button
              type="submit"
              className={`btn btn--primary ${styles.loginBtn}`}
              disabled={loading}
              id="btn-login"
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Verificando...
                </>
              ) : (
                'Acceder al CRM'
              )}
            </button>

            <p className={styles.demoHint}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
              Demo: usa <code>carlos@realtopstate.es</code> con cualquier contraseña
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
