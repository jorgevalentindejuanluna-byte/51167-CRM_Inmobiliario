import { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import GlobalAiSearch from '@/components/properties/GlobalAiSearch';

export const metadata: Metadata = {
  title: 'IA Catastral | Real Top State',
  description: 'Módulo de Inteligencia Artificial para Urbanismo y Catastro',
};

export default function AiCatastroPage() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <TopBar title="Asistente IA Urbanístico, Fiscal y Catastral" />
        <main className="content">
          <div className="card">
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--color-primary)', marginBottom: '1rem' }}>map</span>
              <h2>Búsqueda Catastral y Urbanística General</h2>
              <p className="text-muted" style={{ maxWidth: '500px', margin: '1rem auto' }}>
                Este módulo general te permite realizar consultas libres sobre cualquier inmueble de España. Introduce una referencia catastral o una dirección junto con su municipio para extraer toda la información urbanística y fiscal utilizando Inteligencia Artificial.
              </p>
            </div>
            
            <GlobalAiSearch />
          </div>
        </main>
      </div>
    </div>
  );
}
