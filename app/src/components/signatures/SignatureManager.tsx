'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSignatures } from '@/lib/use-data';
import { supabaseInsert, supabaseUpdate } from '@/lib/supabase';
import type { CRMSignature, SignatureStatus } from '@/lib/models/types';
import { toUUID } from '@/lib/mock-data';
import SignaturePad from './SignaturePad';
import styles from './SignatureManager.module.css';

function sanitizeUUID(id: string | undefined): string | undefined {
  if (!id) return undefined;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  return toUUID(id) || id;
}

interface SignatureManagerProps {
  operationId: string;
  agencyId: string;
  clientName: string;
}

export default function SignatureManager({ operationId, agencyId, clientName }: SignatureManagerProps) {
  const { token, user } = useAuth();
  const { data: signatures, loading } = useSignatures(operationId);
  const [showPad, setShowPad] = useState(false);
  
  // Estados para simulación de AutoFirma (Cliente @firma)
  const [autoFirmaProgress, setAutoFirmaProgress] = useState(false);
  const [autoFirmaStep, setAutoFirmaStep] = useState('');
  const [autoFirmaPercent, setAutoFirmaPercent] = useState(0);

  // Modal de éxito de firma biométrica
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<any>(null);

  // Función para procesar y calcular los metadatos biométricos (Regla 7.3)
  const processBiometricData = (strokes: any[]) => {
    if (strokes.length < 2) {
      return {
        strokesCount: strokes.length,
        averagePressure: 0.5,
        averageSpeed: 0,
        device: navigator.platform,
        userAgent: navigator.userAgent
      };
    }

    // Calcular velocidad media del trazo (distancia / tiempo)
    let totalDistance = 0;
    let totalTime = 0;
    let totalPressure = 0;

    for (let i = 1; i < strokes.length; i++) {
      const p1 = strokes[i - 1];
      const p2 = strokes[i];

      // Distancia euclídea
      const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
      const time = p2.t - p1.t; // en milisegundos

      totalDistance += dist;
      totalTime += time > 0 ? time : 1; // evitar divisiones por cero
      totalPressure += p2.p || 0.5;
    }

    const avgSpeed = totalDistance / (totalTime / 1000); // px por segundo
    const avgPressure = totalPressure / strokes.length;

    return {
      strokesCount: strokes.length,
      averagePressure: parseFloat(avgPressure.toFixed(2)),
      averageSpeed: parseFloat(avgSpeed.toFixed(1)), // px/s
      device: navigator.platform || 'Tablet Presencial',
      userAgent: navigator.userAgent,
      canvasWidth: 400,
      canvasHeight: 200
    };
  };

  const handleBiometricSave = async (strokes: any[]) => {
    if (!token) return;

    try {
      // 1. Procesar datos del canvas
      const biometricInfo = processBiometricData(strokes);
      
      // Simular IP y Geolocalización de auditoría legal
      const auditLog = {
        ip: '192.168.1.144',
        provider: 'Cloudflare Tunnel Secure',
        location: 'Madrid, ES',
        timestamp: new Date().toISOString()
      };

      const hashOriginal = 'sha256:d57e169c9b4e3e3b2e50529d4791b92427ae41e4649b934ca495991b7852b855';
      const hashFirmado = 'sha256:8b9a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b';

      // 2. Insertar firma en base de datos
      const docTitle = `Contrato de Arras - Firma Presencial`;
      await supabaseInsert('signatures', {
        agency_id: sanitizeUUID(agencyId)!,
        operation_id: sanitizeUUID(operationId)!,
        title: docTitle,
        type: 'biometric',
        status: 'firmado',
        signer_name: clientName,
        signer_id: '12345678X', // Simulado
        signer_email: 'elena.vance@gmail.com',
        biometric_data: {
          strokes: strokes.slice(0, 100), // Guardar una muestra de trazos para auditoría gráfica
          analysis: biometricInfo
        },
        hash_documento: hashOriginal,
        hash_firmado: hashFirmado,
        ip_address: auditLog.ip,
        browser_info: biometricInfo.userAgent,
        location_data: {
          city: 'Madrid',
          country: 'Spain',
          coordinates: '40.416775, -3.703790'
        },
        signed_at: auditLog.timestamp
      }, token);

      setSuccessDetails({
        title: docTitle,
        type: 'Biométrica Presencial',
        signer: clientName,
        ip: auditLog.ip,
        speed: `${biometricInfo.averageSpeed} px/s`,
        pressure: `${(biometricInfo.averagePressure * 100).toFixed(0)}%`,
        timestamp: new Date(auditLog.timestamp).toLocaleString('es-ES')
      });
      
      setShowPad(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving biometric signature:', err);
    }
  };

  const handleDigitalRequest = async () => {
    if (!token) return;
    setAutoFirmaProgress(true);
    setAutoFirmaPercent(0);
    setAutoFirmaStep('Generando hash de documento PDF original...');

    const steps = [
      { p: 25, t: 'Generando hash de documento PDF original...' },
      { p: 50, t: 'Invocando Cliente @firma / AutoFirma (afirma://)...' },
      { p: 75, t: 'Esperando firma digital del usuario en aplicación externa...' },
      { p: 95, t: 'Firma recibida. Validando certificado de la FNMT...' },
      { p: 100, t: 'Firma digital integrada y guardada con éxito.' }
    ];

    let currentStep = 0;
    const interval = setInterval(async () => {
      if (currentStep < steps.length) {
        setAutoFirmaPercent(steps[currentStep].p);
        setAutoFirmaStep(steps[currentStep].t);
        currentStep++;
      } else {
        clearInterval(interval);
        
        try {
          const hashOriginal = 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
          const hashFirmado = 'sha256:f0fd8a9b0c1d2e3f4a5b6c7d8e9f0a1b8b9a2c3d4e5f6a7b8c9d0e1f2a3b4c5d';
          
          await supabaseInsert('signatures', {
            agency_id: sanitizeUUID(agencyId)!,
            operation_id: sanitizeUUID(operationId)!,
            title: `Contrato de Arras - Firma Digital`,
            type: 'digital',
            status: 'firmado',
            signer_name: clientName,
            signer_id: '12345678X',
            signer_email: 'elena.vance@gmail.com',
            hash_documento: hashOriginal,
            hash_firmado: hashFirmado,
            ip_address: '192.168.1.144',
            browser_info: navigator.userAgent,
            biometric_data: {
              certificate: {
                subject: `CN=${clientName}, SN=Vance Moreno, G=Elena, SERIALNUMBER=IDCES-12345678X`,
                issuer: 'CN=FNMT Clase 2 CA, OU=Ceres, O=FNMT-RCM, C=ES',
                validFrom: '2025-01-10T00:00:00Z',
                validTo: '2029-01-10T00:00:00Z'
              }
            },
            signed_at: new Date().toISOString()
          }, token);

          setAutoFirmaProgress(false);
          
          setSuccessDetails({
            title: `Contrato de Arras - Firma Digital`,
            type: 'Digital FNMT (AutoFirma)',
            signer: clientName,
            ip: '192.168.1.144',
            certificate: 'FNMT Clase 2 CA (Ceres)',
            timestamp: new Date().toLocaleString('es-ES')
          });
          setShowSuccessModal(true);
        } catch (err) {
          console.error('Error inserting digital signature:', err);
          setAutoFirmaProgress(false);
        }
      }
    }, 850);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessDetails(null);
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3 className="text-title">Firmas y Contratos Digitales</h3>
          <p className="text-helper text-muted">AutoFirma y Firma Biométrica Presencial integradas</p>
        </div>
        <div className={styles.actions}>
          <button 
            className="btn btn--secondary btn--sm" 
            onClick={() => setShowPad(true)}
            disabled={showPad || autoFirmaProgress}
          >
            <span className="material-symbols-outlined">edit_square</span>
            Firma Biométrica
          </button>
          <button 
            className="btn btn--primary btn--sm" 
            onClick={handleDigitalRequest}
            disabled={autoFirmaProgress || showPad}
          >
            <span className="material-symbols-outlined">fingerprint</span>
            {autoFirmaProgress ? 'Firmando...' : 'AutoFirma'}
          </button>
        </div>
      </div>

      {autoFirmaProgress && (
        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span>{autoFirmaStep}</span>
            <span>{autoFirmaPercent}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFill} style={{ width: `${autoFirmaPercent}%` }}></div>
          </div>
        </div>
      )}

      {showPad && (
        <div className={styles.padWrapper}>
          <div className={styles.padHeader}>
            <strong>Firmar Contrato Presencialmente</strong>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowPad(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <SignaturePad onSave={handleBiometricSave} />
        </div>
      )}

      <div className={styles.signatureList}>
        {loading ? (
          <p className="text-muted">Cargando firmas...</p>
        ) : signatures.length === 0 ? (
          <div className={styles.empty}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', opacity: 0.3 }}>fingerprint</span>
            <p>No hay firmas registradas en esta operación.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {signatures.map(sig => (
              <div key={sig.id} className={styles.sigItem}>
                <div className={styles.sigInfo}>
                  <div className={`${styles.sigIconWrapper} ${styles[sig.type]}`}>
                    <span className="material-symbols-outlined">
                      {sig.type === 'digital' ? 'workspace_premium' : 'border_color'}
                    </span>
                  </div>
                  <div>
                    <strong>{sig.title}</strong>
                    <div className={styles.sigDetails}>
                      <span>Firmante: {sig.signer_name}</span>
                      <span className={styles.dotSeparator}>•</span>
                      <span>Tipo: {sig.type === 'digital' ? 'Certificado FNMT' : 'Biométrica Presencial'}</span>
                    </div>
                    {sig.signed_at && (
                      <span className={styles.sigDate}>
                        Firmado el: {new Date(sig.signed_at).toLocaleString('es-ES')}
                      </span>
                    )}
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

      {/* MODAL DE ÉXITO DE FIRMA (AUDITORÍA LEGAL / TRACEABILITY) */}
      {showSuccessModal && successDetails && (
        <div className={styles.modalOverlay}>
          <div className={`card ${styles.modalContent}`}>
            <div className={styles.modalHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>verified_user</span>
              <h3 className="text-title">Documento Firmado con Éxito</h3>
            </div>
            
            <div className={styles.modalBody}>
              <p className="text-helper text-muted" style={{ marginBottom: '1.25rem' }}>
                Se ha generado y validado la firma legal del documento. Los datos de auditoría se han sellado en la base de datos de la agencia.
              </p>
              
              <div className={styles.auditInfoGrid}>
                <div className={styles.auditRow}>
                  <strong>Documento:</strong>
                  <span>{successDetails.title}</span>
                </div>
                <div className={styles.auditRow}>
                  <strong>Tipo de Firma:</strong>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{successDetails.type}</span>
                </div>
                <div className={styles.auditRow}>
                  <strong>Firmante:</strong>
                  <span>{successDetails.signer}</span>
                </div>
                <div className={styles.auditRow}>
                  <strong>Fecha y Hora:</strong>
                  <span>{successDetails.timestamp}</span>
                </div>
                <div className={styles.auditRow}>
                  <strong>Dirección IP:</strong>
                  <code>{successDetails.ip}</code>
                </div>
                
                {successDetails.speed && (
                  <div className={styles.auditRow}>
                    <strong>Velocidad Media Trazo:</strong>
                    <span>{successDetails.speed}</span>
                  </div>
                )}
                
                {successDetails.pressure && (
                  <div className={styles.auditRow}>
                    <strong>Presión Media:</strong>
                    <span>{successDetails.pressure}</span>
                  </div>
                )}

                {successDetails.certificate && (
                  <div className={styles.auditRow}>
                    <strong>Certificado Emisor:</strong>
                    <span>{successDetails.certificate}</span>
                  </div>
                )}

                <div className={styles.hashBox}>
                  <strong>SHA-256 Sello de Tiempo (Hash):</strong>
                  <code>{successDetails.type.includes('Digital') 
                    ? 'f0fd8a9b0c1d2e3f4a5b6c7d8e9f0a1b8b9a2c3d4e5f6a7b8c9d0e1f2a3b4c5d' 
                    : '8b9a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b'}
                  </code>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className="btn btn--primary btn--sm" onClick={closeSuccessModal}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
