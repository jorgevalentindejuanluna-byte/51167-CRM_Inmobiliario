'use client';

import { useState, useRef } from 'react';
import type { Lead } from '@/lib/models/types';
import { formatDate } from '@/lib/constants';

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean | 'conditional';
}

const SELLER_DOCUMENTS: DocumentRequirement[] = [
  { id: 'dni_anverso', name: 'DNI/NIE (Anverso)', description: 'Cara frontal del documento de identidad.', required: true },
  { id: 'dni_reverso', name: 'DNI/NIE (Reverso)', description: 'Cara posterior del documento de identidad.', required: true },
  { id: 'escritura', name: 'Escritura de propiedad', description: 'Acredita cómo adquirió el inmueble.', required: true },
  { id: 'nota_simple', name: 'Nota simple registral', description: 'Titularidad, cargas, hipotecas o embargos.', required: true },
  { id: 'certificado_energetico', name: 'Certificado de eficiencia energética', description: 'Obligatorio para vender (salvo excepciones).', required: true },
  { id: 'ibi', name: 'Último recibo del IBI', description: 'Acredita referencia catastral y situación fiscal.', required: true },
  { id: 'cert_comunidad', name: 'Certificado deuda con comunidad', description: 'Emitido por el administrador si hay comunidad.', required: 'conditional' },
  { id: 'cert_hipoteca', name: 'Certificado deuda hipotecaria', description: 'Emitido por el banco si existe hipoteca.', required: 'conditional' },
  { id: 'cedula', name: 'Cédula de habitabilidad', description: 'Depende de la normativa autonómica.', required: 'conditional' },
  { id: 'suministros', name: 'Recibos de suministros', description: 'Recomendable para demostrar pago de luz, agua, etc.', required: false },
  { id: 'estatutos', name: 'Estatutos de la comunidad', description: 'Recomendable si existen limitaciones de uso.', required: false },
];

const BUYER_DOCUMENTS: DocumentRequirement[] = [
  { id: 'dni_anverso', name: 'DNI/NIE/Pasaporte (Anverso)', description: 'Cara frontal del documento de identidad.', required: true },
  { id: 'dni_reverso', name: 'DNI/NIE/Pasaporte (Reverso)', description: 'Cara posterior del documento de identidad.', required: true },
  { id: 'datos_personales', name: 'Ficha KYC / Datos personales', description: 'Estado civil, régimen matrimonial, nacionalidad.', required: true },
  { id: 'origen_fondos', name: 'Justificante de origen de fondos', description: 'PBC: Extractos, nóminas, IRPF o ventas previas.', required: true },
  { id: 'medios_pago', name: 'Justificante de medios de pago', description: 'Justificante de transferencias o cheques bancarios.', required: true },
  { id: 'contrato_arras', name: 'Contrato de arras', description: 'Necesario si se entregaron cantidades previas.', required: 'conditional' },
  { id: 'hipoteca', name: 'Documentación hipotecaria', description: 'FEIN, tasación y escritura de préstamo.', required: 'conditional' },
  { id: 'poder_notarial', name: 'Poder notarial', description: 'Necesario si compra representado por terceros.', required: 'conditional' },
  { id: 'datos_bancarios', name: 'Certificado de titularidad bancaria', description: 'Para pagos, impuestos o provisiones.', required: false },
  { id: 'impuestos', name: 'Liquidación de impuestos', description: 'ITP o IVA+AJD para registro posterior.', required: false },
];

interface UploadedStatus {
  uploadedAt: string;
  via: 'Agente' | 'Portal Cliente';
  aiAnalyzed?: boolean;
}

export default function LeadDocumentChecklist({ lead }: { lead: Lead }) {
  const isSeller = lead.tipo_lead === 'vendedor';
  const isBuyer = lead.tipo_lead === 'comprador' || lead.tipo_lead === 'inversor';
  
  const documents = isSeller ? SELLER_DOCUMENTS : isBuyer ? BUYER_DOCUMENTS : [];
  
  const [docStatuses, setDocStatuses] = useState<Record<string, UploadedStatus>>({});
  const [aiAnalyzing, setAiAnalyzing] = useState<string | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const currentDocs = documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const totalRequired = documents.length;
  const totalUploaded = Object.keys(docStatuses).length;
  const totalMissing = totalRequired - totalUploaded;

  if (documents.length === 0) return null; // Solo mostrar para comprador/vendedor/inversor/propietario

  const handleUploadClick = (docId: string) => {
    setActiveDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && activeDocId) {
      const now = new Date().toISOString();
      setDocStatuses((prev) => ({
        ...prev,
        [activeDocId]: { uploadedAt: now, via: 'Agente' }
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const simulateAiAnalysis = (docId: string) => {
    setAiAnalyzing(docId);
    setTimeout(() => {
      setDocStatuses((prev) => {
        const current = prev[docId];
        if (!current) return prev;
        return { ...prev, [docId]: { ...current, aiAnalyzed: true } };
      });
      setAiAnalyzing(null);
    }, 2000);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
      
      {/* Cabecera y Estadísticas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>folder_shared</span>
            Gestión Documental SaaS
            <span className="badge badge--outline" style={{ marginLeft: '8px', textTransform: 'capitalize' }}>
              {lead.tipo_lead}
            </span>
          </h3>
          <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
            Panel de validación documental. El cliente también puede subir archivos por su Portal.
          </p>
        </div>

        <div style={{ background: 'var(--color-surface-variant)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', gap: '1.5rem', border: '1px solid var(--color-outline-variant)' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Total</span>
            <strong style={{ fontSize: '1.25rem' }}>{totalRequired}</strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Aportados</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-success)' }}>{totalUploaded}</strong>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Faltan</span>
            <strong style={{ fontSize: '1.25rem', color: '#d32f2f' }}>{totalMissing}</strong>
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      {/* Grid de documentos (4 por página) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {currentDocs.map((doc) => {
          const statusObj = docStatuses[doc.id];
          const isUploaded = !!statusObj;
          const isAnalyzed = statusObj?.aiAnalyzed;
          const isAnalyzing = aiAnalyzing === doc.id;

          return (
            <div 
              key={doc.id} 
              style={{ 
                border: '1px solid var(--color-outline-variant)', 
                borderRadius: '8px', 
                padding: '1.25rem',
                background: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.875rem', lineHeight: 1.3 }}>{doc.name}</strong>
                  {doc.required === true && (
                    <span style={{ fontSize: '0.65rem', background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Oblig.</span>
                  )}
                  {doc.required === 'conditional' && (
                    <span style={{ fontSize: '0.65rem', background: '#fff3e0', color: '#e65100', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Condic.</span>
                  )}
                  {doc.required === false && (
                    <span style={{ fontSize: '0.65rem', background: '#e1f5fe', color: '#0277bd', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Recom.</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                  {doc.description}
                </p>
              </div>

              <div>
                <button
                  onClick={() => !isUploaded && handleUploadClick(doc.id)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: isUploaded ? 'default' : 'pointer',
                    backgroundColor: 'var(--color-background)',
                    color: isUploaded ? '#C5A059' : '#d32f2f', // Estética Golden para subido
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => { if (!isUploaded) e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)'; }}
                  onMouseOut={(e) => { if (!isUploaded) e.currentTarget.style.backgroundColor = 'var(--color-background)'; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {isUploaded ? 'verified' : 'upload_file'}
                  </span>
                  {isUploaded ? 'SUBIDO' : 'PENDIENTE'}
                </button>

                {/* Trazabilidad y OCR si está subido */}
                {isUploaded && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                    <div style={{ marginBottom: '4px' }}>
                      Aportado: {formatDate(statusObj.uploadedAt)} - Vía {statusObj.via}
                    </div>
                    {isAnalyzed ? (
                      <span style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>document_scanner</span>
                        Verificado por IA (OCR)
                      </span>
                    ) : (
                      <button 
                        onClick={() => simulateAiAnalysis(doc.id)}
                        disabled={isAnalyzing}
                        style={{ 
                          background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 500
                        }}
                      >
                        {isAnalyzing ? (
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', animation: 'spin 1s linear infinite' }}>autorenew</span>
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>psychology</span>
                        )}
                        {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '1rem' }}>
          <button 
            className="btn btn--outline btn--sm" 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
          >
            <span className="material-symbols-outlined">chevron_left</span>
            Anterior
          </button>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Página {currentPage} de {totalPages}
          </span>
          <button 
            className="btn btn--outline btn--sm" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
          >
            Siguiente
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
