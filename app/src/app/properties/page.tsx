'use client';



import { useState } from 'react';
import Link from 'next/link';
import { useProperties, useUsers } from '@/lib/use-data';
import { formatCurrency, formatDate } from '@/lib/constants';
import { toUUID } from '@/lib/mock-data';
import styles from './page.module.css';

export default function PropertiesPage() {
  const { data: properties, source } = useProperties();
  const { data: users } = useUsers();

  const [filterOperation, setFilterOperation] = useState('todas');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterType, setFilterType] = useState('todos');

  // Filtrado
  const filteredProperties = properties.filter(prop => {
    if (filterOperation !== 'todas' && prop.operacion !== filterOperation) return false;
    if (filterStatus !== 'todos' && prop.estado !== filterStatus) return false;
    if (filterType !== 'todos' && prop.tipo_inmueble !== filterType) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Portfolio de Inmuebles</h1>
          <p className={styles.subtitle}>
            Gestiona las propiedades activas y en captación de la agencia.
          </p>
        </div>
        <Link href="/properties/new" className="btn btn--primary">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_home</span>
          Nueva Propiedad
        </Link>
      </header>

      {/* Filtros */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Operación</span>
          <select 
            className={styles.filterSelect}
            value={filterOperation}
            onChange={(e) => setFilterOperation(e.target.value)}
          >
            <option value="todas">Todas las operaciones</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="inversion">Inversión</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Estado</span>
          <select 
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="en_captacion">En Captación</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido / Alquilado</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Tipo de Inmueble</span>
          <select 
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="piso">Piso</option>
            <option value="chalet">Chalet / Casa</option>
            <option value="local">Local</option>
            <option value="oficina">Oficina</option>
          </select>
        </div>
      </div>

      {/* Grid de propiedades */}
      <div className={styles.grid}>
        {filteredProperties.map(property => {
          const agent = users.find(u => u.id === property.agente_responsable);
          return (
            <Link href={`/properties/${toUUID(property.id) || property.id}`} key={property.id} className={styles.card}>
              {/* Imagen de Portada o Placeholder */}
              <div className={styles.imagePlaceholder}>
                {property.fotos && property.fotos.length > 0 ? (
                  <img 
                    src={property.fotos[0]} 
                    alt={property.titulo} 
                    className={styles.cardImage} 
                  />
                ) : (
                  <span className={`material-symbols-outlined ${styles.imageIcon}`}>real_estate_agent</span>
                )}
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles.badgeOperation}`}>
                    {property.operacion}
                  </span>
                  <span className={`${styles.badge} ${styles.badgeStatus}`} style={{
                    background: property.estado === 'disponible' ? 'rgba(64, 239, 183, 0.2)' : 
                                property.estado === 'en_captacion' ? 'rgba(242, 190, 140, 0.2)' : 'rgba(255,255,255,0.1)',
                    color: property.estado === 'disponible' ? 'var(--color-secondary)' : 
                           property.estado === 'en_captacion' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    borderColor: property.estado === 'disponible' ? 'rgba(64, 239, 183, 0.3)' : 
                                 property.estado === 'en_captacion' ? 'rgba(242, 190, 140, 0.3)' : 'rgba(255,255,255,0.2)'
                  }}>
                    {property.estado.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className={styles.content}>
                <div className={styles.price}>
                  {formatCurrency(property.precio)}
                  {property.operacion === 'alquiler' && <span style={{fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 'normal'}}>/mes</span>}
                </div>
                
                <div className={styles.titleRow}>
                  <h3 className={styles.cardTitle}>{property.titulo}</h3>
                  <div className={styles.location}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                    {property.zona}, {property.ciudad}
                  </div>
                </div>

                <div className={styles.features}>
                  <div className={styles.feature} title="Superficie">
                    <span className={`material-symbols-outlined ${styles.featureIcon}`}>straighten</span>
                    {property.superficie} m²
                  </div>
                  {property.habitaciones && (
                    <div className={styles.feature} title="Habitaciones">
                      <span className={`material-symbols-outlined ${styles.featureIcon}`}>bed</span>
                      {property.habitaciones}
                    </div>
                  )}
                  {property.banos && (
                    <div className={styles.feature} title="Baños">
                      <span className={`material-symbols-outlined ${styles.featureIcon}`}>shower</span>
                      {property.banos}
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.footerItem}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person</span>
                    {agent ? `${agent.nombre} ${agent.apellidos}` : 'Sin agente'}
                  </div>
                  <div className={styles.footerItem}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                    {formatDate(property.fecha_alta)}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {filteredProperties.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-text-tertiary)', marginBottom: '1rem' }}>search_off</span>
            <h3>No se encontraron propiedades</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Ajusta los filtros de búsqueda para ver más resultados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
