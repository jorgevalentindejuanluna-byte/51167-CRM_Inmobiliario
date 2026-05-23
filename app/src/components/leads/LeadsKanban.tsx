'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Lead, LeadEstado } from '@/lib/models/types';
import { LEAD_ESTADO_LABELS, LEAD_ESTADO_COLORS, LEAD_TIPO_LABELS, LEAD_TIPO_COLORS, LEAD_TEMP_LABELS } from '@/lib/constants';

interface LeadsKanbanProps {
  leads: Lead[];
  onLeadMoved: (leadId: string, newEstado: LeadEstado) => void;
}

export default function LeadsKanban({ leads, onLeadMoved }: LeadsKanbanProps) {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  
  // Ordenar columnas según el embudo comercial (LEAD_ESTADO_LABELS)
  const columns = Object.keys(LEAD_ESTADO_LABELS) as LeadEstado[];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Ocultar levemente la tarjeta original mientras se arrastra
    setTimeout(() => {
      const el = e.target as HTMLElement;
      if (el) el.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedLeadId(null);
    const el = e.target as HTMLElement;
    if (el) el.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newEstado: LeadEstado) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      onLeadMoved(leadId, newEstado);
    }
    setDraggedLeadId(null);
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      overflowX: 'auto', 
      paddingBottom: '1rem', 
      minHeight: '600px',
      alignItems: 'flex-start'
    }}>
      {columns.map((estado) => {
        const columnLeads = leads.filter(l => l.estado === estado);
        const colorVar = `var(--color-${LEAD_ESTADO_COLORS[estado]})`;

        return (
          <div 
            key={estado}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, estado)}
            style={{
              minWidth: '320px',
              maxWidth: '320px',
              backgroundColor: 'var(--color-surface-variant)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              borderTop: `4px solid ${colorVar}`,
              height: '100%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 600 }}>{LEAD_ESTADO_LABELS[estado]}</h3>
              <span className="badge badge--neutral" style={{ fontWeight: 600 }}>{columnLeads.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '50px' }}>
              {columnLeads.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem', padding: '1rem 0', border: '1px dashed var(--color-outline-variant)', borderRadius: '6px' }}>
                  Suelta un lead aquí
                </div>
              )}
              {columnLeads.map((lead) => (
                <div 
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onDragEnd={handleDragEnd}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'grab',
                    border: '1px solid var(--color-outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link href={`/leads/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <strong style={{ fontSize: '0.9rem', display: 'block' }}>{lead.nombre} {lead.apellidos}</strong>
                    </Link>
                    <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 4px', background: LEAD_TIPO_COLORS[lead.tipo_lead] || '#95a5a6', color: '#fff' }}>
                      {LEAD_TIPO_LABELS[lead.tipo_lead]}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {lead.email || lead.telefono || 'Sin datos de contacto'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span className="text-helper" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className={`temp-dot temp-dot--${lead.temperatura}`} />
                      {LEAD_TEMP_LABELS[lead.temperatura]}
                    </span>
                    
                    {lead.score > 0 && (
                      <div 
                        title={`Score IA: ${lead.score}`}
                        style={{
                          background: lead.score >= 80 ? '#e8f5e9' : lead.score >= 50 ? '#fff8e1' : '#ffebee',
                          color: lead.score >= 80 ? '#2e7d32' : lead.score >= 50 ? '#f57f17' : '#c62828',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>psychology</span>
                        {lead.score}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
