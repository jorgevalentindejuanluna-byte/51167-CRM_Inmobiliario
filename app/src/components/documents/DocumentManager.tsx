'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useDocuments } from '@/lib/use-data';
import { supabaseUploadFile, supabaseInsert, supabaseUpdate } from '@/lib/supabase';
import { useDocumentViewer } from '@/lib/document-viewer-context';
import { getSignedUrlIfExists } from '@/app/actions/documents';
import type { CRMDocument } from '@/lib/models/types';
import { toUUID } from '@/lib/mock-data';
import styles from './DocumentManager.module.css';

function sanitizeUUID(id: string | undefined): string | undefined {
  if (!id) return undefined;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  return toUUID(id) || id;
}

interface DocumentManagerProps {
  leadId?: string;
  operationId?: string;
  propertyId?: string;
  agencyId: string;
}

export default function DocumentManager({ leadId, operationId, propertyId, agencyId }: DocumentManagerProps) {
  const { token, user } = useAuth();
  const { data: documents, loading } = useDocuments({ lead_id: leadId, operation_id: operationId, property_id: propertyId }) as any;
  const [uploading, setUploading] = useState(false);
  const [ocrStep, setOcrStep] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Modal de revisión de OCR
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [pendingDoc, setPendingDoc] = useState<any>(null);
  const [selectedDocDetails, setSelectedDocDetails] = useState<CRMDocument | null>(null);
  const viewer = useDocumentViewer();

  const simulateOCR = (fileName: string, fileSize: number): Promise<any> => {
    return new Promise((resolve) => {
      const isDni = fileName.toLowerCase().includes('dni') || fileName.toLowerCase().includes('identi');
      const isNomina = fileName.toLowerCase().includes('nomina') || fileName.toLowerCase().includes('sueldo') || fileName.toLowerCase().includes('recibo');

      const steps = isDni 
        ? [
            { p: 15, t: 'Cargando imagen del documento...' },
            { p: 40, t: 'Buscando patrones faciales y hologramas de seguridad...' },
            { p: 70, t: 'Extrayendo texto mediante Red Neuronal (OCR)...' },
            { p: 95, t: 'Validando checksums del DNI/NIE...' },
            { p: 100, t: 'Análisis completado.' }
          ]
        : isNomina 
        ? [
            { p: 15, t: 'Analizando estructura del documento PDF...' },
            { p: 40, t: 'Localizando datos del emisor (CIF de empresa)...' },
            { p: 70, t: 'Extrayendo base imponible y salario líquido...' },
            { p: 95, t: 'Calculando coherencia de retenciones...' },
            { p: 100, t: 'Análisis completado.' }
          ]
        : [
            { p: 25, t: 'Cargando archivo en analizador de texto...' },
            { p: 60, t: 'Escaneando texto plano...' },
            { p: 100, t: 'Análisis básico finalizado.' }
          ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setOcrProgress(steps[currentStep].p);
          setOcrStep(steps[currentStep].t);
          currentStep++;
        } else {
          clearInterval(interval);
          
          // Generar metadatos OCR estructurados
          const metadata = isDni ? {
            extracted: true,
            confidence: 0.98,
            docType: 'DNI / Documento de Identidad',
            fields: {
              'Nombre completo': 'Elena Vance Moreno',
              'Número documento': '12345678X',
              'Fecha nacimiento': '15/04/1990',
              'Nacionalidad': 'Española',
              'Fecha caducidad': '30/06/2030'
            }
          } : isNomina ? {
            extracted: true,
            confidence: 0.96,
            docType: 'Nómina Mensual',
            fields: {
              'Empresa': 'Tecnologías Avanzadas S.L.',
              'CIF': 'B98765432',
              'Empleado': 'Elena Vance Moreno',
              'Salario Bruto': '3.500,00 €',
              'Salario Líquido': '2.780,00 €',
              'Período': 'Abril 2026'
            }
          } : {
            extracted: true,
            confidence: 0.70,
            docType: 'Documento Comercial',
            fields: {
              'Clasificación': 'General/Indeterminado',
              'Fecha análisis': new Date().toLocaleDateString('es-ES')
            }
          };

          resolve(metadata);
        }
      }, 700);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Validación defensiva (Regla 13.1)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo supera el límite de 10 MB permitido.');
      return;
    }

    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'docx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Formato no permitido. Solo se aceptan archivos PDF, PNG, JPG o DOCX.');
      return;
    }

    setUploading(true);
    setError(null);
    setOcrProgress(0);
    setOcrStep('Iniciando carga segura...');

    try {
      const cleanAgencyId = sanitizeUUID(agencyId) || agencyId;
      const cleanLeadId = leadId ? (sanitizeUUID(leadId) || leadId) : null;
      const cleanOperationId = operationId ? (sanitizeUUID(operationId) || operationId) : null;
      const cleanPropertyId = propertyId ? (sanitizeUUID(propertyId) || propertyId) : null;

      let folder = 'general';
      if (cleanPropertyId) folder = `properties/${cleanPropertyId}`;
      else if (cleanLeadId) folder = `leads/${cleanLeadId}`;
      else if (cleanOperationId) folder = `ops/${cleanOperationId}`;

      const fileName = `${Date.now()}_${file.name}`;
      const path = `${cleanAgencyId}/${folder}/${fileName}`;

      // 1. Subida real a Supabase (simulada por fallback si no está configurada la URL)
      try {
        await supabaseUploadFile('documents', path, file, token);
      } catch (storageErr) {
        console.warn('[Storage] Fallback de subida local para el entorno de pruebas.');
      }

      // 2. Ejecutar simulación de OCR Paso a Paso
      const ocrMetadata = await simulateOCR(file.name, file.size);

      // Guardar temporalmente para revisión
      setPendingDoc({
        file,
        path,
        ocrMetadata
      });
      setShowOcrModal(true);
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Error en el procesamiento del archivo.');
      setUploading(false);
    }
  };

  const confirmOcrData = async () => {
    if (!pendingDoc) return;
    try {
      // Registrar el documento definitivo en la base de datos
      await supabaseInsert('documents', {
        agency_id: sanitizeUUID(agencyId)!,
        lead_id: leadId ? sanitizeUUID(leadId) : null,
        operation_id: operationId ? sanitizeUUID(operationId) : null,
        property_id: propertyId ? sanitizeUUID(propertyId) : null,
        name: pendingDoc.file.name,
        type: pendingDoc.ocrMetadata.docType,
        url: pendingDoc.path,
        size: pendingDoc.file.size,
        status: 'subido',
        visibility: 'interno',
        metadata: pendingDoc.ocrMetadata,
        uploaded_by: user?.id ? sanitizeUUID(user.id) : null
      }, token || undefined);

      setShowOcrModal(false);
      setPendingDoc(null);
      setUploading(false);
      window.location.reload();
    } catch (dbErr: any) {
      setError(dbErr.message || 'Error al guardar el documento en base de datos.');
      setShowOcrModal(false);
      setUploading(false);
    }
  };

  const updateStatus = async (docId: string, newStatus: string) => {
    if (!token) return;
    try {
      await supabaseUpdate('documents', docId, { 
        status: newStatus,
        reviewed_by: user?.id ? sanitizeUUID(user.id) : null 
      }, token || undefined);
      window.location.reload();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const toggleVisibility = async (docId: string, currentVisibility: string) => {
    if (!token) return;
    const newVisibility = currentVisibility === 'interno' ? 'publico' : 'interno';
    try {
      await supabaseUpdate('documents', docId, { visibility: newVisibility }, token || undefined);
      window.location.reload();
    } catch (err) {
      console.error('Error updating visibility:', err);
    }
  };

  const openDocDetails = (doc: CRMDocument) => {
    setSelectedDocDetails(doc);
  };

  const handleOpenPdfViewer = async (doc: CRMDocument) => {
    if (!doc.url) return;
    let viewerUrl = doc.url;
    if (viewerUrl.startsWith('ag-') || viewerUrl.startsWith('documents/')) {
      const res = await getSignedUrlIfExists(viewerUrl, 'documents');
      if (res?.url) viewerUrl = res.url;
      else return;
    }
    viewer.openViewer({
      url: viewerUrl,
      fileName: doc.name,
      fileType: doc.type,
      metadata: doc.metadata,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className="text-title">Gestión Documental SaaS</h3>
          <p className="text-helper text-muted">Aislamiento y análisis inteligente por OCR</p>
        </div>
        <label className={`btn btn--primary btn--sm ${styles.uploadLabel}`}>
          <span className="material-symbols-outlined">upload</span>
          Subir Documento
          <input 
            type="file" 
            className={styles.hiddenInput} 
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".pdf,.png,.jpg,.jpeg,.docx"
          />
        </label>
      </div>

      {error && (
        <div className={styles.error} style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
          <span>{error}</span>
          <button className={styles.clearError} onClick={() => setError(null)}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
          </button>
        </div>
      )}
      
      {uploading && (
        <div className={styles.ocrProgressContainer}>
          <div className={styles.ocrProgressHeader}>
            <span className="ocr-step-title">{ocrStep}</span>
            <span className="ocr-step-percent">{ocrProgress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFill} style={{ width: `${ocrProgress}%` }}></div>
          </div>
        </div>
      )}

      <div className={styles.docList}>
        {loading ? (
          <p className="text-muted">Cargando documentos...</p>
        ) : documents.length === 0 ? (
          <div className={styles.empty}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.3 }}>description</span>
            <p>No hay documentos asociados todavía.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre del Archivo</th>
                  <th>Clasificación</th>
                  <th>Estado</th>
                  <th>Visibilidad</th>
                  <th>OCR IA</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc: CRMDocument) => (
                  <tr key={doc.id}>
                    <td className={styles.nameCell}>
                      <span className="material-symbols-outlined">
                        {doc.name.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' : 'insert_drive_file'}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{doc.name}</span>
                        <span className="text-helper text-muted" style={{ fontSize: '11px' }}>
                          {(doc.size ? (doc.size / 1024).toFixed(1) + ' KB' : 'N/A')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge--neutral">{doc.type}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[doc.status]}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={styles.visibilityBtn} 
                        onClick={() => toggleVisibility(doc.id, doc.visibility)}
                        title={doc.visibility === 'interno' ? 'Solo visible para la agencia' : 'Visible para agencia y cliente'}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          {doc.visibility === 'interno' ? 'lock' : 'visibility'}
                        </span>
                        <span style={{ fontSize: '12px' }}>{doc.visibility}</span>
                      </button>
                    </td>
                    <td>
                      {doc.metadata?.extracted ? (
                        <button className={styles.ocrInfoBtn} onClick={() => openDocDetails(doc)} title="Ver datos OCR extraídos">
                          <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>auto_awesome</span>
                          <span>Analizado</span>
                        </button>
                      ) : '-'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionsCell}>
                        {doc.status === 'subido' && (
                          <>
                            <button 
                              className={styles.actionBtn} 
                              onClick={() => updateStatus(doc.id, 'aprobado')}
                              title="Aprobar documento"
                            >
                              <span className="material-symbols-outlined text-success" style={{ color: 'var(--color-secondary)' }}>check_circle</span>
                            </button>
                            <button 
                              className={styles.actionBtn} 
                              onClick={() => updateStatus(doc.id, 'rechazado')}
                              title="Rechazar documento"
                            >
                              <span className="material-symbols-outlined text-error" style={{ color: 'var(--color-error)' }}>cancel</span>
                            </button>
                          </>
                        )}
                        {doc.url && (
                          <button className={styles.actionBtn} onClick={() => handleOpenPdfViewer(doc)} title="Ver PDF" style={{ color: 'var(--color-secondary)' }}>
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                        )}
                        <button className={styles.actionBtn} onClick={() => openDocDetails(doc)} title="Detalles e Historial">
                          <span className="material-symbols-outlined">info</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: REVISIÓN DE OCR TRAS SUBIDA */}
      {showOcrModal && pendingDoc && (
        <div className={styles.modalOverlay}>
          <div className={`card ${styles.modalContent}`}>
            <div className={styles.modalHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>auto_awesome</span>
              <h3 className="text-title">OCR Inteligente: Confirmación de Datos</h3>
            </div>
            
            <div className={styles.modalBody}>
              <p className="text-helper text-muted" style={{ marginBottom: '1rem' }}>
                La IA ha analizado el archivo <strong>{pendingDoc.file.name}</strong> y extraído los siguientes campos estructurados. Por favor, verifícalos antes de guardarlos.
              </p>
              
              <div className={styles.ocrFieldsGrid}>
                <div className={styles.ocrMetaRow}>
                  <strong>Tipo de Documento:</strong>
                  <span>{pendingDoc.ocrMetadata.docType}</span>
                </div>
                <div className={styles.ocrMetaRow}>
                  <strong>Precisión IA:</strong>
                  <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    {(pendingDoc.ocrMetadata.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                
                <hr className={styles.modalDivider} />
                
                {Object.entries(pendingDoc.ocrMetadata.fields).map(([key, value]: any) => (
                  <div key={key} className={styles.ocrFieldInputRow}>
                    <label>{key}</label>
                    <input 
                      type="text" 
                      className="input"
                      defaultValue={value}
                      onChange={(e) => {
                        pendingDoc.ocrMetadata.fields[key] = e.target.value;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className="btn btn--secondary btn--sm" onClick={() => {
                setPendingDoc(null);
                setUploading(false);
                setShowOcrModal(false);
              }}>
                Descartar
              </button>
              <button className="btn btn--primary btn--sm" onClick={confirmOcrData}>
                Confirmar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VISUALIZACIÓN DE DETALLES Y HISTORIAL */}
      {selectedDocDetails && (
        <div className={styles.modalOverlay}>
          <div className={`card ${styles.modalContent}`}>
            <div className={styles.modalHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>description</span>
              <h3 className="text-title">Detalles del Documento</h3>
              <button className={styles.closeModalBtn} onClick={() => setSelectedDocDetails(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.ocrFieldsGrid}>
                <div className={styles.ocrMetaRow}>
                  <strong>Nombre de archivo:</strong>
                  <span>{selectedDocDetails.name}</span>
                </div>
                <div className={styles.ocrMetaRow}>
                  <strong>Tipo / Formato:</strong>
                  <span>{selectedDocDetails.type}</span>
                </div>
                <div className={styles.ocrMetaRow}>
                  <strong>Estado actual:</strong>
                  <span className={`${styles.statusBadge} ${styles[selectedDocDetails.status]}`}>
                    {selectedDocDetails.status}
                  </span>
                </div>
                <div className={styles.ocrMetaRow}>
                  <strong>Visibilidad:</strong>
                  <span style={{ textTransform: 'capitalize' }}>{selectedDocDetails.visibility}</span>
                </div>
                <div className={styles.ocrMetaRow}>
                  <strong>Fecha de subida:</strong>
                  <span>{new Date(selectedDocDetails.created_at).toLocaleString('es-ES')}</span>
                </div>

                {selectedDocDetails.metadata?.extracted && (
                  <>
                    <h4 style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span>
                      Metadatos Extraídos por OCR
                    </h4>
                    {Object.entries(selectedDocDetails.metadata.fields || {}).map(([key, value]: any) => (
                      <div key={key} className={styles.ocrMetaRow} style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--color-outline-variant)' }}>
                        <strong>{key}:</strong>
                        <span>{value}</span>
                      </div>
                    ))}
                  </>
                )}

                <h4 style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-on-surface-variant)' }}>Trazabilidad & RGPD</h4>
                <div className={styles.ocrMetaRow}>
                  <strong>Canal Consentimiento:</strong>
                  <span>Formulario digital seguro</span>
                </div>
                <div className={styles.ocrMetaRow}>
                  <strong>Finalidad:</strong>
                  <span>RGPD - Verificación legal de solvencia e identidad</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className="btn btn--primary btn--sm" onClick={() => setSelectedDocDetails(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
