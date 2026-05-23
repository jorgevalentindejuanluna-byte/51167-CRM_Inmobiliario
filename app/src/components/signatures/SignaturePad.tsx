'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './SignaturePad.module.css';

interface Point {
  x: number;
  y: number;
  t: number; // Timestamp
  p?: number; // Presión
}

interface SignaturePadProps {
  onSave: (strokes: Point[]) => void;
  onClear?: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Point[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configuración inicial del estilo de trazo (dorado premium del design system)
    ctx.strokeStyle = '#f2be8c'; 
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Ajustar el Canvas a alta densidad de píxeles (DPI / DPR) para máxima nitidez
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Volver a aplicar los estilos tras redimensionar el canvas
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#f2be8c'; 
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Dibujar los trazos previos si el canvas se redimensiona
      if (strokes.length > 1) {
        ctx.beginPath();
        ctx.moveTo(strokes[0].x, strokes[0].y);
        for (let i = 1; i < strokes.length; i++) {
          ctx.lineTo(strokes[i].x, strokes[i].y);
        }
        ctx.stroke();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [strokes]);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, t: Date.now(), p: 0.5 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      t: Date.now(),
      p: e.touches ? (e.touches[0].force || 0.5) : 0.5
    };
  };

  const startDrawing = (e: any) => {
    const pos = getPos(e);
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
    
    setStrokes(prev => [...prev, pos]);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    
    // Evitar scroll de la página en dispositivos táctiles mientras se firma
    if (e.cancelable) e.preventDefault();
    
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    
    setStrokes(prev => [...prev, pos]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
    setStrokes([]);
    if (onClear) onClear();
  };

  const save = () => {
    if (strokes.length > 0) {
      onSave(strokes);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className={styles.controls}>
        <button className="btn btn--secondary btn--sm" onClick={clear}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
          Limpiar Lienzo
        </button>
        <button 
          className="btn btn--primary btn--sm" 
          onClick={save}
          disabled={strokes.length === 0}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
          Confirmar Firma
        </button>
      </div>
      <p className={styles.hint}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--color-primary)' }}>info</span>
        Firma biométrica presencial: registrando coordenadas del trazo, velocidad de firma y presión del dispositivo.
      </p>
    </div>
  );
}
