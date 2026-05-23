'use client';

import React from 'react';
import { useLeads, useOperations, useProperties } from '@/lib/use-data';
import { formatCurrency, formatDate } from '@/lib/constants';
import SellerPortal from './SellerPortal';
import styles from './page.module.css';

export default function PortalPage() {
  // Simulamos que el cliente logueado es "lead-004" (Roberto Jiménez - Vendedor)
  // O "lead-002" (Carlos Ruiz - Comprador)
  const clientId = 'lead-004'; 
  
  const { data: leads } = useLeads();
  const { data: operations } = useOperations();
  const { data: properties } = useProperties();
  
  const client = leads.find(l => l.id === clientId);
  
  if (!client) return <div className={styles.loading}>Cargando portal...</div>;

  // Si es vendedor, buscamos su propiedad vinculada
  if (client.tipo_lead === 'vendedor') {
    const property = properties.find(p => p.propietario_id === clientId) || properties[0];
    const sellerOps = operations.filter(o => o.propiedad_id === property?.id);
    
    return (
      <SellerPortal 
        client={client} 
        property={property} 
        operations={sellerOps} 
      />
    );
  }

  // Vista Comprador (Default)
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className="text-headline">¡Hola, {client.nombre}!</h1>
        <p className="text-muted">Bienvenido a tu área privada. Aquí puedes seguir el estado de tu búsqueda inmobiliaria.</p>
      </header>

      <div className={styles.grid}>
        {/* Columna Izquierda: Resumen y Próximos pasos */}
        <div className={styles.leftCol}>
          
          {/* Status Card */}
          <div className={`card ${styles.statusCard}`}>
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>analytics</span>
              <h2 className="text-title">Estado de tu búsqueda</h2>
            </div>
            <div className={styles.statusContent}>
              <div className={styles.progressTracker}>
                <div className={`${styles.step} ${styles.active}`}>Calificación</div>
                <div className={styles.stepConnector} />
                <div className={styles.step}>Visitas</div>
                <div className={styles.stepConnector} />
                <div className={styles.step}>Oferta</div>
                <div className={styles.stepConnector} />
                <div className={styles.step}>Cierre</div>
              </div>
              <p className={styles.statusDesc}>
                Estamos filtrando las mejores propiedades que encajan con tu presupuesto de 
                <strong> {formatCurrency(client.presupuesto_min || 0)} - {formatCurrency(client.presupuesto_max || 0)}</strong>.
              </p>
            </div>
          </div>

          {/* Timeline (Regla 8.1) */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>timeline</span>
              <h2 className="text-title">Línea de Tiempo</h2>
            </div>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <strong>Búsqueda iniciada</strong>
                  <span>{formatDate(client.created_at)}</span>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <strong>Perfil completado con IA</strong>
                  <span>Hace 2 días</span>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <strong>Documentación solicitada</strong>
                  <span>Ayer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Inmuebles y Documentos */}
        <div className={styles.rightCol}>
          
          {/* Propiedades Sugeridas */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)' }}>auto_awesome</span>
              <h2 className="text-title">Seleccionados para ti</h2>
            </div>
            <div className={styles.propertyList}>
              {properties.slice(0, 2).map(prop => (
                <div key={prop.id} className={styles.propertyItem}>
                  <div className={styles.propThumb}>
                    <span className="material-symbols-outlined">home</span>
                  </div>
                  <div className={styles.propInfo}>
                    <strong>{prop.titulo}</strong>
                    <p>{prop.zona}, {prop.ciudad}</p>
                    <span className={styles.price}>{formatCurrency(prop.precio)}</span>
                  </div>
                  <button className="btn btn--secondary btn--sm">Me interesa</button>
                </div>
              ))}
            </div>
          </div>

          {/* Documentos y Firmas (Regla 8.1) */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-error)' }}>description</span>
              <h2 className="text-title">Tus Documentos</h2>
            </div>
            <div className={styles.docList}>
              <div className={styles.docItem}>
                <span className="material-symbols-outlined">verified</span>
                <div className={styles.docText}>
                  <strong>Contrato de Arras</strong>
                  <p>Pendiente de tu firma</p>
                </div>
                <button className="btn btn--primary btn--sm">Firmar ahora</button>
              </div>
              <div className={styles.docItem}>
                <span className="material-symbols-outlined">description</span>
                <div className={styles.docText}>
                  <strong>DNI / NIE</strong>
                  <p>Verificado por IA</p>
                </div>
                <span className="badge badge--success">OK</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
