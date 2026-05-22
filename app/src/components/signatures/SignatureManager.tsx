'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSignatures } from '@/lib/use-data';
import { supabaseInsert, supabaseUpdate } from '@/lib/supabase';
import type { CRMSignature, SignatureStatus } from '@/lib/models/types';
import SignaturePad from './SignaturePad';
import styles from './SignatureManager.module.css';

interface SignatureManagerProps {
  operationId: string;
  agencyId: string;
  clientName: string;
}

export default function SignatureManager({ operationId, agencyId, clientName }: SignatureManagerProps) {
  const { token } = useAuth();
  const { data: signatures, loading } = useSignatures(operationId);
  const [showPad, setShowPad] = useState(false);
  const [requestingDigital, setRequestingDigital] = useState(false);

  const handleBiometricSave = async (strokes: any[]) => {
    if (!token) return;
    try {
      await supabaseInsert('signatures', {
        agency_id: agencyId,
        operation_id: operationId,
        title: `Contrato de Arras - Biométrico`,
        type: 'biometric',
        status: 'firmado',
        signer_name: clientName,
        biometric_data: {
          strokes,
          device: navigator.platform,
          userAgent: navigator.userAgent
        },
        signed_at: new Date().toISOString()
      });
      setShowPad(false);
      window.location.reload();
    } catch (err) {
      console.error('Error saving biometric signature:', err);
    }
  };

  const handleDigitalRequest = async () => {
    if (!token) return;
    setRequestingDigital(true);
    try {
      // Simulación de generación de hash y solicitud a AutoFirma (Regla 7.1)
      await supabaseInsert('signatures', {
        agency_id: agencyId,
        operation_id: operationId,
        title: `Contrato de Compraventa - Digital`,
        type: 'digital',
        status: 'enviado',
        signer_name: clientName,
        hash_documento: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      });
      setTimeout(() => {
        setRequestingDigital(false);
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error requesting digital signature:', err);
      setRequestingDigital(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className="text-title">Firmas y Contratos</h3>
        <div className={styles.actions}>
          <button 
            className="btn btn--secondary btn--sm" 
            onClick={() => setShowPad(true)}
            disabled={showPad}
          >
            <span className="material-symbols-outlined">edit_square</span>
            Firma Biométrica
          </button>
          <button 
            className="btn btn--primary btn--sm" 
            onClick={handleDigitalRequest}
            disabled={requestingDigital}
          >
            <span className="material-symbols-outlined">fingerprint</span>
            {requestingDigital ? 'Solicitando...' : 'AutoFirma'}
          </button>
        </div>
      </div>

      {showPad && (
        <div className={styles.padWrapper}>
          <div className={styles.padHeader}>
            <strong>Firmar documento presencialmente</strong>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowPad(false)}>Cancelar</button>
          </div>
          <SignaturePad onSave={handleBiometricSave} />
        </div>
      )}

      <div className={styles.signatureList}>
        {loading ? (
          <p className="text-muted">Cargando firmas...</p>
        ) : signatures.length === 0 ? (
          <p className={styles.empty}>No hay solicitudes de firma activas.</p>
        ) : (
          <div className={styles.list}>
            {signatures.map(sig => (
              <div key={sig.id} className={styles.sigItem}>
                <div className={styles.sigInfo}>
                  <span className="material-symbols-outlined" style={{ color: sig.type === 'digital' ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
                    {sig.type === 'digital' ? 'verified_user' : 'draw'}
                  </span>
                  <div>
                    <strong>{sig.title}</strong>
                    <p className="text-helper text-muted">
                      Firmante: {sig.signer_name} • {sig.type === 'digital' ? 'Digital (AutoFirma)' : 'Biométrica'}
                    </p>
                  </div>
                </div>
                <div className={styles.sigStatus}>
                  <span className={`${styles.statusBadge} ${styles[sig.status]}`}>
                    {sig.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
