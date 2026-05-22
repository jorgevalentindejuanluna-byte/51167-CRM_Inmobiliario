'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simular guardado
    setTimeout(() => {
      setLoading(false);
      router.push('/properties');
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Link href="/properties" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            </Link>
            <span style={{ color: 'var(--color-text-secondary)' }}>Inmuebles / Nuevo Inmueble</span>
          </div>
          <h1 className={styles.title}>Registrar Nuevo Inmueble</h1>
          <p className={styles.subtitle}>
            Todos los campos marcados con * son obligatorios.
          </p>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        
        {/* Datos Básicos */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={`material-symbols-outlined ${styles.sectionIcon}`}>real_estate_agent</span>
            <h2 className={styles.sectionTitle}>Datos Básicos</h2>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Referencia *</label>
              <input type="text" className={styles.input} required placeholder="Ej. RTS-2026-012" defaultValue={`RTS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`} />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Título Público *</label>
              <input type="text" className={styles.input} required placeholder="Ej. Espectacular ático en Salamanca" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Inmueble *</label>
              <select className={styles.input} required defaultValue="piso">
                <option value="piso">Piso / Apartamento</option>
                <option value="casa">Casa</option>
                <option value="chalet">Chalet</option>
                <option value="local">Local Comercial</option>
                <option value="oficina">Oficina</option>
                <option value="terreno">Terreno / Parcela</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Operación *</label>
              <select className={styles.input} required defaultValue="venta">
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
                <option value="inversion">Inversión</option>
              </select>
            </div>
          </div>
        </section>

        {/* Ubicación */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={`material-symbols-outlined ${styles.sectionIcon}`}>location_on</span>
            <h2 className={styles.sectionTitle}>Ubicación</h2>
          </div>
          
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Dirección Exacta *</label>
              <input type="text" className={styles.input} required placeholder="Calle, número, piso..." />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Ciudad *</label>
              <input type="text" className={styles.input} required placeholder="Madrid" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Zona / Barrio</label>
              <input type="text" className={styles.input} placeholder="Ej. Salamanca, Chamberí..." />
            </div>
          </div>
        </section>

        {/* Características */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={`material-symbols-outlined ${styles.sectionIcon}`}>tune</span>
            <h2 className={styles.sectionTitle}>Características y Precio</h2>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Precio (€) *</label>
              <input type="number" className={styles.input} required min="0" step="100" placeholder="0" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Superficie (m²) *</label>
              <input type="number" className={styles.input} required min="0" placeholder="0" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Habitaciones</label>
              <input type="number" className={styles.input} min="0" placeholder="0" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Baños</label>
              <input type="number" className={styles.input} min="0" placeholder="0" />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Extras</label>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkboxLabel}>Ascensor</span>
                </label>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkboxLabel}>Garaje</span>
                </label>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkboxLabel}>Terraza</span>
                </label>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkboxLabel}>Piscina</span>
                </label>
                <label className={styles.checkboxGroup}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span className={styles.checkboxLabel}>Precio Negociable</span>
                </label>
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Descripción Pública</label>
              <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Descripción detallada de la propiedad..."></textarea>
            </div>
          </div>
        </section>

        {/* Acciones */}
        <div className={styles.actions}>
          <Link href="/properties" className="btn btn--secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Propiedad'}
          </button>
        </div>

      </form>
    </div>
  );
}
