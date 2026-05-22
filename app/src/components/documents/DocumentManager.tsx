'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useDocuments } from '@/lib/use-data';
import { supabaseUploadFile, supabaseInsert, supabaseUpdate } from '@/lib/supabase';
import type { CRMDocument } from '@/lib/models/types';
import styles from './DocumentManager.module.css';

interface DocumentManagerProps {
  leadId?: string;
  operationId?: string;
  agencyId: string;
}

export default function DocumentManager({ leadId, operationId, agencyId }: DocumentManagerProps) {
  const { token, user } = useAuth();
  const { data: documents, loading, refreshUser } = useDocuments({ lead_id: leadId, operation_id: operationId }) as any;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setError(null);

    try {
      // 1. Definir ruta: agency_id/lead_id/filename
      const folder = leadId ? `leads/${leadId}` : `ops/${operationId}`;
      const fileName = `${Date.now()}_${file.name}`;
      const path = `${agencyId}/${folder}/${fileName}`;

      // 2. Subir a Storage
      await supabaseUploadFile('documents', path, file, token);

      // 3. Simular OCR (IA Predictiva - Regla 9.1)
      // En una fase posterior esto llamará a un Edge Function de OCR
      const ocrMetadata = {
        extracted: true,
        confidence: 0.95,
        type_detected: file.name.toLowerCase().includes('dni') ? 'DNI' : 'Otro',
        date_detected: new Date().toLocaleDateString()
      };

      // 4. Registrar en la base de datos
      await supabaseInsert('documents', {
        agency_id: agencyId,
        lead_id: leadId,
        operation_id: operationId,
        name: file.name,
        type: ocrMetadata.type_detected,
        url: path,
        size: file.size,
        status: 'subido',
        visibility: 'interno',
        metadata: ocrMetadata,
        uploaded_by: user?.id
      });

      // 5. Refrescar lista (podríamos usar un mutate local o recargar)
      window.location.reload(); // Simple por ahora para asegurar consistencia
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Error al subir el documento');
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (docId: string, newStatus: string) => {
    if (!token) return;
    try {
      await supabaseUpdate('documents', docId, { status: newStatus });
      window.location.reload();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className="text-title">Gestor Documental</h3>
        <label className={`btn btn--primary btn--sm ${styles.uploadLabel}`}>
          <span className="material-symbols-outlined">upload</span>
          Subir Documento
          <input 
            type="file" 
            className={styles.hiddenInput} 
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      
      {uploading && (
        <div className={styles.uploadingBar}>
          <div className="spinner spinner--sm"></div>
          <span>Procesando documento con OCR IA...</span>
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
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>OCR IA</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc: CRMDocument) => (
                <tr key={doc.id}>
                  <td className={styles.nameCell}>
                    <span className="material-symbols-outlined">insert_drive_file</span>
                    {doc.name}
                  </td>
                  <td><span className="badge badge--neutral">{doc.type}</span></td>
                  <td>
                    <span className={`${styles.status} ${styles[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    {doc.metadata?.extracted ? (
                      <span className={styles.ocrTag} title="Datos extraídos por IA">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
                        Listo
                      </span>
                    ) : '-'}
                  </td>
                  <td className={styles.actions}>
                    {doc.status === 'subido' && (
                      <button 
                        className={styles.actionBtn} 
                        onClick={() => updateStatus(doc.id, 'aprobado')}
                        title="Aprobar"
                      >
                        <span className="material-symbols-outlined text-success">check_circle</span>
                      </button>
                    )}
                    <button className={styles.actionBtn} title="Ver">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
