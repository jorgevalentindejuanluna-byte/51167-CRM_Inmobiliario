'use client';

import { useState } from 'react';
import { getCatastroData } from '@/app/actions/catastro';
import { generateUrbanisticReport, UrbanisticReport } from '@/app/actions/urbanismo';
import { getIbiEstimation } from '@/app/actions/ibi';
import { findOfficialMunicipalityUrl } from '@/app/actions/web-search';
import type { CadastralData, IbiEstimation } from '@/lib/models/catastro_types';
import { formatCurrency } from '@/lib/constants';
import { useAuth } from '@/lib/auth-context';
import { useMessageModal } from '@/lib/message-modal-context';

export default function GlobalAiSearch() {
  const { user } = useAuth();
  const agencyId = user?.agency_id || 'ag-001';
  const modal = useMessageModal();

  const [searchType, setSearchType] = useState<'catastro' | 'direccion'>('catastro');
  const [searchValue, setSearchValue] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [provincia, setProvincia] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [catastroData, setCatastroData] = useState<CadastralData | null>(null);
  const [urbanData, setUrbanData] = useState<UrbanisticReport | null>(null);
  const [ibiData, setIbiData] = useState<IbiEstimation | null>(null);
  const [isSearchingUrl, setIsSearchingUrl] = useState(false);

  const handleSearch = async () => {
    if (!searchValue) {
      setError('Por favor, introduce una referencia o dirección.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setCatastroData(null);
    setUrbanData(null);
    setIbiData(null);

    try {
      // 1. Catastro
      let refCatastral = searchValue;
      if (searchType === 'direccion') {
        // Mock de resolución de dirección a referencia catastral
        refCatastral = '0000000AA0000A0000AA';
      }

      const catRes = await getCatastroData(refCatastral, agencyId, undefined, user?.id);
      if (!catRes.success) throw new Error(catRes.error || 'Error consultando Catastro');
      setCatastroData(catRes.data as CadastralData);

      // 2. Urbanismo (requiere municipio y provincia)
      if (municipio && provincia) {
        const urbRes = await generateUrbanisticReport(municipio, provincia, agencyId, undefined, user?.id);
        if (urbRes.success) setUrbanData(urbRes.data as UrbanisticReport);

        // 3. IBI
        const ibiRes = await getIbiEstimation(municipio, provincia, '150000'); // Valor mock para búsqueda global
        if (ibiRes.success) setIbiData(ibiRes.data as IbiEstimation);
      }
    } catch (err: any) {
      setError(err.message || 'Error en la consulta global.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>travel_explore</span>
          Buscador Global Inteligente
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tipo de Búsqueda</label>
            <select 
              className="input" 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value as any)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            >
              <option value="catastro">Referencia Catastral</option>
              <option value="direccion">Dirección Libre</option>
            </select>
          </div>
          <div style={{ flex: '2 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              {searchType === 'catastro' ? 'Ref. Catastral' : 'Dirección Completa'}
            </label>
            <input 
              type="text" 
              className="input" 
              value={searchValue} 
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={searchType === 'catastro' ? "Ej. 9872023VH5797S0001WX" : "Ej. Calle Mayor 1, Madrid"}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Municipio (Para Normativa e IBI)</label>
            <input 
              type="text" 
              className="input" 
              value={municipio} 
              onChange={(e) => setMunicipio(e.target.value)}
              placeholder="Ej. Madrid"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Provincia</label>
            <input 
              type="text" 
              className="input" 
              value={provincia} 
              onChange={(e) => setProvincia(e.target.value)}
              placeholder="Ej. Madrid"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}
            />
          </div>
        </div>

        <button 
          className="btn btn--primary" 
          onClick={handleSearch} 
          disabled={loading}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '8px' }}
        >
          {loading ? (
            <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>autorenew</span>
          ) : (
            <span className="material-symbols-outlined">search_insights</span>
          )}
          {loading ? 'Analizando con IA...' : 'Generar Informe 360º'}
        </button>

        {error && (
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginTop: '1rem', fontSize: '0.875rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Resultados Catastrales */}
      {catastroData && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>domain</span>
            Datos Catastrales
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Referencia</span>
              <strong style={{ fontSize: '1rem', fontFamily: 'monospace' }}>{catastroData.reference}</strong>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Uso</span>
              <strong style={{ fontSize: '1rem' }}>{catastroData.use}</strong>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Superficie</span>
              <strong style={{ fontSize: '1rem' }}>{catastroData.surface} m²</strong>
            </div>
          </div>
        </div>
      )}

      {/* Resultados Urbanísticos */}
      {urbanData && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>account_tree</span>
            Normativa Urbanística
          </h3>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem', background: 'var(--color-surface-variant)', padding: '1rem', borderRadius: '8px' }}>
            {urbanData.resumen_ia}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Zonificación</span>
              <strong style={{ fontSize: '0.875rem' }}>{urbanData.zonificacion}</strong>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Edificabilidad</span>
              <strong style={{ fontSize: '0.875rem' }}>{urbanData.edificabilidad}</strong>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={async () => {
                if (!municipio || !provincia) return;
                setIsSearchingUrl(true);
                const res = await findOfficialMunicipalityUrl(municipio, provincia);
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
          </div>
        </div>
      )}

      {/* Resultados IBI */}
      {ibiData && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>account_balance</span>
            Estimación Fiscal (IBI)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid rgba(64, 239, 183, 0.3)', borderRadius: '8px', background: 'rgba(64, 239, 183, 0.05)' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Tipo Impositivo</span>
              <strong style={{ fontSize: '1.25rem' }}>{ibiData.urban_rate}%</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
