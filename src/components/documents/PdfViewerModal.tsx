'use client';

import { useState, useEffect } from 'react';

interface PdfViewerModalProps {
  url: string;
  fileName: string;
  fileType?: string;
  metadata?: Record<string, any>;
  onClose: () => void;
}

export default function PdfViewerModal({ url, fileName, fileType, metadata, onClose }: PdfViewerModalProps) {
  const [loading, setLoading] = useState(true);

  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const isPdf = ext === 'pdf' || fileType === 'application/pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sig = metadata?.signatures;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          background: 'rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20 }}>picture_as_pdf</span>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileName}
        </span>

        <button className="btn btn--ghost btn--sm" style={{ color: '#fff' }} onClick={handleDownload} title="Descargar">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
        </button>

        <button className="btn btn--ghost btn--sm" style={{ color: '#fff', marginLeft: '0.25rem' }} onClick={onClose} title="Cerrar">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'stretch', justifyContent: 'center', padding: '1rem' }}>
        {isPdf ? (
          <>
            {loading && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 10 }}>
                <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Cargando PDF...</span>
              </div>
            )}
            <iframe
              src={`${url}#toolbar=1`}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8, background: '#fff' }}
              title={fileName}
              onLoad={() => setLoading(false)}
            />
          </>
        ) : isImage ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <img
              src={url} alt={fileName}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem', color: 'rgba(255,255,255,0.7)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'rgba(255,255,255,0.4)' }}>description</span>
            <p>Vista previa no disponible para este tipo de archivo</p>
            <button className="btn btn--primary" onClick={handleDownload}>
              <span className="material-symbols-outlined">download</span>
              Descargar {fileName}
            </button>
          </div>
        )}
      </div>

      {sig && (
        <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', flexShrink: 0, maxHeight: 160, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>verified</span>
            Datos de Seguridad
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.2rem 0.75rem' }}>
            {sig.firmante && <><span style={{ opacity: 0.6 }}>Firmante:</span><span>{sig.firmante}</span></>}
            {sig.signed_at && <><span style={{ opacity: 0.6 }}>Firma:</span><span>{new Date(sig.signed_at).toLocaleString('es-ES')}</span></>}
            {sig.hash_documento && <><span style={{ opacity: 0.6 }}>Hash:</span><code style={{ fontSize: '0.65rem', wordBreak: 'break-all', color: 'rgba(255,255,255,0.5)' }}>{sig.hash_documento}</code></>}
            {sig.hash_firmado && <><span style={{ opacity: 0.6 }}>Hash Firma:</span><code style={{ fontSize: '0.65rem', wordBreak: 'break-all', color: 'rgba(255,255,255,0.5)' }}>{sig.hash_firmado}</code></>}
            {sig.signature_image_url && (
              <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem', textAlign: 'center' }}>
                <img src={sig.signature_image_url} alt="Firma" style={{ maxHeight: 40, borderRadius: 4, background: '#fff' }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
