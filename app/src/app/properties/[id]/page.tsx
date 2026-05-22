'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProperties, useOperations, useUsers } from '@/lib/use-data';
import { formatCurrency, formatDate } from '@/lib/constants';
import DocumentManager from '@/components/documents/DocumentManager';
import styles from './page.module.css';

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  
  const { data: allProperties } = useProperties();
  const { data: users } = useUsers();
  const { data: allOperations } = useOperations();

  const property = allProperties.find(p => p.id === propertyId) || allProperties[0];
  const agent = users.find(u => u.id === property?.agente_responsable);
  const operations = allOperations.filter(op => op.propiedad_id === property?.id);

  if (!property) return <div>Propiedad no encontrada.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link href="/properties" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            </Link>
            <span style={{ color: 'var(--color-text-secondary)' }}>Propiedades / {property.referencia}</span>
          </div>
          <h1 className={styles.title}>{property.titulo}</h1>
          <div className={styles.subtitle}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
            {property.direccion}, {property.zona}, {property.ciudad}
            <span style={{ margin: '0 8px', color: 'var(--color-border)' }}>|</span>
            <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {property.operacion}
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
            <button className="btn btn--primary">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
              Editar
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {/* Columna Izquierda */}
        <div className={styles.leftColumn}>
          <div className={styles.gallery}>
            <img 
              src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop`} 
              alt={property.titulo}
              className={styles.mainImage}
            />
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px', color: '#fff', fontSize: '0.875rem', backdropFilter: 'blur(4px)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>image</span>
              1 / 12 Fotos
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className="material-symbols-outlined">description</span>
              Descripción
            </h2>
            <p className={styles.description}>
              {property.descripcion || 'No hay descripción disponible para esta propiedad.'}
            </p>
          </div>

          {/* Gestor Documental de la Propiedad (Regla 6) */}
          <div className={styles.section}>
            <DocumentManager operationId={property.id} agencyId={property.agency_id} />
          </div>
        </div>

        {/* Columna Derecha */}
        <div className={styles.rightColumn}>
          {/* Ficha Técnica */}
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>
              <span className="material-symbols-outlined">info</span>
              Ficha Técnica
            </h2>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tipo</span>
                <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>{property.tipo_inmueble.replace('_', ' ')}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Estado</span>
                <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                  {property.estado.replace('_', ' ')}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Superficie</span>
                <span className={styles.infoValue}>{property.superficie} m²</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Alta</span>
                <span className={styles.infoValue}>{formatDate(property.fecha_alta)}</span>
              </div>
              {property.certificado_energetico && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Cert. Energético</span>
                  <span className={styles.infoValue}>
                    <div style={{ 
                      background: 'var(--color-primary)', color: '#000', 
                      width: '24px', height: '24px', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', 
                      borderRadius: '4px', fontWeight: 'bold' 
                    }}>
                      {property.certificado_energetico}
                    </div>
                  </span>
                </div>
              )}
            </div>

            <div className={styles.featuresList}>
              <div className={`${styles.featureRow} ${property.habitaciones ? styles.active : ''}`}>
                <span className={`material-symbols-outlined ${styles.icon}`}>bed</span>
                {property.habitaciones || 0} Habitaciones
              </div>
              <div className={`${styles.featureRow} ${property.banos ? styles.active : ''}`}>
                <span className={`material-symbols-outlined ${styles.icon}`}>shower</span>
                {property.banos || 0} Baños
              </div>
              <div className={`${styles.featureRow} ${property.ascensor ? styles.active : ''}`}>
                <span className={`material-symbols-outlined ${styles.icon}`}>elevator</span>
                {property.ascensor ? 'Con ascensor' : 'Sin ascensor'}
              </div>
              <div className={`${styles.featureRow} ${property.garaje ? styles.active : ''}`}>
                <span className={`material-symbols-outlined ${styles.icon}`}>directions_car</span>
                {property.garaje ? 'Con garaje' : 'Sin garaje'}
              </div>
              <div className={`${styles.featureRow} ${property.terraza ? styles.active : ''}`}>
                <span className={`material-symbols-outlined ${styles.icon}`}>deck</span>
                {property.terraza ? 'Con terraza' : 'Sin terraza'}
              </div>
              <div className={`${styles.featureRow} ${property.piscina ? styles.active : ''}`}>
                <span className={`material-symbols-outlined ${styles.icon}`}>pool</span>
                {property.piscina ? 'Con piscina' : 'Sin piscina'}
              </div>
            </div>
          </div>

          {/* Agente y Operaciones */}
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>
              <span className="material-symbols-outlined">assignment_ind</span>
              Gestión
            </h2>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Agente Responsable</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid var(--color-border)' }}>
                  {agent ? `${agent.nombre[0]}${agent.apellidos[0]}` : 'NA'}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{agent ? `${agent.nombre} ${agent.apellidos}` : 'No asignado'}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{agent?.email}</div>
                </div>
              </div>
            </div>

            {operations.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <span className={styles.infoLabel}>Operaciones Activas</span>
                {operations.map(op => (
                  <Link href={`/pipeline`} key={op.id} style={{ textDecoration: 'none' }}>
                    <div className={styles.operationCard}>
                      <div className={styles.operationHeader}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatCurrency(op.precio_oferta || op.precio_salida || 0)}</span>
                        <span className={`${styles.operationStatus} ${['reserva', 'firma', 'cierre'].includes(op.estado) ? styles.active : ''}`}>
                          {op.estado}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        Iniciada: {formatDate(op.fecha_inicio!)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
