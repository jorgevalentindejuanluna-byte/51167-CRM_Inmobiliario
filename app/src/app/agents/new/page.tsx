'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AGENT_TYPE_LABELS, AGENT_RELACION_LABELS } from '@/lib/constants';
import styles from './page.module.css';

export default function NewAgentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    tipo_agente: 'interno',
    oficina: '',
    zona_principal: '',
    tipo_relacion: 'autonomo',
    porcentaje_comision: 50,
    comision_venta: 2.5,
    comision_captacion: 2,
  });

  const updateField = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/agents');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className="text-headline">Nuevo Agente</h1>
          <p className="text-helper text-muted">Añade un nuevo agente al equipo comercial.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="card">
          <h3 className="text-title" style={{ marginBottom: '1rem' }}>Datos Personales</h3>
          <div className={styles.grid2col}>
            <div className="input-group">
              <label className="input-label">Nombre *</label>
              <input type="text" className="input" required value={form.nombre} onChange={(e) => updateField('nombre', e.target.value)} placeholder="Nombre" />
            </div>
            <div className="input-group">
              <label className="input-label">Apellidos *</label>
              <input type="text" className="input" required value={form.apellidos} onChange={(e) => updateField('apellidos', e.target.value)} placeholder="Apellidos" />
            </div>
            <div className="input-group">
              <label className="input-label">Email *</label>
              <input type="email" className="input" required value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="email@agencia.com" />
            </div>
            <div className="input-group">
              <label className="input-label">Teléfono *</label>
              <input type="tel" className="input" required value={form.telefono} onChange={(e) => updateField('telefono', e.target.value)} placeholder="+34 612 345 678" />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-title" style={{ marginBottom: '1rem' }}>Datos Profesionales</h3>
          <div className={styles.grid2col}>
            <div className="input-group">
              <label className="input-label">Tipo de Agente *</label>
              <select className="input" value={form.tipo_agente} onChange={(e) => updateField('tipo_agente', e.target.value)}>
                {Object.entries(AGENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Oficina</label>
              <input type="text" className="input" value={form.oficina} onChange={(e) => updateField('oficina', e.target.value)} placeholder="Oficina asignada" />
            </div>
            <div className="input-group">
              <label className="input-label">Zona Principal</label>
              <input type="text" className="input" value={form.zona_principal} onChange={(e) => updateField('zona_principal', e.target.value)} placeholder="Ej. Salamanca" />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-title" style={{ marginBottom: '1rem' }}>Datos Económicos</h3>
          <div className={styles.grid2col}>
            <div className="input-group">
              <label className="input-label">Tipo de Relación</label>
              <select className="input" value={form.tipo_relacion} onChange={(e) => updateField('tipo_relacion', e.target.value)}>
                {Object.entries(AGENT_RELACION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">% Comisión Global</label>
              <input type="number" className="input" value={form.porcentaje_comision} onChange={(e) => updateField('porcentaje_comision', Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label className="input-label">% Comisión Venta</label>
              <input type="number" className="input" value={form.comision_venta} onChange={(e) => updateField('comision_venta', Number(e.target.value))} step="0.1" />
            </div>
            <div className="input-group">
              <label className="input-label">% Comisión Captación</label>
              <input type="number" className="input" value={form.comision_captacion} onChange={(e) => updateField('comision_captacion', Number(e.target.value))} step="0.1" />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="button" className="btn btn--outline" onClick={() => router.push('/agents')}>Cancelar</button>
          <button type="submit" className="btn btn--primary">Crear Agente</button>
        </div>
      </form>
    </div>
  );
}
