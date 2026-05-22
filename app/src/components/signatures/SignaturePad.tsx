'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './SignaturePad.module.css';

interface Point {
  x: number;
  y: number;
  t: number; // Timestamp
  p?: number; // Pressure
}

interface SignaturePadProps {
  onSave: (strokes: Point[]) => void;
  onClear?: () => void;
}

export default function SignaturePad({ onSave, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Point[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
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
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(pos.x, pos.y);
    setStrokes(prev => [...prev, pos]);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    e.preventDefault(); // Evitar scroll en táctil
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className={styles.canvas}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className={styles.controls}>
        <button className="btn btn--secondary btn--sm" onClick={clear}>Limpiar</button>
        <button 
          className="btn btn--primary btn--sm" 
          onClick={save}
          disabled={strokes.length === 0}
        >
          Confirmar Firma
        </button>
      </div>
      <p className={styles.hint}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
        Firma biométrica: Se registra trazo, velocidad y presión (si el dispositivo lo permite).
      </p>
    </div>
  );
}
