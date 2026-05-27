'use client';

import { useEffect, useState, useRef } from 'react';
import { uploadFile } from '@/app/actions/documents';
import styles from './page.module.css';

interface DocRequest {
  id: string;
  agency_id: string;
  lead_id: string | null;
  property_id: string | null;
  contact_name: string;
  contact_email: string;
  doc_type: string;
  notes: string;
  status: string;
  token: string;
  created_at: string;
}

export default function PublicDocRequestPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [request, setRequest] = useState<DocRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/doc-request?token=${token}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Solicitud de documentación no encontrada o enlace caducado');
          throw new Error('Error al cargar la solicitud');
        }
        return res.json();
      })
      .then((resData) => {
        if (resData.success && resData.data) {
          if (resData.data.status === 'completada') {
            setSuccess(true);
          } else {
            setRequest(resData.data);
          }
        } else {
          throw new Error('Datos incorrectos del servidor');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleFileUpload = async (file: File) => {
    if (!token || !request) return;
    if (file.size > 15 * 1024 * 1024) {
      setError('El archivo excede el límite de 15 MB permitido.');
      return;
    }

    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Formato no permitido. Solo se aceptan archivos PDF, PNG, JPG o JPEG.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const folder = 'client-uploads';
      const fileName = `${Date.now()}_${file.name}`;
      const path = `${request.agency_id}/${folder}/${fileName}`;

      // 1. Subir el archivo al Storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'documents');
      formData.append('path', path);
      
      const uploadRes = await uploadFile(formData);
      if (!uploadRes.success) throw new Error(uploadRes.error || 'Error al subir el archivo');

      // 2. Notificar a la API para registrar el archivo y completar la solicitud
      const putRes = await fetch('/api/doc-request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          file_path: uploadRes.path || path,
          file_name: file.name,
          file_size: file.size,
        }),
      });

      if (!putRes.ok) {
        const putData = await putRes.json();
        throw new Error(putData.error || 'Error al registrar el documento');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error en el procesamiento del archivo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={`card ${styles.card}`}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem' }}>
            <div className={styles.spinner} />
            <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>Cargando portal seguro...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={`card ${styles.card}`} style={{ borderTop: '4px solid var(--color-error)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-error)' }}>error</span>
            <h3 style={{ margin: 0, color: 'var(--color-on-surface)' }}>No se pudo acceder</h3>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', maxWidth: '380px' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={`card ${styles.card}`} style={{ borderTop: '4px solid var(--color-secondary)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '3rem', textAlign: 'center' }}>
            <span className="material-symbols-outlined animate-success" style={{ fontSize: '64px', color: 'var(--color-secondary)' }}>verified</span>
            <h2 style={{ margin: 0, color: 'var(--color-on-surface)', fontWeight: 700 }}>¡Envío Completado!</h2>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.95rem', maxWidth: '420px', lineHeight: '1.6' }}>
              El documento se ha cargado de forma encriptada en la ficha de la agencia. Un agente revisará la documentación en las próximas horas.
            </p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.85rem', opacity: 0.8 }}>
              Ya puede cerrar esta pestaña de forma segura.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`card ${styles.card}`}>
        <div className={styles.cardHeader}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '32px' }}>vpn_lock</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Pasarela de Carga Inmobiliaria</h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-on-surface-variant)' }}>Conexión encriptada SSL de 256 bits</p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div style={{ marginBottom: '1.5rem', background: 'var(--color-surface-container-low)', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid var(--color-primary)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documento solicitado</span>
            <h3 style={{ margin: '0.25rem 0', fontSize: '1.2rem', color: 'var(--color-on-surface)', fontWeight: 600 }}>{request?.doc_type}</h3>
            {request?.notes && (
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', lineHeight: '1.5' }}>
                <strong>Indicaciones:</strong> {request.notes}
              </p>
            )}
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Hola <strong>{request?.contact_name}</strong>. Por favor, arrastre o seleccione el archivo solicitado para enviarlo directamente al gestor de expedientes de la agencia.
          </p>

          <div 
            className={styles.dropZone}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>upload_file</span>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Haga clic para seleccionar o arrastre el archivo</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>Formatos permitidos: PDF, PNG, JPG, JPEG (Máx 15MB)</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className={styles.hiddenInput}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />

          {submitting && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <div className={styles.spinner} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>Encriptando y subiendo archivo...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
