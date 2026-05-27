'use client';

import React from 'react';
import { formatCurrency, formatDate } from '@/lib/constants';
import styles from './page.module.css';

interface SellerPortalProps {
  client: any;
  property: any;
  operations: any[];
}

export default function SellerPortal({ client, property, operations }: SellerPortalProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className="text-headline">Gestión de tu Inmueble</h1>
        <p className="text-muted">Estado de la venta de: <strong>{property.titulo}</strong></p>
      </header>

      <div className={styles.grid}>
        {/* Columna Izquierda: Métricas y Portales */}
        <div className={styles.leftCol}>
          
          {/* Métricas de Interés (Regla 8.2) */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>visibility</span>
              <h2 className="text-title">Interés en Portales</h2>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Visualizaciones</span>
                <span className={styles.statValue}>1.240</span>
                <span className={styles.statTrend}>+12% este mes</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Contactos</span>
                <span className={styles.statValue}>48</span>
                <span className={styles.statTrend}>8 pendientes</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Visitas Realizadas</span>
                <span className={styles.statValue}>12</span>
                <span className={styles.statTrend}>2 programadas</span>
              </div>
            </div>
            
            <div className={styles.portalBadges}>
              {property.portales_publicados?.map((p: string) => (
                <div key={p} className={styles.portalBadge}>
                  <span className="material-symbols-outlined">language</span>
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback de Visitas (Regla 8.2) */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>comment</span>
              <h2 className="text-title">Feedback de Interesados</h2>
            </div>
            <div className={styles.feedbackList}>
              <div className={styles.feedbackItem}>
                <div className={styles.feedbackHeader}>
                  <strong>Visita 05/05</strong>
                  <span className="badge badge--success">Interesado</span>
                </div>
                <p>"Le encanta la luminosidad, pero le preocupa el ruido de la calle secundaria."</p>
              </div>
              <div className={styles.feedbackItem}>
                <div className={styles.feedbackHeader}>
                  <strong>Visita 02/05</strong>
                  <span className="badge badge--neutral">Descartado</span>
                </div>
                <p>"Busca algo con más armarios empotrados. Precio correcto."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ofertas y Documentos */}
        <div className={styles.rightCol}>
          
          {/* Ofertas Recibidas (Regla 8.2) */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-tertiary)' }}>request_quote</span>
              <h2 className="text-title">Ofertas Recibidas</h2>
            </div>
            <div className={styles.offerList}>
              {operations.filter(op => op.precio_oferta).map(op => (
                <div key={op.id} className={styles.offerItem}>
                  <div className={styles.offerInfo}>
                    <span className={styles.offerPrice}>{formatCurrency(op.precio_oferta || 0)}</span>
                    <span className={styles.offerDate}>Recibida el {formatDate(op.updated_at)}</span>
                  </div>
                  <div className={styles.offerActions}>
                    <button className="btn btn--secondary btn--sm">Contraoferta</button>
                    <button className="btn btn--primary btn--sm">Aceptar</button>
                  </div>
                </div>
              ))}
              {operations.filter(op => op.precio_oferta).length === 0 && (
                <p className="text-muted" style={{ textAlign: 'center', padding: '1rem' }}>No hay ofertas activas en este momento.</p>
              )}
            </div>
          </div>

          {/* Documentos de la Propiedad */}
          <div className="card">
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined" style={{ color: 'var(--color-error)' }}>folder_shared</span>
              <h2 className="text-title">Expediente del Inmueble</h2>
            </div>
            <div className={styles.docList}>
              <div className={styles.docItem}>
                <span className="material-symbols-outlined">description</span>
                <div className={styles.docText}>
                  <strong>Nota Simple</strong>
                  <p>Actualizada hace 15 días</p>
                </div>
                <button className="btn btn--ghost btn--sm">Ver</button>
              </div>
              <div className={styles.docItem}>
                <span className="material-symbols-outlined">verified_user</span>
                <div className={styles.docText}>
                  <strong>Encargo de Venta</strong>
                  <p>Firmado digitalmente</p>
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
