'use client';

import React, { useState } from 'react';
import { useOperations, useProperties, useLeads, useUsers } from '@/lib/use-data';
import { formatCurrency, formatDate } from '@/lib/constants';
import DocumentManager from '@/components/documents/DocumentManager';
import SignatureManager from '@/components/signatures/SignatureManager';
import styles from './page.module.css';

// Columnas del tablero Kanban
const COLUMNS = [
  { id: 'calificacion', title: 'Calificación' },
  { id: 'visitas', title: 'Visitas' },
  { id: 'oferta', title: 'Ofertas' },
  { id: 'negociacion', title: 'Negociación' },
  { id: 'reserva', title: 'Reserva' },
  { id: 'documentacion', title: 'Documentación' },
  { id: 'firma', title: 'Firma / Cierre' }
];

export default function PipelinePage() {
  const { data: operations } = useOperations();
  const { data: properties } = useProperties();
  const { data: leads } = useLeads();
  const { data: users } = useUsers();
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
  
  const selectedOp = operations.find(o => o.id === selectedOpId);

  // Helpers para obtener datos relacionados
  const getPropertyTitle = (propId: string) => properties.find(p => p.id === propId)?.titulo || 'Inmueble Desconocido';
  const getClientName = (clientId: string) => {
    const lead = leads.find(l => l.id === clientId);
    return lead ? `${lead.nombre} ${lead.apellidos}` : 'Cliente Desconocido';
  };
  const getAgentInitials = (agentId: string) => {
    const user = users.find(u => u.id === agentId);
    return user ? `${user.nombre[0]}${user.apellidos[0]}` : 'NA';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pipeline Comercial</h1>
          <p className={styles.subtitle}>
            Seguimiento de operaciones activas mediante tablero Kanban.
          </p>
        </div>
        <button className="btn btn--primary">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Nueva Operación
        </button>
      </header>

      <div className={styles.boardWrapper}>
        {/* Tablero Kanban */}
        <div className={styles.board}>
          {COLUMNS.map(column => {
            const columnOperations = operations.filter(op => {
              if (column.id === 'firma') {
                return op.estado === 'firma' || op.estado === 'cierre';
              }
              return op.estado === column.id;
            });

            const columnTotalValue = columnOperations.reduce((total, op) => total + (op.precio_oferta || op.precio_salida || 0), 0);

            return (
              <div key={column.id} className={styles.column}>
                <div className={styles.columnHeader}>
                  <div className={styles.columnTitle}>
                    {column.title}
                    <span className={styles.columnCount}>{columnOperations.length}</span>
                  </div>
                  {columnTotalValue > 0 && (
                    <div className={styles.columnTotal}>
                      {formatCurrency(columnTotalValue)}
                    </div>
                  )}
                </div>

                <div className={styles.columnBody}>
                  {columnOperations.map(op => (
                    <div 
                      key={op.id} 
                      className={`${styles.card} ${selectedOpId === op.id ? styles.cardActive : ''}`}
                      onClick={() => setSelectedOpId(op.id)}
                    >
                      <div className={styles.cardHeader}>
                        <span className={`${styles.cardType} ${styles[op.tipo_operacion]}`}>
                          {op.tipo_operacion}
                        </span>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-tertiary)' }}>more_horiz</span>
                      </div>

                      <div className={styles.cardTitle}>
                        {getPropertyTitle(op.propiedad_id!)}
                      </div>
                      
                      <div className={styles.cardPrice}>
                        {formatCurrency(op.precio_oferta || op.precio_salida || 0)}
                      </div>

                      <div className={styles.cardClient}>
                        <span className={`material-symbols-outlined ${styles.cardClientIcon}`}>person</span>
                        {getClientName(op.cliente_id || op.propietario_id || '')}
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.cardAgent} title="Agente Responsable">
                          <div className={styles.agentAvatar}>
                            {getAgentInitials(op.agente_id!)}
                          </div>
                        </div>
                        <div className={styles.cardDate}>
                          {formatDate(op.fecha_inicio!)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {columnOperations.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                      Sin operaciones
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel Lateral de Detalle (Regla 6 - Gestor Documental) */}
        {selectedOp && (
          <aside className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <h2 className="text-title">Detalle Operación</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedOpId(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.sidePanelContent}>
              <div className={styles.opInfo}>
                <div className={styles.opMain}>
                  <h3>{getPropertyTitle(selectedOp.propiedad_id!)}</h3>
                  <p className="text-muted">{getClientName(selectedOp.cliente_id || '')}</p>
                </div>
                <div className={styles.opStatus}>
                  <span className="badge badge--primary">{selectedOp.estado}</span>
                </div>
              </div>

              <div className={styles.opStats}>
                <div className={styles.statItem}>
                  <span className="text-label text-muted">Precio Cierre</span>
                  <span className="text-title">{formatCurrency(selectedOp.precio_oferta || 0)}</span>
                </div>
                <div className={styles.statItem}>
                  <span className="text-label text-muted">Honorarios (Est.)</span>
                  <span className="text-title">{formatCurrency((selectedOp.precio_oferta || 0) * 0.03)}</span>
                </div>
              </div>

              {/* Integración del Gestor Documental */}
              <div style={{ marginTop: '2rem' }}>
                <DocumentManager operationId={selectedOp.id} agencyId={selectedOp.agency_id} />
              </div>

              {/* Integración de Firmas (Regla 7) */}
              <SignatureManager 
                operationId={selectedOp.id} 
                agencyId={selectedOp.agency_id} 
                clientName={getClientName(selectedOp.cliente_id || '')} 
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
