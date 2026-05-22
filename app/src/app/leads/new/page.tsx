'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LEAD_ORIGEN_LABELS,
  LEAD_TIPO_LABELS,
  TIPO_OPERACION_LABELS,
} from '@/lib/constants';
import type { LeadOrigen, LeadTipo, TipoOperacion } from '@/lib/models/types';
import styles from './page.module.css';

interface NewLeadForm {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  whatsapp: string;
  tipo_lead: LeadTipo;
  tipo_operacion: TipoOperacion;
  origen: LeadOrigen;
  zona_interes: string;
  presupuesto_min: string;
  presupuesto_max: string;
  urgencia: string;
  notas: string;
  // RGPD obligatorio (regla 5.2)
  consentimiento_rgpd: boolean;
  canal_consentimiento: string;
  origen_dato: string;
  finalidad_tratamiento: string;
}

const INITIAL_FORM: NewLeadForm = {
  nombre: '',
  apellidos: '',
  email: '',
  telefono: '',
  whatsapp: '',
  tipo_lead: 'comprador',
  tipo_operacion: 'compra',
  origen: 'web',
  zona_interes: '',
  presupuesto_min: '',
  presupuesto_max: '',
  urgencia: 'media',
  notas: '',
  consentimiento_rgpd: false,
  canal_consentimiento: 'formulario_web',
  origen_dato: '',
  finalidad_tratamiento: 'Gestión comercial inmobiliaria',
};

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState<NewLeadForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof NewLeadForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const updateField = (field: keyof NewLeadForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpiar error al editar
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NewLeadForm, string>> = {};

    if (!form.nombre.trim()) newErrors.nombre = 'Nombre obligatorio';
    if (!form.apellidos.trim()) newErrors.apellidos = 'Apellidos obligatorios';
    if (!form.telefono.trim() && !form.email.trim()) {
      newErrors.telefono = 'Indica teléfono o email';
      newErrors.email = 'Indica teléfono o email';
    }
    // RGPD obligatorio (regla 5.2)
    if (!form.consentimiento_rgpd) {
      newErrors.consentimiento_rgpd = 'El consentimiento RGPD es obligatorio para registrar un lead';
    }
    if (!form.origen_dato.trim()) {
      newErrors.origen_dato = 'Indica el origen del dato (obligatorio RGPD)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);

    // Mock: simular guardado
    await new Promise((resolve) => setTimeout(resolve, 600));

    // En producción: INSERT en Supabase con agency_id del usuario actual
    alert('Lead registrado correctamente (datos mock).\nScore IA calculado: 45');

    setSaving(false);
    router.push('/leads');
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/leads" className={styles.breadcrumbLink}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Leads
        </Link>
        <span className="text-muted">/</span>
        <span>Nuevo Lead</span>
      </nav>

      <header className={styles.header}>
        <h1 className="text-headline">Registrar Nuevo Lead</h1>
        <p className="text-helper text-muted">Todos los campos marcados con * son obligatorios.</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.formGrid}>

        {/* ─── Datos personales ─── */}
        <div className={`card ${styles.section}`}>
          <h2 className={styles.sectionTitle}>
            <span className="material-symbols-outlined">person</span>
            Datos Personales
          </h2>

          <div className={styles.fieldRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-nombre">Nombre *</label>
              <input
                id="lead-nombre"
                type="text"
                className={`input ${errors.nombre ? 'input--error' : ''}`}
                value={form.nombre}
                onChange={(e) => updateField('nombre', e.target.value)}
                placeholder="Nombre"
              />
              {errors.nombre && <span className={styles.fieldError}>{errors.nombre}</span>}
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-apellidos">Apellidos *</label>
              <input
                id="lead-apellidos"
                type="text"
                className={`input ${errors.apellidos ? 'input--error' : ''}`}
                value={form.apellidos}
                onChange={(e) => updateField('apellidos', e.target.value)}
                placeholder="Apellidos"
              />
              {errors.apellidos && <span className={styles.fieldError}>{errors.apellidos}</span>}
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-email">Email</label>
              <input
                id="lead-email"
                type="email"
                className={`input ${errors.email ? 'input--error' : ''}`}
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-telefono">Teléfono</label>
              <input
                id="lead-telefono"
                type="tel"
                className={`input ${errors.telefono ? 'input--error' : ''}`}
                value={form.telefono}
                onChange={(e) => updateField('telefono', e.target.value)}
                placeholder="+34 600 000 000"
              />
              {errors.telefono && <span className={styles.fieldError}>{errors.telefono}</span>}
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-whatsapp">WhatsApp</label>
              <input
                id="lead-whatsapp"
                type="tel"
                className="input"
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </div>

        {/* ─── Clasificación ─── */}
        <div className={`card ${styles.section}`}>
          <h2 className={styles.sectionTitle}>
            <span className="material-symbols-outlined">category</span>
            Clasificación
          </h2>

          <div className={styles.fieldRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-tipo">Tipo de lead *</label>
              <select
                id="lead-tipo"
                className="input"
                style={{ padding: '12px 16px', background: 'var(--color-surface-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}
                value={form.tipo_lead}
                onChange={(e) => updateField('tipo_lead', e.target.value)}
              >
                {Object.entries(LEAD_TIPO_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-operacion">Operación</label>
              <select
                id="lead-operacion"
                className="input"
                style={{ padding: '12px 16px', background: 'var(--color-surface-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}
                value={form.tipo_operacion}
                onChange={(e) => updateField('tipo_operacion', e.target.value)}
              >
                {Object.entries(TIPO_OPERACION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-origen">Origen *</label>
              <select
                id="lead-origen"
                className="input"
                style={{ padding: '12px 16px', background: 'var(--color-surface-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}
                value={form.origen}
                onChange={(e) => updateField('origen', e.target.value)}
              >
                {Object.entries(LEAD_ORIGEN_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-urgencia">Urgencia</label>
              <select
                id="lead-urgencia"
                className="input"
                style={{ padding: '12px 16px', background: 'var(--color-surface-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}
                value={form.urgencia}
                onChange={(e) => updateField('urgencia', e.target.value)}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-zona">Zona de interés</label>
              <input
                id="lead-zona"
                type="text"
                className="input"
                value={form.zona_interes}
                onChange={(e) => updateField('zona_interes', e.target.value)}
                placeholder="Salamanca, Madrid"
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-presupuesto-min">Presupuesto mín. (€)</label>
              <input
                id="lead-presupuesto-min"
                type="number"
                className="input"
                value={form.presupuesto_min}
                onChange={(e) => updateField('presupuesto_min', e.target.value)}
                placeholder="250000"
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-presupuesto-max">Presupuesto máx. (€)</label>
              <input
                id="lead-presupuesto-max"
                type="number"
                className="input"
                value={form.presupuesto_max}
                onChange={(e) => updateField('presupuesto_max', e.target.value)}
                placeholder="500000"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="lead-notas">Notas</label>
            <textarea
              id="lead-notas"
              className="input"
              rows={3}
              value={form.notas}
              onChange={(e) => updateField('notas', e.target.value)}
              placeholder="Información adicional sobre el lead..."
              style={{ resize: 'vertical', padding: '12px 16px', background: 'var(--color-surface-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        </div>

        {/* ─── RGPD (regla 5.2: obligatorio) ─── */}
        <div className={`card ${styles.section} ${styles.rgpdSection}`}>
          <h2 className={styles.sectionTitle}>
            <span className="material-symbols-outlined">shield</span>
            RGPD y Consentimiento
            <span className="badge badge--warning" style={{ marginLeft: '8px' }}>Obligatorio</span>
          </h2>
          <p className="text-helper text-muted" style={{ marginBottom: '16px' }}>
            Según la normativa de protección de datos, es obligatorio registrar el consentimiento
            del interesado antes de almacenar sus datos personales.
          </p>

          <div className={styles.rgpdCheck}>
            <label className={styles.consentLabel}>
              <input
                type="checkbox"
                checked={form.consentimiento_rgpd}
                onChange={(e) => updateField('consentimiento_rgpd', e.target.checked)}
                id="lead-rgpd-consent"
              />
              <div>
                <strong>El interesado ha otorgado consentimiento expreso *</strong>
                <p className="text-helper text-muted">
                  Confirmo que el lead ha dado su consentimiento para el tratamiento de sus datos
                  con fines de gestión comercial inmobiliaria.
                </p>
              </div>
            </label>
            {errors.consentimiento_rgpd && (
              <span className={styles.fieldError}>{errors.consentimiento_rgpd}</span>
            )}
          </div>

          <div className={styles.fieldRow}>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-canal-consent">Canal de consentimiento *</label>
              <select
                id="lead-canal-consent"
                className="input"
                style={{ padding: '12px 16px', background: 'var(--color-surface-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}
                value={form.canal_consentimiento}
                onChange={(e) => updateField('canal_consentimiento', e.target.value)}
              >
                <option value="formulario_web">Formulario Web</option>
                <option value="presencial">Presencial</option>
                <option value="telefono">Teléfono</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="lead-origen-dato">Origen del dato *</label>
              <input
                id="lead-origen-dato"
                type="text"
                className={`input ${errors.origen_dato ? 'input--error' : ''}`}
                value={form.origen_dato}
                onChange={(e) => updateField('origen_dato', e.target.value)}
                placeholder="Idealista - Anuncio Piso Salamanca"
              />
              {errors.origen_dato && <span className={styles.fieldError}>{errors.origen_dato}</span>}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="lead-finalidad">Finalidad del tratamiento</label>
            <input
              id="lead-finalidad"
              type="text"
              className="input"
              value={form.finalidad_tratamiento}
              onChange={(e) => updateField('finalidad_tratamiento', e.target.value)}
              placeholder="Gestión comercial inmobiliaria"
              style={{ background: 'var(--color-surface-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}
            />
          </div>
        </div>

        {/* ─── Acciones ─── */}
        <div className={styles.actions}>
          <Link href="/leads" className="btn btn--ghost">
            Cancelar
          </Link>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={saving}
            id="btn-save-lead"
          >
            {saving ? 'Guardando...' : 'Registrar Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
