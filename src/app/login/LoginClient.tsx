'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthSignIn } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { sendLoginOtp } from '@/app/actions/auth-otp';
import styles from './page.module.css';

// Función para hashear en frontend y comparar
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function LoginClient() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  
  const [step, setStep] = useState<'credentials' | 'otp' | 'success'>('credentials');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP State
  const [otp, setOtp] = useState('');
  const [hashedOtp, setHashedOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [userName, setUserName] = useState('');

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
        const userName = data.user?.user_metadata?.name || email.split('@')[0];
        const isMfaEnabled = data.user?.user_metadata?.mfa_enabled === true;

        if (isMfaEnabled) {
          // Enviar OTP
          const res = await sendLoginOtp(email, userName);
          if (res.success && res.hash) {
            setTempToken(data.access_token);
            setHashedOtp(res.hash);
            setUserName(userName);
            setStep('otp');
          } else {
            throw new Error(res.error || 'Error al enviar código OTP');
          }
        } else {
          // MFA desactivado: login directo
          localStorage.setItem('rts_access_token', data.access_token);
          setUserName(userName);
          await refreshUser();
          setStep('success');
        }
      } else {
        throw new Error('Credenciales incorrectas');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const inputHash = await sha256(otp);
      if (inputHash === hashedOtp) {
        // OTP Correcto
        localStorage.setItem('rts_access_token', tempToken);
        await refreshUser();
        setStep('success');
      } else {
        setError('Código incorrecto. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      setError('Error validando el código.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, router]);

  return (
    <div className={styles.loginPage}>
      {/* Fondo decorativo */}
      <div className={styles.bgGlow} />
      <div className={styles.bgGlow2} />

      {step === 'success' ? (
        <div className={styles.successOverlay}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <span className="material-symbols-outlined">how_to_reg</span>
            </div>
            <h2>¡Hola, {userName}!</h2>
            <p>{email}</p>
            <div className={styles.loadingDots}>
              <span></span><span></span><span></span>
            </div>
            <p className={styles.redirectText}>Accediendo a tu área de trabajo...</p>
          </div>
        </div>
      ) : (
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
            {step === 'credentials' && (
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
                  <div style={{ position: 'relative' }}>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-outline)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                      title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
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
                    'Siguiente'
                  )}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className={styles.form}>
                <div className={styles.formHeader}>
                  <h2 className="text-headline">Verificación en dos pasos</h2>
                  <p className="text-helper text-muted">Hemos enviado un código de 6 dígitos a <strong>{email}</strong></p>
                </div>

                {error && (
                  <div className={styles.errorBox}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                    {error}
                  </div>
                )}

                <div className="input-group" style={{ marginTop: '10px', marginBottom: '10px' }}>
                  <label className="input-label" htmlFor="login-otp">Contraclave numérica</label>
                  <input
                    id="login-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    className="input"
                    placeholder="------"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ 
                      fontSize: '20px', 
                      letterSpacing: '12px', 
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      padding: '16px'
                    }}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className={`btn btn--primary ${styles.loginBtn}`}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner} />
                      Validando...
                    </>
                  ) : (
                    'Acceder al CRM'
                  )}
                </button>

                <div className={styles.formOptions} style={{ justifyContent: 'center', marginTop: '16px' }}>
                  <button 
                    type="button" 
                    className="btn btn--ghost btn--sm" 
                    onClick={() => { setStep('credentials'); setOtp(''); }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                    Volver
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
