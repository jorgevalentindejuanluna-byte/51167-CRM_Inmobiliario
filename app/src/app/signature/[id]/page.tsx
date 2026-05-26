'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

interface StrokePoint {
  x: number;
  y: number;
  t: number;
  p?: number;
}

interface SignatureRequest {
  id: string;
  title: string;
  type: string;
  signer_name: string;
  signer_id: string | null;
  signer_email: string | null;
  document: {
    id: string;
    name: string;
    type: string;
    url: string;
    created_at: string;
  } | null;
  created_at: string;
  expires_at: string | null;
}

interface SignResult {
  biometric_summary: {
    strokes_count: number;
    average_speed: string;
    average_pressure: string;
    max_pressure: string;
    duration_ms: number;
    device: string;
  };
  document: {
    hash_original: string;
    hash_firmado: string;
    signed_at: string;
  };
}

type Step = 'summary' | 'sign' | 'confirm';

export default function BiometricSignaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [signatureId, setSignatureId] = useState<string | null>(null);
  const [request, setRequest] = useState<SignatureRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('summary');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SignResult | null>(null);
  const [signedDocUrl, setSignedDocUrl] = useState('');
  const [signerDocument, setSignerDocument] = useState('');

  useEffect(() => {
    params.then((p) => setSignatureId(p.id));
  }, [params]);

  useEffect(() => {
    if (!signatureId) return;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const url = token ? `/api/signatures/${signatureId}?token=${token}` : `/api/signatures/${signatureId}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Solicitud de firma no encontrada');
          if (res.status === 410) throw new Error('Esta solicitud de firma ya fue completada o ha expirado');
          if (res.status === 403) throw new Error('Enlace de firma inválido o caducado');
          throw new Error('Error al cargar la solicitud de firma');
        }
        return res.json();
      })
      .then((data: SignatureRequest) => {
        if (data.type !== 'biometric') {
          throw new Error('Esta URL no corresponde a una firma biométrica');
        }
        setRequest(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [signatureId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={`card ${styles.card}`}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Cargando solicitud de firma...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={`card ${styles.card}`}>
          <div className={styles.errorState}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-error)' }}>gpp_maybe</span>
            <h2>No se puede procesar la firma</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className={styles.container}>
      <div className={`card ${styles.card}`}>
        <div className={styles.steps}>
          <div className={`${styles.stepDot} ${step === 'summary' ? styles.stepActive : styles.stepDone}`} />
          <div className={styles.stepLine} />
          <div className={`${styles.stepDot} ${step === 'sign' ? styles.stepActive : step === 'confirm' ? styles.stepDone : ''}`} />
          <div className={styles.stepLine} />
          <div className={`${styles.stepDot} ${step === 'confirm' ? styles.stepActive : ''}`} />
        </div>

        <div className={styles.stepLabels}>
          <span>Resumen</span>
          <span>Firma</span>
          <span>Confirmación</span>
        </div>

        {step === 'summary' && (
          <SummaryStep
            request={request}
            signerDocument={signerDocument}
            onSignerDocumentChange={setSignerDocument}
            onStart={() => setStep('sign')}
          />
        )}

        {step === 'sign' && (
          <SignStep
            request={request}
            submitting={submitting}
            onBack={() => setStep('summary')}
            onSubmit={async (strokes, canvasImage) => {
              setSubmitting(true);
              try {
                const res = await fetch(`/api/signatures/${signatureId}/sign`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    strokes,
                    signature_image: canvasImage,
                    signer_id: signerDocument || undefined,
                  }),
                });

                if (!res.ok) {
                  const errData = await res.json();
                  throw new Error(errData.error || 'Error al guardar la firma');
                }

                const data = await res.json();
                setResult(data as SignResult);
                setSignedDocUrl(data.signed_document_url || '');
                setStep('confirm');
              } catch (err: any) {
                setError(err.message || 'Error al procesar la firma');
              } finally {
                setSubmitting(false);
              }
            }}
          />
        )}

        {step === 'confirm' && result && (
          <ConfirmStep request={request} result={result} signedDocUrl={signedDocUrl} />
        )}
      </div>

      <div className={styles.brand}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-primary)' }}>domain</span>
        Real Top State CRM — Firma Biométrica
      </div>
    </div>
  );
}

function SummaryStep({
  request,
  onStart,
}: {
  request: SignatureRequest;
  signerDocument: string;
  onSignerDocumentChange: (v: string) => void;
  onStart: () => void;
}) {
  return (
    <div className={styles.stepContent}>
      <div className={styles.stepIcon}>
        <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-primary)' }}>description</span>
      </div>

      <h2 className={styles.stepTitle}>Resumen del Documento</h2>

      <div className={styles.infoGrid}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Documento</span>
          <span className={styles.infoValue}>{request.title}</span>
        </div>
        {request.document && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Archivo</span>
            <span className={styles.infoValue}>{request.document.name}</span>
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Firmante</span>
          <span className={styles.infoValue}>{request.signer_name}</span>
        </div>
        {request.signer_email && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{request.signer_email}</span>
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Fecha solicitud</span>
          <span className={styles.infoValue}>
            {new Date(request.created_at).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Tipo</span>
          <span className={styles.infoValue}>
            <span className={styles.badge}>Firma Biométrica Presencial</span>
          </span>
        </div>
      </div>

      <div className={styles.legalNotice}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-tertiary)' }}>info</span>
        <p>Al firmar electrónicamente este documento, usted reconoce haber leído y aceptado los términos del mismo. La firma biométrica captura datos únicos del trazo, presión y velocidad, proporcionando evidencia legal de su identidad y consentimiento.</p>
      </div>

      <button className={`btn btn--primary btn--lg ${styles.fullWidth}`} onClick={onStart}>
        <span className="material-symbols-outlined">edit_square</span>
        Comenzar Firma
      </button>
    </div>
  );
}

function SignStep({
  request,
  submitting,
  onBack,
  onSubmit,
}: {
  request: SignatureRequest;
  submitting: boolean;
  onBack: () => void;
  onSubmit: (strokes: StrokePoint[], canvasImage?: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<StrokePoint[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#f2be8c';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#f2be8c';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (strokes.length > 1) {
        ctx.beginPath();
        ctx.moveTo(strokes[0].x, strokes[0].y);
        for (let i = 1; i < strokes.length; i++) {
          ctx.lineTo(strokes[i].x, strokes[i].y);
        }
        ctx.stroke();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [strokes]);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, t: Date.now(), p: 0.5 };

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      t: Date.now(),
      p: e.touches ? (e.touches[0].force || 0.5) : 0.5,
    };
  };

  const startDrawing = (e: any) => {
    const pos = getPos(e);
    setIsDrawing(true);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    setStrokes([pos]);
    setHasDrawn(true);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();

    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    setStrokes((prev) => [...prev, pos]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStrokes([]);
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    if (strokes.length < 2) return;
    const canvas = canvasRef.current;
    const canvasImage = canvas ? canvas.toDataURL('image/png') : undefined;
    onSubmit(strokes, canvasImage);
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepIcon}>
        <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-primary)' }}>border_color</span>
      </div>

      <h2 className={styles.stepTitle}>Firme el Documento</h2>
      <p className={styles.stepSubtitle}>Utilice su dedo o un stylus para firmar en el recuadro inferior</p>

      <div className={styles.documentInfo}>
        <span className={styles.docBadge}>{request.title}</span>
        <span>Firmante: <strong>{request.signer_name}</strong></span>
      </div>

      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className={styles.signControls}>
        <button className="btn btn--secondary btn--sm" onClick={clearCanvas} disabled={!hasDrawn}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
          Limpiar
        </button>
        <button className="btn btn--ghost btn--sm" onClick={onBack}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Volver
        </button>
      </div>

      <button
        className={`btn btn--primary btn--lg ${styles.fullWidth}`}
        onClick={handleSubmit}
        disabled={strokes.length < 2 || submitting}
      >
        {submitting ? (
          <>
            <div className={styles.btnSpinner} />
            Procesando firma...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">verified</span>
            Confirmar y Firmar
          </>
        )}
      </button>

      <p className={styles.hint}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--color-primary)' }}>info</span>
        Al firmar, se capturarán datos biométricos del trazo (coordenadas, presión, velocidad) como evidencia legal.
      </p>
    </div>
  );
}

function ConfirmStep({
  request,
  result,
  signedDocUrl,
}: {
  request: SignatureRequest;
  result: SignResult;
  signedDocUrl?: string;
}) {
  const durationSeconds = (result.biometric_summary.duration_ms / 1000).toFixed(1);
  const signedDate = new Date(result.document.signed_at).toLocaleString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className={styles.stepContent}>
      <div className={styles.successIcon}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-secondary)' }}>verified</span>
      </div>

      <h2 className={styles.stepTitle}>Documento Firmado con Éxito</h2>
      <p className={styles.stepSubtitle}>La firma biométrica ha sido registrada y almacenada de forma segura.</p>

      <div className={styles.confirmCard}>
        <h3 className={styles.confirmSectionTitle}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>description</span>
          Documento
        </h3>
        <div className={styles.confirmGrid}>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Título</span>
            <span className={styles.confirmValue}>{request.title}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Firmante</span>
            <span className={styles.confirmValue}>{request.signer_name}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Fecha firma</span>
            <span className={styles.confirmValue}>{signedDate}</span>
          </div>
        </div>
      </div>

      <div className={styles.confirmCard}>
        <h3 className={styles.confirmSectionTitle}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>biotech</span>
          Datos Biométricos Capturados
        </h3>
        <div className={styles.confirmGrid}>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Puntos del trazo</span>
            <span className={styles.confirmValue}>{result.biometric_summary.strokes_count}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Velocidad media</span>
            <span className={styles.confirmValue}>{result.biometric_summary.average_speed}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Presión media</span>
            <span className={styles.confirmValue}>{result.biometric_summary.average_pressure}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Presión máxima</span>
            <span className={styles.confirmValue}>{result.biometric_summary.max_pressure}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Duración firma</span>
            <span className={styles.confirmValue}>{durationSeconds} segundos</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Dispositivo</span>
            <span className={styles.confirmValue}>{result.biometric_summary.device}</span>
          </div>
        </div>
      </div>

      <div className={styles.confirmCard}>
        <h3 className={styles.confirmSectionTitle}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>fingerprint</span>
          Identificación del Documento Firmado
        </h3>
        <div className={styles.confirmGrid}>
          <div className={styles.hashRow}>
            <span className={styles.confirmLabel}>Hash SHA-256 original</span>
            <code className={styles.hash}>{result.document.hash_original}</code>
          </div>
          <div className={styles.hashRow}>
            <span className={styles.confirmLabel}>Hash SHA-256 firmado</span>
            <code className={styles.hash}>{result.document.hash_firmado}</code>
          </div>
        </div>
      </div>

      <div className={styles.footerNote}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-secondary)' }}>verified_user</span>
        <p>Firma biométrica válida según el Reglamento eIDAS (UE) N.º 910/2014. Los datos biométricos y hashes han sido sellados en la base de datos.</p>
      </div>

      <div className={styles.actions}>
        {signedDocUrl && (
          <a
            href={signedDocUrl}
            target="_blank"
            className={`btn btn--secondary btn--lg ${styles.fullWidth}`}
            style={{ textDecoration: 'none' }}
          >
            <span className="material-symbols-outlined">download</span>
            Descargar Documento Firmado
          </a>
        )}
        <button
          className={`btn btn--primary btn--lg ${styles.fullWidth}`}
          onClick={() => window.print()}
        >
          <span className="material-symbols-outlined">print</span>
          Imprimir Comprobante
        </button>
        {request.document?.id && (
          <a
            href="/documents"
            className={`btn btn--ghost btn--lg ${styles.fullWidth}`}
            style={{ textDecoration: 'none' }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Volver al CRM
          </a>
        )}
      </div>
    </div>
  );
}
