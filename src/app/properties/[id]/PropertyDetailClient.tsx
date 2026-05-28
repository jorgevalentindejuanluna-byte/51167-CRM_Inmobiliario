'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProperties, useOperations, useUsers } from '@/lib/use-data';
import { useAuth } from '@/lib/auth-context';
import { updateProperty } from '@/app/actions/properties';
import { toUUID } from '@/lib/mock-data';
import { useMessageModal } from '@/lib/message-modal-context';
import { formatCurrency, formatDate } from '@/lib/constants';
import DocumentManager from '@/components/documents/DocumentManager';
import CadastralAnalysis from '@/components/properties/CadastralAnalysis';
import PropertyEditForm from '@/components/properties/PropertyEditForm';
import styles from './page.module.css';

export function PropertyDetailClient({ id }: { id: string }) {
  const propertyId = id;
  const { token } = useAuth();
  
  const { data: allProperties } = useProperties();
  const { data: users } = useUsers();
  const { data: allOperations } = useOperations();
  const modal = useMessageModal();

  const property = allProperties.find(p => p.id === propertyId || toUUID(p.id) === propertyId);
  const agent = users.find(u => u.id === property?.agente_responsable);
  const operations = allOperations.filter(op => op.propiedad_id === property?.id);

  const [activePhoto, setActivePhoto] = useState(0);
  const [localRefCatastral, setLocalRefCatastral] = useState<string | undefined>(property?.referencia_catastral);
  const [localPropertyOverride, setLocalPropertyOverride] = useState<any>(null);

  type TabType = 'general' | 'operaciones' | 'documentos' | 'ia' | 'edicion';
  const [activeTab, setActiveTab] = useState<TabType>('general');

  if (!property) return <div>Propiedad no encontrada.</div>;

  // Creamos un property combinando los datos y el estado local para pasar a los componentes hijos
  const currentProperty = { 
    ...property, 
    referencia_catastral: localRefCatastral, 
    ...(localPropertyOverride || {}) 
  };

  const propertyPhotos = property.fotos && property.fotos.length > 0 
    ? property.fotos 
    : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop'];

  return (
    <div className={styles.container}>
      <div className={styles.stickyHeader}>
      <header className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link href="/properties" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            </Link>
            <span style={{ color: 'var(--color-text-secondary)' }}>Propiedades / {property.referencia} &mdash; {property.titulo}</span>
          </div>
          <h1 className={styles.title}>{property.titulo}</h1>
          <div className={styles.subtitle}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
            {currentProperty.direccion}, {currentProperty.zona}, {currentProperty.ciudad}
            <span style={{ margin: '0 8px', color: 'var(--color-border)' }}>|</span>
            <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {currentProperty.operacion}
            </span>
            <span style={{ margin: '0 8px', color: 'var(--color-border)' }}>|</span>
            <span style={{ fontSize: '12px', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
              Ref. Catastral: <strong>{currentProperty.referencia_catastral || 'Sin asignar'}</strong>
            </span>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div className={styles.price}>{formatCurrency(property.precio)}</div>
          <div className={styles.actions}>
            <button className="btn btn--secondary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>share</span>
              Compartir
            </button>
            <button 
              className="btn btn--primary"
              onClick={() => setActiveTab('edicion')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
              Editar
            </button>
          </div>
        </div>
      </header>

      {/* TABS DE NAVEGACIÓN */}
      <div className={styles.tabsContainer} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-outline-variant)', overflowX: 'auto' }}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'general' ? styles.activeTab : ''}`} 
          onClick={() => setActiveTab('general')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'general' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'general' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: activeTab === 'general' ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Información General
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'operaciones' ? styles.activeTab : ''}`} 
          onClick={() => setActiveTab('operaciones')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'operaciones' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'operaciones' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: activeTab === 'operaciones' ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Operaciones ({operations.length})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'documentos' ? styles.activeTab : ''}`} 
          onClick={() => setActiveTab('documentos')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'documentos' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'documentos' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: activeTab === 'documentos' ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Documentación
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'ia' ? styles.activeTab : ''}`} 
          onClick={() => setActiveTab('ia')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'ia' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'ia' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: activeTab === 'ia' ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Análisis IA
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'edicion' ? styles.activeTab : ''}`} 
          onClick={() => setActiveTab('edicion')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'edicion' ? '2px solid var(--color-primary)' : '2px solid transparent', color: activeTab === 'edicion' ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: activeTab === 'edicion' ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Edición
        </button>
      </div>
      </div>

      <div className={styles.scrollableContent}>
        
        {/* --- PESTAÑA: INFORMACIÓN GENERAL --- */}
        {activeTab === 'general' && (
          <div className={styles.contentGrid}>
            <div className={styles.leftColumn}>
              <div className={styles.gallery}>
            <img 
              src={propertyPhotos[activePhoto]} 
              alt={property.titulo}
              className={styles.mainImage}
            />
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px', color: '#fff', fontSize: '0.875rem', backdropFilter: 'blur(4px)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>image</span>
              {activePhoto + 1} / {propertyPhotos.length} Fotos
            </div>
          </div>



              {/* Fila de Miniaturas */}
              {propertyPhotos.length > 1 && (
                <div className={styles.thumbnails}>
                  {propertyPhotos.map((photo, index) => (
                    <button
                      key={index}
                      className={`${styles.thumbnailButton} ${activePhoto === index ? styles.activeThumbnail : ''}`}
                      onClick={() => setActivePhoto(index)}
                    >
                      <img src={photo} alt={`Miniatura ${index + 1}`} className={styles.thumbnailImage} />
                    </button>
                  ))}
                </div>
              )}
              <div className={styles.description}>
                {currentProperty.descripcion ? (
                  currentProperty.descripcion.split('\n').map((paragraph: string, i: number) => (
                    <p key={i}>{paragraph}</p>
                  ))
                ) : (
                  <p className="text-muted">No hay descripción disponible para esta propiedad.</p>
                )}
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.agentCard}>
                <h3 className={styles.sectionTitle} style={{ fontSize: '1rem', marginBottom: '16px' }}>
                  Agente Responsable
                </h3>
                {agent ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={agent.avatar_url || `https://ui-avatars.com/api/?name=${agent.nombre}+${agent.apellidos}`} alt={agent.nombre} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{agent.nombre} {agent.apellidos}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>{agent.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted">Sin agente asignado</div>
                )}
              </div>

              <div className={styles.detailsCard}>
                <h3 className={styles.sectionTitle} style={{ fontSize: '1rem', marginBottom: '16px' }}>
                  Detalles Adicionales
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Alta:</span>
                    <span>{formatDate(currentProperty.fecha_alta)}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Cert. Energético:</span>
                    <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{currentProperty.certificado_energetico || '-'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-muted">Planta:</span>
                    <span>{currentProperty.planta || '-'}</span>
                  </li>
                </ul>

                <h3 className={styles.sectionTitle} style={{ fontSize: '1rem', marginBottom: '16px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '16px' }}>
                  Equipamiento
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { key: 'ascensor', label: 'Ascensor', icon: 'elevator' },
                    { key: 'garaje', label: 'Garaje', icon: 'directions_car' },
                    { key: 'terraza', label: 'Terraza', icon: 'balcony' },
                    { key: 'balcon', label: 'Balcón', icon: 'deck' },
                    { key: 'piscina', label: 'Piscina', icon: 'pool' },
                    { key: 'calefaccion', label: 'Calefacción', icon: 'mode_heat' },
                    { key: 'aire_acondicionado', label: 'Aire Acond.', icon: 'ac_unit' },
                    { key: 'trastero', label: 'Trastero', icon: 'inventory_2' },
                    { key: 'acceso_minusvalidos', label: 'Acceso PMR', icon: 'accessible' },
                    { key: 'gimnasio', label: 'Gimnasio', icon: 'fitness_center' },
                    { key: 'seguridad_24h', label: 'Seguridad 24h', icon: 'security' },
                    { key: 'jardin', label: 'Jardín', icon: 'yard' },
                    { key: 'armarios_empotrados', label: 'Armarios', icon: 'door_sliding' },
                    { key: 'amueblado', label: 'Amueblado', icon: 'chair' },
                    { key: 'mascotas_permitidas', label: 'Mascotas', icon: 'pets' },
                  ].map(c => {
                    const isActive = !!currentProperty[c.key as keyof typeof currentProperty];
                    if (!isActive) return null;
                    return (
                      <span key={c.key} style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px', 
                        padding: '6px 12px', background: 'var(--color-primary-container, rgba(200, 169, 110, 0.1))', 
                        color: 'var(--color-primary)', borderRadius: '16px', fontSize: '0.8125rem', fontWeight: 500 
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{c.icon}</span>
                        {c.label}
                      </span>
                    );
                  })}
                  {/* Fallback if no features */}
                  {![
                    'ascensor', 'garaje', 'terraza', 'balcon', 'piscina', 'calefaccion', 'aire_acondicionado', 
                    'trastero', 'acceso_minusvalidos', 'gimnasio', 'seguridad_24h', 'jardin', 'armarios_empotrados', 
                    'amueblado', 'mascotas_permitidas'
                  ].some(k => !!currentProperty[k as keyof typeof currentProperty]) && (
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>No hay extras registrados.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PESTAÑA: OPERACIONES --- */}
        {activeTab === 'operaciones' && (
          <div style={{ width: '100%' }}>
            <h2 className={styles.sectionTitle}>
              <span className="material-symbols-outlined">trending_up</span>
              Operaciones y Visitas
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {operations.length > 0 ? (
                operations.map(op => (
                  <div key={op.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-outline-variant)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{op.tipo_operacion.toUpperCase()} — {op.id.replace('op-', '#OP-')}</div>
                      <div className="text-muted" style={{ fontSize: '0.875rem' }}>Última act: {formatDate(op.updated_at)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className={`badge badge--${op.estado === 'cierre' || op.estado === 'facturado' ? 'success' : 'primary'}`}>
                        {op.estado.replace(/_/g, ' ')}
                      </span>
                      <Link href={`/pipeline/${op.id}`} className="btn btn--sm">
                        Ver Op.
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', background: 'var(--color-surface)', border: '1px solid var(--color-outline-variant)', borderRadius: '12px', color: 'var(--color-text-secondary)' }}>
                  No hay operaciones comerciales en curso para este inmueble.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PESTAÑA: DOCUMENTOS --- */}
        {activeTab === 'documentos' && (
          <div style={{ width: '100%' }}>
            <DocumentManager 
              propertyId={currentProperty.id}
              agencyId={currentProperty.agency_id}
            />
          </div>
        )}

        {/* --- PESTAÑA: ANÁLISIS IA --- */}
        {activeTab === 'ia' && (
          <div style={{ width: '100%' }}>
            <CadastralAnalysis property={currentProperty} />
          </div>
        )}

        {/* --- PESTAÑA: EDICIÓN --- */}
        {activeTab === 'edicion' && (
          <div style={{ width: '100%' }}>
            <PropertyEditForm 
              property={currentProperty} 
              onSave={async (updated) => {
                // Optimistic update
                setLocalPropertyOverride(updated);
                setActiveTab('general');
                
                // Server Update
                const res = await updateProperty(propertyId, updated, token ?? undefined);
                if (!res.success) {
                  modal.showError('Error', 'Error al guardar: ' + (res.error || ''));
                } else {
                  modal.showSuccess('Éxito', 'Inmueble actualizado correctamente');
                }
              }}
              onCancel={() => setActiveTab('general')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
