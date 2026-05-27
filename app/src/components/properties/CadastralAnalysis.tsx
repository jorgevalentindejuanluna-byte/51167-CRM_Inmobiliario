'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getCatastroData } from '@/app/actions/catastro';
import { getIbiEstimation } from '@/app/actions/ibi';
import { generateUrbanisticReport, UrbanisticReport } from '@/app/actions/urbanismo';
import { findOfficialMunicipalityUrl } from '@/app/actions/web-search';
import type { Property } from '@/lib/models/types';
import type { CadastralData, IbiEstimation } from '@/lib/models/catastro_types';
import { formatCurrency } from '@/lib/constants';
import { useMessageModal } from '@/lib/message-modal-context';

export default function CadastralAnalysis({ property }: { property: Property }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catastroData, setCatastroData] = useState<CadastralData | null>(null);

  // IBI State
  const [cadastralValueInput, setCadastralValueInput] = useState('');
  const [ibiLoading, setIbiLoading] = useState(false);
  const [ibiError, setIbiError] = useState<string | null>(null);
  const [ibiData, setIbiData] = useState<IbiEstimation | null>(null);

  // Urbanismo State
  const [urbanLoading, setUrbanLoading] = useState(false);
  const [urbanError, setUrbanError] = useState<string | null>(null);
  const [urbanData, setUrbanData] = useState<UrbanisticReport | null>(null);
  const [isSearchingUrl, setIsSearchingUrl] = useState(false);

  const agencyId = user?.agency_id || 'ag-001';
  const modal = useMessageModal();

  const handleQuery = async () => {
    if (!property.referencia_catastral) {
      setError('El inmueble no tiene Referencia Catastral asignada. Añádela en la ficha para continuar.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getCatastroData(property.referencia_catastral, agencyId, property.id, user?.id);
      if (res.success && res.data) {
        setCatastroData(res.data);
      } else {
        setError(res.error || 'Error desconocido consultando el Catastro.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', width: '100%', alignItems: 'stretch' }}>
      
      {/* Disclaimer Legal Obligatorio */}
      <div style={{ flex: '1 1 100%', padding: '1rem', backgroundColor: 'var(--color-surface-variant)', borderLeft: '4px solid var(--color-primary)', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>gavel</span>
          Advertencia Legal
        </h4>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          Este informe ha sido generado mediante inteligencia artificial a partir de fuentes públicas (Sede Electrónica del Catastro) y datos disponibles en el CRM. Su contenido tiene carácter meramente informativo y no sustituye la consulta directa a las administraciones correspondientes.
        </p>
      </div>

      <div style={{ flex: '1 1 300px', padding: '1.5rem', border: '1px solid var(--color-outline-variant)', borderRadius: '12px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>domain</span>
              Análisis Catastral Oficial
            </h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Consulta en tiempo real a la DGC de España.</p>
          </div>
          <button 
            className="btn btn--primary" 
            onClick={handleQuery} 
            disabled={loading}
          >
            {loading ? (
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>autorenew</span>
            ) : (
              <span className="material-symbols-outlined">search</span>
            )}
            Consultar Sede Electrónica
          </button>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!catastroData && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-outline)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', opacity: 0.5, marginBottom: '1rem' }}>manage_search</span>
            <p style={{ margin: 0 }}>Pulsa "Consultar" para recuperar los datos públicos del inmueble.</p>
          </div>
        )}

        {catastroData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Referencia Catastral</span>
              <strong style={{ fontSize: '1rem', fontFamily: 'monospace' }}>{catastroData.reference}</strong>
            </div>
            
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Uso Principal</span>
              <strong style={{ fontSize: '1rem' }}>{catastroData.use}</strong>
            </div>
            
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Superficie Construida</span>
              <strong style={{ fontSize: '1rem' }}>{catastroData.surface} m²</strong>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Año Construcción</span>
              <strong style={{ fontSize: '1rem' }}>{catastroData.construction_year}</strong>
            </div>

            <div style={{ gridColumn: '1 / -1', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Localización (DGC)</span>
              <strong style={{ fontSize: '1rem', wordBreak: 'break-word' }}>
                {catastroData.location && typeof catastroData.location === 'object' 
                  ? JSON.stringify(catastroData.location) 
                  : catastroData.location}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Bloque Análisis Fiscal IBI */}
      <div style={{ flex: '1 1 300px', padding: '1.5rem', border: '1px solid var(--color-outline-variant)', borderRadius: '12px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>account_balance</span>
              Estimación de IBI Municipal
            </h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Calculado mediante IA extrayendo el tipo impositivo local.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, maxWidth: '300px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Valor Catastral (Opcional)</label>
            <input 
              type="number"
              placeholder="Ej. 125000"
              value={cadastralValueInput}
              onChange={(e) => setCadastralValueInput(e.target.value)}
              className="input"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
            />
          </div>
          <button 
            className="btn btn--secondary" 
            onClick={async () => {
              if (!property.ciudad || !property.provincia) {
                setIbiError('Falta provincia o ciudad en la ficha.');
                return;
              }
              if (!cadastralValueInput) {
                setIbiError('Introduce un valor catastral para estimar el IBI.');
                return;
              }
              setIbiLoading(true);
              setIbiError(null);
              const res = await getIbiEstimation(property.ciudad, property.provincia, cadastralValueInput);
              if (res.success && res.data) {
                setIbiData(res.data);
              } else {
                setIbiError(res.error || 'Error estimando IBI.');
              }
              setIbiLoading(false);
            }} 
            disabled={ibiLoading}
          >
            {ibiLoading ? (
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>autorenew</span>
            ) : (
              <span className="material-symbols-outlined">calculate</span>
            )}
            Calcular IBI
          </button>
        </div>

        {ibiError && (
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <strong>Error:</strong> {ibiError}
          </div>
        )}

        {ibiData && (
          <div style={{ padding: '1rem', background: 'rgba(64, 239, 183, 0.08)', borderRadius: '8px', border: '1px solid rgba(64, 239, 183, 0.3)' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-secondary)' }}>Resultado Estimado ({ibiData.fiscal_year})</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Tipo Impositivo (Urbano)</span>
                <strong style={{ fontSize: '1.25rem' }}>{ibiData.urban_rate}%</strong>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Cuota Íntegra Estimada</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>{ibiData.estimated_amount !== null ? formatCurrency(ibiData.estimated_amount) : 'N/A'}</strong>
              </div>
            </div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Fuente consultada por IA: {ibiData.source_url}
            </div>
          </div>
        )}
      </div>

      {/* Bloque Normativa Urbanística IA */}
      <div style={{ flex: '1 1 300px', padding: '1.5rem', border: '1px solid var(--color-outline-variant)', borderRadius: '12px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>account_tree</span>
              Normativa Urbanística IA
            </h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Análisis del planeamiento vigente (PGOU) para este inmueble.</p>
          </div>
          <button 
            className="btn btn--primary" 
            onClick={async () => {
              if (!property.ciudad || !property.provincia) {
                setUrbanError('El inmueble debe tener Ciudad y Provincia en la ficha para consultar urbanismo.');
                return;
              }
              setUrbanLoading(true);
              setUrbanError(null);
              const res = await generateUrbanisticReport(property.ciudad, property.provincia, agencyId, property.id, user?.id, property.referencia_catastral);
              if (res.success && res.data) {
                setUrbanData(res.data);
              } else {
                setUrbanError(res.error || 'Error consultando normativa urbanística.');
              }
              setUrbanLoading(false);
            }} 
            disabled={urbanLoading}
          >
            {urbanLoading ? (
              <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>autorenew</span>
            ) : (
              <span className="material-symbols-outlined">analytics</span>
            )}
            Consultar Normativa
          </button>
        </div>

        {urbanError && (
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            <strong>Error:</strong> {urbanError}
          </div>
        )}

        {urbanData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>psychology</span>
                Resumen Inteligente
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>{urbanData.resumen_ia}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Zonificación</span>
                <strong style={{ fontSize: '0.875rem' }}>{urbanData.zonificacion}</strong>
              </div>
              <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Edificabilidad Mín/Máx</span>
                <strong style={{ fontSize: '0.875rem' }}>{urbanData.edificabilidad}</strong>
              </div>
              <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Alturas Permitidas</span>
                <strong style={{ fontSize: '0.875rem' }}>{urbanData.alturas_permitidas}</strong>
              </div>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Usos Compatibles</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {urbanData.usos_compatibles.map((uso, idx) => (
                  <span key={idx} style={{ background: 'var(--color-surface-variant)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {uso}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                onClick={async () => {
                  if (!property.ciudad || !property.provincia) return;
                  setIsSearchingUrl(true);
                  const res = await findOfficialMunicipalityUrl(property.ciudad, property.provincia);
                  if (res.success && res.url) {
                    window.open(res.url, '_blank');
                  } else {
                    modal.showError('Error', 'No se pudo resolver el enlace oficial: ' + res.error);
                  }
                  setIsSearchingUrl(false);
                }}
                disabled={isSearchingUrl}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, fontSize: '0.875rem' 
                }}
              >
                {isSearchingUrl ? (
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>autorenew</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>travel_explore</span>
                )}
                {isSearchingUrl ? 'Analizando con IA...' : 'Analizar Enlace Oficial con IA'}
              </button>
              <span style={{ color: 'var(--color-text-tertiary)', textAlign: 'right' }}>
                Normativa Aplicable: {urbanData.normativa_aplicable}
              </span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
