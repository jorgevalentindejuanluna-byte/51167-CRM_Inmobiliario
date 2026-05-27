'use client';

import { useState, useRef, useEffect } from 'react';

interface DocumentViewerProps {
  url: string;
  fileName: string;
  fileType?: string;
  metadata?: Record<string, any>;
}

export default function DocumentViewer({ url, fileName, fileType, metadata }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const isPdf = ext === 'pdf' || fileType === 'application/pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext);

  useEffect(() => {
    setZoom(1);
    setLoaded(false);
    setLoadError(false);
  }, [url]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
  };

  const sig = metadata?.signatures;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>{fileName}</span>
        {isPdf && (
          <>
            <button className="btn btn--ghost btn--sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} title="Alejar">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>zoom_out</span>
            </button>
            <span style={{ fontSize: '0.75rem', minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button className="btn btn--ghost btn--sm" onClick={() => setZoom(z => Math.min(3, z + 0.25))} title="Acercar">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>zoom_in</span>
            </button>
          </>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm" title="Abrir en nueva pestaña">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
        </a>
        <button className="btn btn--ghost btn--sm" onClick={handleDownload} title="Descargar">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
        </button>
      </div>

      {/* Viewer */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#e8e8e8', borderRadius: 'var(--radius-md)', minHeight: 300 }}>
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" />
          </div>
        )}
        {loadError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', padding: '2rem', minHeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-error)' }}>error_outline</span>
            <p style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center' }}>
              No se ha podido cargar el archivo desde el almacenamiento.
            </p>
            <button className="btn btn--primary" onClick={handleDownload}>
              <span className="material-symbols-outlined">download</span>
              Descargar {fileName}
            </button>
          </div>
        ) : isPdf ? (
          <iframe
            ref={iframeRef}
            src={url}
            onLoad={() => setLoaded(true)}
            onError={() => setLoadError(true)}
            style={{
              width: '100%', height: '100%', border: 'none', minHeight: 500,
              transform: `scale(${zoom})`, transformOrigin: 'top left',
            }}
            title={fileName}
          />
        ) : isImage ? (
          <img
            src={url}
            alt={fileName}
            onLoad={() => setLoaded(true)}
            onError={() => setLoadError(true)}
            style={{
              maxWidth: '100%', maxHeight: '100%', display: 'block', margin: '0 auto',
              transform: `scale(${zoom})`, transformOrigin: 'top center',
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', padding: '2rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--color-on-surface-variant)' }}>description</span>
            <p style={{ color: 'var(--color-on-surface-variant)', textAlign: 'center' }}>Vista previa no disponible para este tipo de archivo</p>
            <button className="btn btn--primary" onClick={handleDownload}>
              <span className="material-symbols-outlined">download</span>
              Descargar {fileName}
            </button>
          </div>
        )}
      </div>

      {/* Security info */}
      {sig && (
        <div style={{ padding: '0.75rem', background: 'var(--color-surface-lowest)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', border: '1px solid var(--color-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
            Datos de Seguridad
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 0.75rem' }}>
            {sig.firmante && <><span style={{ color: 'var(--color-on-surface-variant)' }}>Firmante:</span><span>{sig.firmante}</span></>}
            {sig.signed_at && <><span style={{ color: 'var(--color-on-surface-variant)' }}>Firma:</span><span>{new Date(sig.signed_at).toLocaleString('es-ES')}</span></>}
            {sig.hash_documento && <><span style={{ color: 'var(--color-on-surface-variant)' }}>Hash:</span><code style={{ fontSize: '0.65rem', wordBreak: 'break-all' }}>{sig.hash_documento}</code></>}
            {sig.hash_firmado && <><span style={{ color: 'var(--color-on-surface-variant)' }}>Hash Firma:</span><code style={{ fontSize: '0.65rem', wordBreak: 'break-all' }}>{sig.hash_firmado}</code></>}
            {sig.signature_image_url && (
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', textAlign: 'center' }}>
                <img src={sig.signature_image_url} alt="Firma" style={{ maxHeight: 60, border: '1px solid var(--color-outline-variant)', borderRadius: 4 }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}