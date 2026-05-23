'use client';

import React, { useState, useEffect } from 'react';
import { useOperations, useProperties, useLeads, useUsers } from '@/lib/use-data';
import { formatCurrency, formatDate } from '@/lib/constants';
import DocumentManager from '@/components/documents/DocumentManager';
import SignatureManager from '@/components/signatures/SignatureManager';
import { useAuth } from '@/lib/auth-context';
import { supabaseUpdate, supabaseInsert } from '@/lib/supabase';
import { toUUID } from '@/lib/mock-data';
import { showToast } from '@/lib/toast';
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

/** Traduce IDs mock (ej: 'op-001') a UUIDs reales para la BD */
const sanitizeUUID = (id: string | undefined): string => {
  if (!id) return '';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  return toUUID(id) || id;
};

export default function PipelinePage() {
  const { data: operations } = useOperations();
  const { data: properties } = useProperties();
  const { data: leads } = useLeads();
  const { data: users } = useUsers();
  const { user, token } = useAuth();

  // Estados locales para interactividad
  const [ops, setOps] = useState<any[]>([]);
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null);
  const [draggedOverColId, setDraggedOverColId] = useState<string | null>(null);

  // Estados de edición del panel lateral
  const [editedPrice, setEditedPrice] = useState<number>(0);
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [editedAgent, setEditedAgent] = useState<string>('');
  const [editedClient, setEditedClient] = useState<string>('');
  const [editedProperty, setEditedProperty] = useState<string>('');
  const [editedStage, setEditedStage] = useState<string>('');
  const [savingDetails, setSavingDetails] = useState<boolean>(false);

  // Estados de modal "Nueva Operación"
  const [showNewOpModal, setShowNewOpModal] = useState<boolean>(false);
  const [newOpType, setNewOpType] = useState<string>('venta');
  const [newOpProperty, setNewOpProperty] = useState<string>('');
  const [newOpClient, setNewOpClient] = useState<string>('');
  const [newOpAgent, setNewOpAgent] = useState<string>('');
  const [newOpPrice, setNewOpPrice] = useState<number>(0);
  const [newOpNotes, setNewOpNotes] = useState<string>('');
  const [creatingOp, setCreatingOp] = useState<boolean>(false);

  // Sincronizar datos cargados por hooks en el estado local del Kanban
  useEffect(() => {
    if (operations && operations.length > 0) {
      setOps(operations);
    }
  }, [operations]);

  const selectedOp = ops.find(o => o.id === selectedOpId);

  // Cargar datos editables en el panel lateral
  useEffect(() => {
    if (selectedOp) {
      setEditedPrice(selectedOp.precio_oferta || selectedOp.precio_salida || 0);
      setEditedNotes(selectedOp.notas || '');
      setEditedAgent(selectedOp.agente_id || '');
      setEditedClient(selectedOp.cliente_id || selectedOp.comprador_id || selectedOp.vendedor_id || '');
      setEditedProperty(selectedOp.propiedad_id || '');
      setEditedStage(selectedOp.estado || '');
    }
  }, [selectedOpId, selectedOp]);

  // Helpers para obtener datos relacionados
  const getProperty = (propId: string) => properties.find(p => p.id === propId);
  const getPropertyTitle = (propId: string) => getProperty(propId)?.titulo || 'Inmueble Desconocido';
  const getPropertyImage = (propId: string) => {
    const prop = getProperty(propId);
    return prop?.fotos?.[0] || '';
  };
  const getClientName = (clientId: string) => {
    const lead = leads.find(l => l.id === clientId);
    return lead ? `${lead.nombre} ${lead.apellidos}` : 'Cliente Desconocido';
  };
  const getAgentInitials = (agentId: string) => {
    const agent = users.find(u => u.id === agentId);
    return agent ? `${agent.nombre[0]}${agent.apellidos[0]}` : 'NA';
  };

  // ── Drag and Drop Lógica Nativa HTML5 ──
  const handleMoveOperation = async (opId: string, newStage: string) => {
    let targetStage = newStage;
    if (newStage === 'firma') {
      targetStage = 'firma';
    }

    const currentOp = ops.find(o => o.id === opId);
    if (!currentOp || currentOp.estado === targetStage) return;

    // Actualización optimista en local
    const oldOps = [...ops];
    setOps(ops.map(o => o.id === opId ? { ...o, estado: targetStage } : o));

    try {
      if (token) {
        const cleanId = sanitizeUUID(opId);
        await supabaseUpdate('operations', cleanId, { estado: targetStage }, token);
      }
    } catch (err) {
      console.error('[Pipeline] Error al actualizar estado en la base de datos:', err);
      setOps(oldOps);
      showToast('Error de red: No se pudo guardar la nueva fase de la operación en el servidor.', 'error');
    }
  };

  // ── Guardar detalles de operación editados en el panel lateral ──
  const handleSaveDetails = async () => {
    if (!selectedOp) return;
    setSavingDetails(true);

    const updatedOp = {
      ...selectedOp,
      precio_oferta: editedPrice,
      notas: editedNotes,
      agente_id: editedAgent,
      cliente_id: editedClient,
      propiedad_id: editedProperty,
      estado: editedStage,
    };

    // Actualización local inmediata
    setOps(ops.map(o => o.id === selectedOp.id ? updatedOp : o));

    try {
      if (token) {
        const cleanId = sanitizeUUID(selectedOp.id);
        await supabaseUpdate('operations', cleanId, {
          precio_oferta: editedPrice,
          precio_cierre: editedStage === 'firma' || editedStage === 'cierre' ? editedPrice : undefined,
          notas: editedNotes,
          agente_id: sanitizeUUID(editedAgent),
          cliente_id: sanitizeUUID(editedClient),
          propiedad_id: sanitizeUUID(editedProperty),
          estado: editedStage,
        }, token);
      }
      showToast('Detalles guardados exitosamente.', 'success');
    } catch (err) {
      console.error('[Pipeline] Error al guardar cambios en base de datos:', err);
      showToast('Error al sincronizar los detalles con el servidor.', 'error');
    } finally {
      setSavingDetails(false);
    }
  };

  // ── Crear nueva operación en la base de datos ──
  const handleCreateOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpProperty || !newOpClient || !newOpAgent) {
      showToast('Por favor, selecciona un inmueble, un cliente y un agente responsable.', 'warning');
      return;
    }

    setCreatingOp(true);
    const agencyId = user?.agency_id || sanitizeUUID('ag-001');

    try {
      if (token) {
        const cleanData = {
          agency_id: sanitizeUUID(agencyId),
          tipo_operacion: newOpType,
          propiedad_id: sanitizeUUID(newOpProperty),
          cliente_id: sanitizeUUID(newOpClient),
          agente_id: sanitizeUUID(newOpAgent),
          estado: 'calificacion',
          precio_salida: newOpPrice,
          notas: newOpNotes,
          fecha_inicio: new Date().toISOString().split('T')[0],
        };

        const result = await supabaseInsert<any>('operations', cleanData, token);
        if (result && result.length > 0) {
          const created = result[0];
          setOps([created, ...ops]);
          setSelectedOpId(created.id);
        } else {
          throw new Error('Fallo al obtener respuesta de inserción.');
        }
      } else {
        // Simulación mock
        const mockNewOp = {
          id: `op-mock-${Date.now()}`,
          agency_id: agencyId,
          tipo_operacion: newOpType,
          propiedad_id: newOpProperty,
          cliente_id: newOpClient,
          agente_id: newOpAgent,
          estado: 'calificacion',
          precio_salida: newOpPrice,
          notas: newOpNotes,
          fecha_inicio: new Date().toISOString().split('T')[0],
        };
        setOps([mockNewOp, ...ops]);
        setSelectedOpId(mockNewOp.id);
      }

      // Reset y cerrar modal
      setShowNewOpModal(false);
      setNewOpProperty('');
      setNewOpClient('');
      setNewOpAgent('');
      setNewOpPrice(0);
      setNewOpNotes('');
      showToast('Nueva operación creada.', 'success');
    } catch (err) {
      console.error('[Pipeline] Error al registrar nueva operación:', err);
      showToast('Error al dar de alta la operación.', 'error');
    } finally {
      setCreatingOp(false);
    }
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
        <button className="btn btn--primary" onClick={() => setShowNewOpModal(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Nueva Operación
        </button>
      </header>

      <div className={styles.boardWrapper}>
        {/* Tablero Kanban */}
        <div className={styles.board}>
          {COLUMNS.map(column => {
            const columnOperations = ops.filter(op => {
              if (column.id === 'firma') {
                return op.estado === 'firma' || op.estado === 'cierre';
              }
              return op.estado === column.id;
            });

            const columnTotalValue = columnOperations.reduce((total, op) => total + (op.precio_oferta || op.precio_salida || 0), 0);

            return (
              <div 
                key={column.id} 
                className={`${styles.column} ${draggedOverColId === column.id ? styles.columnDragOver : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDraggedOverColId(column.id)}
                onDragLeave={() => {
                  if (draggedOverColId === column.id) setDraggedOverColId(null);
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDraggedOverColId(null);
                  const opId = e.dataTransfer.getData('text/plain');
                  if (opId) {
                    await handleMoveOperation(opId, column.id);
                  }
                }}
              >
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
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', op.id);
                        e.currentTarget.classList.add(styles.dragging);
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.classList.remove(styles.dragging);
                      }}
                    >
                      {getPropertyImage(op.propiedad_id!) && (
                        <div className={styles.cardImageWrap}>
                          <img src={getPropertyImage(op.propiedad_id!)} alt="" className={styles.cardImage} />
                        </div>
                      )}

                      <div className={styles.cardBody}>
                        <div className={styles.cardHeader}>
                          <span className={`${styles.cardType} ${styles[op.tipo_operacion]}`}>
                            {op.tipo_operacion}
                          </span>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-tertiary)' }}>drag_indicator</span>
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

        {/* Panel Lateral de Detalle (Edición y Acciones) */}
        {selectedOp && (
          <aside className={styles.sidePanel}>
            <div className={styles.sidePanelHeader}>
              <h2 className="text-title">Detalle Operación</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedOpId(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.sidePanelContent}>
              <div className={styles.editSection}>
                <h3 className={styles.sectionTitle}>Edición de Datos</h3>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Propiedad Asociada</label>
                  <select 
                    className={styles.select}
                    value={editedProperty} 
                    onChange={(e) => setEditedProperty(e.target.value)}
                  >
                    <option value="">Selecciona propiedad...</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.titulo} ({formatCurrency(p.precio)})</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Cliente / Lead</label>
                  <select 
                    className={styles.select}
                    value={editedClient} 
                    onChange={(e) => setEditedClient(e.target.value)}
                  >
                    <option value="">Selecciona cliente...</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.nombre} {l.apellidos}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Agente Responsable</label>
                  <select 
                    className={styles.select}
                    value={editedAgent} 
                    onChange={(e) => setEditedAgent(e.target.value)}
                  >
                    <option value="">Selecciona agente...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} {u.apellidos}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Fase del Pipeline</label>
                  <select 
                    className={styles.select}
                    value={editedStage} 
                    onChange={(e) => setEditedStage(e.target.value)}
                  >
                    {COLUMNS.map(col => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                    <option value="cierre">Cierre</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Precio Oferta / Cierre (€)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={editedPrice} 
                    onChange={(e) => setEditedPrice(Number(e.target.value))}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Notas de Seguimiento</label>
                  <textarea 
                    className={styles.textarea} 
                    value={editedNotes} 
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Escribe notas de la operación..."
                  />
                </div>

                <button 
                  className={`btn btn--primary ${styles.saveBtn}`}
                  onClick={handleSaveDetails}
                  disabled={savingDetails}
                >
                  {savingDetails ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              {/* Integración del Gestor Documental (Regla 6) */}
              <div style={{ marginTop: '2.5rem' }}>
                <DocumentManager operationId={selectedOp.id} agencyId={selectedOp.agency_id} />
              </div>

              {/* Integración de Firmas (Regla 7) */}
              <div style={{ marginTop: '1rem' }}>
                <SignatureManager 
                  operationId={selectedOp.id} 
                  agencyId={selectedOp.agency_id} 
                  clientName={getClientName(selectedOp.cliente_id || '')} 
                />
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Modal interactivo de Nueva Operación */}
      {showNewOpModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nueva Operación Comercial</h2>
              <button className={styles.closeBtn} onClick={() => setShowNewOpModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateOperation} className={styles.modalForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Tipo de Operación</label>
                <select 
                  className={styles.select}
                  value={newOpType}
                  onChange={(e) => setNewOpType(e.target.value)}
                >
                  <option value="venta">Venta</option>
                  <option value="compra">Compra</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Inmueble / Propiedad *</label>
                <select 
                  className={styles.select}
                  value={newOpProperty}
                  onChange={(e) => setNewOpProperty(e.target.value)}
                  required
                >
                  <option value="">Selecciona una propiedad...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.titulo} ({formatCurrency(p.precio)})</option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Cliente / Lead *</label>
                <select 
                  className={styles.select}
                  value={newOpClient}
                  onChange={(e) => setNewOpClient(e.target.value)}
                  required
                >
                  <option value="">Selecciona un cliente...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre} {l.apellidos}</option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Agente Responsable *</label>
                <select 
                  className={styles.select}
                  value={newOpAgent}
                  onChange={(e) => setNewOpAgent(e.target.value)}
                  required
                >
                  <option value="">Selecciona un agente...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} {u.apellidos}</option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Precio de Salida (€)</label>
                <input 
                  type="number" 
                  className={styles.input}
                  value={newOpPrice}
                  onChange={(e) => setNewOpPrice(Number(e.target.value))}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Notas iniciales</label>
                <textarea 
                  className={styles.textarea}
                  value={newOpNotes}
                  onChange={(e) => setNewOpNotes(e.target.value)}
                  placeholder="Comentarios sobre la operación..."
                />
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className="btn btn--outline" 
                  onClick={() => setShowNewOpModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={creatingOp}
                >
                  {creatingOp ? 'Creando...' : 'Crear Operación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
