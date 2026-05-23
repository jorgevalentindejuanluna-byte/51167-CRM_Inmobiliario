'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAgents } from '@/lib/use-data';
import { AGENT_TYPE_LABELS, AGENT_STATUS_LABELS, AGENT_RELACION_LABELS } from '@/lib/constants';
import styles from './page.module.css';

const TIPO_AGENTE_OPTS = ['interno', 'externo', 'colaborador', 'captador', 'freelance'] as const;
const ESTADO_OPTS = ['activo', 'inactivo', 'pendiente_validacion', 'en_formacion', 'suspendido', 'baja_temporal', 'baja_definitiva', 'bloqueado'] as const;
const RELACION_OPTS = ['autonomo', 'laboral', 'freelance', 'colaborador_externo'] as const;

export default function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const { data: agents } = useAgents();
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const agent = agents.find(a => a.id === id);

  useEffect(() => {
    if (agent) {
      setForm({
        nombre: agent.nombre,
        apellidos: agent.apellidos,
        documento_identidad: agent.documento_identidad || '',
        telefono: agent.telefono,
        email: agent.email,
        direccion: agent.direccion || '',
        ciudad: agent.ciudad || '',
        provincia: agent.provincia || '',
        codigo_postal: agent.codigo_postal || '',
        tipo_agente: agent.tipo_agente,
        codigo_interno: agent.codigo_interno || '',
        oficina: agent.oficina || '',
        equipo: agent.equipo || '',
        estado: agent.estado,
        zona_principal: agent.zona_principal || '',
        especializacion: agent.especializacion?.join(', ') || '',
        experiencia_anios: agent.experiencia_anios || '',
        nivel_comercial: agent.nivel_comercial || 1,
        tipo_relacion: agent.tipo_relacion || '',
        porcentaje_comision: agent.porcentaje_comision || '',
        comision_venta: agent.comision_venta || '',
        comision_captacion: agent.comision_captacion || '',
        comision_alquiler: agent.comision_alquiler || '',
        cuenta_bancaria: agent.cuenta_bancaria || '',
        objetivo_mensual: agent.objetivo_mensual || '',
        email_acceso: agent.email_acceso || '',
        autenticacion_2fa: agent.autenticacion_2fa || false,
      });
    }
  }, [agent]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    setSaving(false);
    router.push(`/agents/${id}`);
  }

  if (!id || !agent) {
    return (
      <div className="empty-state">
        <span className="material-symbols-outlined">badge</span>
        <p>Cargando agente...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link href={`/agents/${id}`} className={styles.backBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </Link>
          <h1 className="text-headline">Editar Agente</h1>
          <p className="text-helper text-muted">{agent.nombre} {agent.apellidos}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className="card">
          <h3 className="text-title" style={{ marginBottom: '1rem' }}>Datos Personales</h3>
          <div className={styles.grid2col}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input name="nombre" value={form.nombre || ''} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Apellidos *</label>
              <input name="apellidos" value={form.apellidos || ''} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">DNI/NIE</label>
              <input name="documento_identidad" value={form.documento_identidad || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono *</label>
              <input name="telefono" value={form.telefono || ''} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" value={form.email || ''} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input name="direccion" value={form.direccion || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Ciudad</label>
              <input name="ciudad" value={form.ciudad || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Provincia</label>
              <input name="provincia" value={form.provincia || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Código Postal</label>
              <input name="codigo_postal" value={form.codigo_postal || ''} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </section>

        <section className="card">
          <h3 className="text-title" style={{ marginBottom: '1rem' }}>Datos Profesionales</h3>
          <div className={styles.grid2col}>
            <div className="form-group">
              <label className="form-label">Tipo de Agente</label>
              <select name="tipo_agente" value={form.tipo_agente || ''} onChange={handleChange} className="form-input">
                {TIPO_AGENTE_OPTS.map(o => <option key={o} value={o}>{AGENT_TYPE_LABELS[o]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select name="estado" value={form.estado || ''} onChange={handleChange} className="form-input">
                {ESTADO_OPTS.map(o => <option key={o} value={o}>{AGENT_STATUS_LABELS[o]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Código Interno</label>
              <input name="codigo_interno" value={form.codigo_interno || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Oficina</label>
              <input name="oficina" value={form.oficina || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Equipo</label>
              <input name="equipo" value={form.equipo || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Zona Principal</label>
              <input name="zona_principal" value={form.zona_principal || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Especialización</label>
              <input name="especializacion" value={form.especializacion || ''} onChange={handleChange} placeholder="Ej: Ventas, Captación" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Años Experiencia</label>
              <input name="experiencia_anios" type="number" value={form.experiencia_anios || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Nivel Comercial (1-5)</label>
              <input name="nivel_comercial" type="number" min="1" max="5" value={form.nivel_comercial || 1} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </section>

        <section className="card">
          <h3 className="text-title" style={{ marginBottom: '1rem' }}>Datos Económicos</h3>
          <div className={styles.grid2col}>
            <div className="form-group">
              <label className="form-label">Tipo Relación</label>
              <select name="tipo_relacion" value={form.tipo_relacion || ''} onChange={handleChange} className="form-input">
                <option value="">Seleccionar...</option>
                {RELACION_OPTS.map(o => <option key={o} value={o}>{AGENT_RELACION_LABELS[o]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">% Comisión Global</label>
              <input name="porcentaje_comision" type="number" step="0.01" value={form.porcentaje_comision || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">% Comisión Venta</label>
              <input name="comision_venta" type="number" step="0.01" value={form.comision_venta || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">% Comisión Captación</label>
              <input name="comision_captacion" type="number" step="0.01" value={form.comision_captacion || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">% Comisión Alquiler</label>
              <input name="comision_alquiler" type="number" step="0.01" value={form.comision_alquiler || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Objetivo Mensual (€)</label>
              <input name="objetivo_mensual" type="number" value={form.objetivo_mensual || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Cuenta Bancaria</label>
              <input name="cuenta_bancaria" value={form.cuenta_bancaria || ''} onChange={handleChange} placeholder="ES00 0000 0000 0000 0000 0000" className="form-input" />
            </div>
          </div>
        </section>

        <section className="card">
          <h3 className="text-title" style={{ marginBottom: '1rem' }}>Acceso</h3>
          <div className={styles.grid2col}>
            <div className="form-group">
              <label className="form-label">Email de Acceso</label>
              <input name="email_acceso" type="email" value={form.email_acceso || ''} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <input name="autenticacion_2fa" type="checkbox" checked={!!form.autenticacion_2fa} onChange={handleChange} />
              <label className="form-label" style={{ margin: 0 }}>Autenticación 2FA</label>
            </div>
          </div>
        </section>

        <div className={styles.formActions}>
          <Link href={`/agents/${id}`} className="btn btn--outline">Cancelar</Link>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
