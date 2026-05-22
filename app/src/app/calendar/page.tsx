'use client';

import React, { useState, useMemo } from 'react';
import { useLeads } from '@/lib/use-data';
import { formatDateTime } from '@/lib/constants';
import styles from './page.module.css';

export default function CalendarPage() {
  const { data: leads } = useLeads();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generar días del mes
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Ajustar a Lunes inicio
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Días del mes anterior (relleno)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, month: month - 1, current: false });
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, current: true });
    }
    
    // Días del mes siguiente (relleno)
    const endOffset = 42 - days.length;
    for (let i = 1; i <= endOffset; i++) {
      days.push({ day: i, month: month + 1, current: false });
    }
    
    return days;
  }, [currentDate]);

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const today = () => setCurrentDate(new Date());

  // Agrupar eventos de leads por día
  const eventsByDay: Record<string, any[]> = useMemo(() => {
    const map: Record<string, any[]> = {};
    leads.forEach(lead => {
      if (lead.fecha_proxima_accion) {
        const date = new Date(lead.fecha_proxima_accion);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push({
          id: lead.id,
          title: lead.proxima_accion,
          client: `${lead.nombre} ${lead.apellidos}`,
          time: lead.fecha_proxima_accion,
          type: 'visit'
        });
      }
    });
    return map;
  }, [leads]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendario de Actividades</h1>
          <p className={styles.subtitle}>Gestión de visitas, tasaciones y tareas administrativas.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.monthNav}>
            <button className="btn btn--ghost btn--sm" onClick={prevMonth}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className={styles.currentMonth}>{monthName}</span>
            <button className="btn btn--ghost btn--sm" onClick={nextMonth}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <button className="btn btn--secondary btn--sm" onClick={today}>Hoy</button>
          <button className="btn btn--primary btn--sm">
            <span className="material-symbols-outlined">add</span>
            Nuevo Evento
          </button>
        </div>
      </header>

      <div className={styles.calendarGrid}>
        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Doming'].map(day => (
          <div key={day} className={styles.dayHeader}>{day}</div>
        ))}
        
        {calendarDays.map((dateObj, idx) => {
          const key = `${currentDate.getFullYear()}-${dateObj.month}-${dateObj.day}`;
          const dayEvents = eventsByDay[key] || [];
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), dateObj.month, dateObj.day).toDateString();

          return (
            <div 
              key={idx} 
              className={`${styles.dayCell} ${!dateObj.current ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`}
            >
              <span className={styles.dayNumber}>{dateObj.day}</span>
              <div className={styles.eventContainer}>
                {dayEvents.map(event => (
                  <div key={event.id} className={`${styles.event} ${styles[event.type]}`}>
                    <span className={styles.eventTime}>{new Date(event.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={styles.eventTitle}>{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
