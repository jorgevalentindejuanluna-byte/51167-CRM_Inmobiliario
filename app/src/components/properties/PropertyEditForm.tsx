'use client';

import { useState } from 'react';
import type { Property } from '@/lib/models/types';
import styles from './PropertyEditForm.module.css';

interface PropertyEditFormProps {
  property: Property;
  onSave: (updatedProperty: Property) => void;
  onCancel: () => void;
}

export default function PropertyEditForm({ property, onSave, onCancel }: PropertyEditFormProps) {
  const [formData, setFormData] = useState<Property>({ ...property });
  const [saving, setSaving] = useState(false);

  const CARACTERISTICAS = [
    { key: 'ascensor', label: 'Ascensor', icon: 'elevator' },
    { key: 'garaje', label: 'Garaje', icon: 'directions_car' },
    { key: 'terraza', label: 'Terraza', icon: 'balcony' },
    { key: 'balcon', label: 'Balcón', icon: 'deck' },
    { key: 'piscina', label: 'Piscina', icon: 'pool' },
    { key: 'calefaccion', label: 'Calefacción', icon: 'mode_heat' },
    { key: 'aire_acondicionado', label: 'Aire Acond.', icon: 'ac_unit' },
    { key: 'trastero', label: 'Trastero', icon: 'inventory_2' },
    { key: 'acceso_minusvalidos', label: 'Acceso PMR', icon: 'accessible' },
    { key: 'gimnasio', label: 'Gimnasio', icon: 'fitness_center' },
    { key: 'seguridad_24h', label: 'Seguridad 24h', icon: 'security' },
    { key: 'jardin', label: 'Jardín', icon: 'yard' },
    { key: 'armarios_empotrados', label: 'Armarios', icon: 'door_sliding' },
    { key: 'amueblado', label: 'Amueblado', icon: 'chair' },
    { key: 'mascotas_permitidas', label: 'Mascotas', icon: 'pets' },
  ];

  const handleToggleCaracteristica = (key: string) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key as keyof Property] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'number') {
      finalValue = value === '' ? 0 : Number(value);
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Autocompletado de Código Postal
    if (name === 'codigo_postal' && finalValue.length === 5) {
      fetchPostalCodeData(finalValue);
    }
  };

  const fetchPostalCodeData = async (cp: string) => {
    // Diccionario de provincias de España por los dos primeros dígitos del CP
    const provinciasEsp: Record<string, string> = {
      '01': 'Álava', '02': 'Albacete', '03': 'Alicante', '04': 'Almería', '05': 'Ávila', '06': 'Badajoz', '07': 'Illes Balears', '08': 'Barcelona', '09': 'Burgos', '10': 'Cáceres', '11': 'Cádiz', '12': 'Castellón', '13': 'Ciudad Real', '14': 'Córdoba', '15': 'A Coruña', '16': 'Cuenca', '17': 'Girona', '18': 'Granada', '19': 'Guadalajara', '20': 'Gipuzkoa', '21': 'Huelva', '22': 'Huesca', '23': 'Jaén', '24': 'León', '25': 'Lleida', '26': 'La Rioja', '27': 'Lugo', '28': 'Madrid', '29': 'Málaga', '30': 'Murcia', '31': 'Navarra', '32': 'Ourense', '33': 'Asturias', '34': 'Palencia', '35': 'Las Palmas', '36': 'Pontevedra', '37': 'Salamanca', '38': 'Santa Cruz de Tenerife', '39': 'Cantabria', '40': 'Segovia', '41': 'Sevilla', '42': 'Soria', '43': 'Tarragona', '44': 'Teruel', '45': 'Toledo', '46': 'Valencia', '47': 'Valladolid', '48': 'Bizkaia', '49': 'Zamora', '50': 'Zaragoza', '51': 'Ceuta', '52': 'Melilla'
    };

    try {
      const res = await fetch(`https://api.zippopotam.us/es/${cp}`);
      if (res.ok) {
        const data = await res.json();
        const place = data.places[0];
        if (place) {
          const prefix = cp.substring(0, 2);
          const provinciaExacta = provinciasEsp[prefix] || place['state'];

          setFormData(prev => ({
            ...prev,
            ciudad: place['place name'],
            provincia: provinciaExacta
          }));
        }
      }
    } catch (e) {
      console.warn('Error fetching postal code data:', e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simular retraso de guardado
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h3>Editar Datos del Inmueble</h3>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Modifica la información básica, localización y características.</p>
      </div>

      <div className={styles.formGrid}>
        {/* === SECCIÓN BÁSICA === */}
        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>Datos Básicos</h4>
          
          <div className={styles.fieldGroup}>
            <label>Título del Inmueble</label>
            <input name="titulo" value={formData.titulo || ''} onChange={handleChange} className="input" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.fieldGroup}>
              <label>Referencia CRM</label>
              <input name="referencia" value={formData.referencia || ''} onChange={handleChange} className="input" required />
            </div>
            <div className={styles.fieldGroup}>
              <label>Precio (€)</label>
              <input name="precio" type="number" value={formData.precio || 0} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.fieldGroup}>
              <label>Tipo de Inmueble</label>
              <select name="tipo_inmueble" value={formData.tipo_inmueble || 'piso'} onChange={handleChange} className="input">
                <option value="piso">Piso</option>
                <option value="casa">Casa</option>
                <option value="chalet">Chalet</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label>Operación</label>
              <select name="operacion" value={formData.operacion || 'venta'} onChange={handleChange} className="input">
                <option value="compra">Compra</option>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
                <option value="inversion">Inversión</option>
              </select>
            </div>
          </div>
        </div>

        {/* === SECCIÓN LOCALIZACIÓN === */}
        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>Localización y Catastro</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className={styles.fieldGroup}>
              <label>Código Postal</label>
              <input name="codigo_postal" value={formData.codigo_postal || ''} onChange={handleChange} className="input" placeholder="Ej. 28001" maxLength={5} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '4px', display: 'block' }}>
                Se autocompletarán la ciudad y provincia.
              </span>
            </div>
            <div className={styles.fieldGroup}>
              <label>Zona / Barrio</label>
              <input name="zona" value={formData.zona || ''} onChange={handleChange} className="input" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.fieldGroup}>
              <label>Ciudad</label>
              <input name="ciudad" value={formData.ciudad || ''} onChange={handleChange} className="input" required />
            </div>
            <div className={styles.fieldGroup}>
              <label>Provincia</label>
              <input name="provincia" value={formData.provincia || ''} onChange={handleChange} className="input" required />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Dirección Completa</label>
            <input name="direccion" value={formData.direccion || ''} onChange={handleChange} className="input" required />
          </div>

          <div className={styles.fieldGroup}>
            <label>Referencia Catastral</label>
            <input 
              name="referencia_catastral" 
              value={formData.referencia_catastral || ''} 
              onChange={handleChange} 
              className="input" 
              placeholder="Ej. 9872023VH5797S0001WX"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
              Necesaria para el módulo de Análisis IA.
            </span>
          </div>
        </div>

        {/* === SECCIÓN CARACTERÍSTICAS === */}
        <div className={styles.formSection} style={{ gridColumn: '1 / -1' }}>
          <h4 className={styles.sectionTitle}>Características Físicas</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div className={styles.fieldGroup}>
              <label>Superficie (m²)</label>
              <input name="superficie" type="number" value={formData.superficie || 0} onChange={handleChange} className="input" />
            </div>
            <div className={styles.fieldGroup}>
              <label>Habitaciones</label>
              <input name="habitaciones" type="number" value={formData.habitaciones || ''} onChange={handleChange} className="input" />
            </div>
            <div className={styles.fieldGroup}>
              <label>Baños</label>
              <input name="banos" type="number" value={formData.banos || ''} onChange={handleChange} className="input" />
            </div>
            <div className={styles.fieldGroup}>
              <label>Planta</label>
              <input name="planta" value={formData.planta || ''} onChange={handleChange} className="input" placeholder="Ej. 3º B" />
            </div>
          </div>

          <div className={styles.fieldGroup} style={{ marginTop: '1.5rem' }}>
            <label style={{ marginBottom: '12px', display: 'block' }}>Equipamiento y Extras</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
              gap: '12px' 
            }}>
              {CARACTERISTICAS.map(c => {
                const isActive = !!formData[c.key as keyof Property];
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => handleToggleCaracteristica(c.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 8px',
                      borderRadius: '8px',
                      border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                      backgroundColor: isActive ? 'var(--color-primary-container, rgba(200, 169, 110, 0.1))' : 'var(--color-surface)',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      gap: '8px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{c.icon}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, textAlign: 'center' }}>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.fieldGroup} style={{ marginTop: '1rem' }}>
            <label>Descripción Pública</label>
            <textarea 
              name="descripcion" 
              value={formData.descripcion || ''} 
              onChange={handleChange} 
              className="input" 
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Inmueble'}
        </button>
      </div>
    </form>
  );
}
