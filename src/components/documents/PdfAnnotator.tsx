'use client';

import { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import styles from './DocumentManager.module.css';

interface PdfAnnotatorProps {
  url: string;
  fileName: string;
  onClose: () => void;
  onSave: (annotatedBlob: Blob) => void;
}

interface TextAnnotation {
  id: string;
  text: string;
  x: number; // porcentaje (0 a 100)
  y: number; // porcentaje (0 a 100)
  page: number;
}

interface DrawingAnnotation {
  id: string;
  points: { x: number; y: number }[]; // porcentajes
  color: string;
  page: number;
}

export default function PdfAnnotator({ url, fileName, onClose, onSave }: PdfAnnotatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tool, setTool] = useState<'select' | 'text' | 'draw'>('select');
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  
  // Anotaciones creadas
  const [texts, setTexts] = useState<TextAnnotation[]>([]);
  const [drawings, setDrawings] = useState<DrawingAnnotation[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  
  // Dibujo actual
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  // Referencias a instancias de PDFJS cargadas dinámicamente
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  
  // Descargar el PDF original
  useEffect(() => {
    let active = true;
    fetch(url)
      .then(r => r.arrayBuffer())
      .then(buf => {
        if (active) {
          setPdfBytes(buf);
        }
      })
      .catch(err => {
        console.error('Error fetching PDF:', err);
      });
    return () => { active = false; };
  }, [url]);

  // Cargar PDF.js para visualizar las páginas
  useEffect(() => {
    if (!pdfBytes) return;
    let active = true;
    
    import('pdfjs-dist').then(pdfjsLib => {
      if (!active) return;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      setPdfjs(pdfjsLib);
      
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) });
      loadingTask.promise.then(pdf => {
        if (!active) return;
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      }).catch(err => {
        console.error('Error loading PDF.js document:', err);
        setLoading(false);
      });
    });
    
    return () => { active = false; };
  }, [pdfBytes]);

  // Renderizar la página actual en el canvas
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || loading) return;
    
    let active = true;
    pdfDocument.getPage(currentPage).then((page: any) => {
      if (!active || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      // Adaptar zoom al ancho del contenedor
      const containerWidth = containerRef.current?.clientWidth || 600;
      const viewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth - 40) / viewport.width;
      const scaledViewport = page.getViewport({ scale: Math.min(scale, 1.5) });
      
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      
      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport
      };
      
      page.render(renderContext).promise.then(() => {
        if (active && overlayRef.current) {
          overlayRef.current.width = canvas.width;
          overlayRef.current.height = canvas.height;
          redrawOverlay();
        }
      });
    });
    
    return () => { active = false; };
  }, [pdfDocument, currentPage, loading, texts, drawings]);

  // Redibujar overlay con anotaciones visuales
  const redrawOverlay = () => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar trazos
    drawings.filter(d => d.page === currentPage).forEach(d => {
      if (d.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const p0 = d.points[0];
      ctx.moveTo(p0.x * canvas.width, p0.y * canvas.height);
      for (let i = 1; i < d.points.length; i++) {
        ctx.lineTo(d.points[i].x * canvas.width, d.points[i].y * canvas.height);
      }
      ctx.stroke();
    });

    // Dibujar trazo actual si se está dibujando
    if (tool === 'draw' && currentPoints.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const p0 = currentPoints[0];
      ctx.moveTo(p0.x * canvas.width, p0.y * canvas.height);
      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x * canvas.width, currentPoints[i].y * canvas.height);
      }
      ctx.stroke();
    }
  };

  // Redibujar siempre que cambie el trazo actual
  useEffect(() => {
    redrawOverlay();
  }, [currentPoints]);

  // Manejadores de eventos de ratón para dibujar
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (tool === 'draw') {
      setIsDrawing(true);
      setCurrentPoints([pos]);
    } else if (tool === 'text') {
      const newText: TextAnnotation = {
        id: Math.random().toString(),
        text: 'Escribe aquí...',
        x: pos.x,
        y: pos.y,
        page: currentPage
      };
      setTexts([...texts, newText]);
      setActiveTextId(newText.id);
      setTool('select');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'draw') return;
    const pos = getMousePos(e);
    setCurrentPoints(prev => [...prev, pos]);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (currentPoints.length > 1) {
        setDrawings([...drawings, {
          id: Math.random().toString(),
          points: currentPoints,
          color: '#dc2626',
          page: currentPage
        }]);
      }
      setCurrentPoints([]);
    }
  };

  // Eliminar una anotación de texto
  const handleRemoveText = (id: string) => {
    setTexts(texts.filter(t => t.id !== id));
    if (activeTextId === id) setActiveTextId(null);
  };

  // Guardar y estampar anotaciones usando pdf-lib
  const handleSaveAndProcess = async () => {
    if (!pdfBytes) return;
    setLoading(true);

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      // Estampar textos
      for (const textItem of texts) {
        if (!textItem.text || textItem.text === 'Escribe aquí...') continue;
        const pageIndex = textItem.page - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;
        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        // Convertir porcentajes a puntos del PDF
        const pdfX = textItem.x * width;
        // En PDF-Lib la coordenada Y empieza desde abajo
        const pdfY = height - (textItem.y * height) - 12;

        page.drawText(textItem.text, {
          x: pdfX,
          y: pdfY,
          size: 11,
          font: helveticaFont,
          color: rgb(0.86, 0.15, 0.15), // Rojo premium
        });
      }

      // Estampar dibujos
      for (const drawItem of drawings) {
        const pageIndex = drawItem.page - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;
        const page = pages[pageIndex];
        const { width, height } = page.getSize();

        for (let i = 1; i < drawItem.points.length; i++) {
          const p1 = drawItem.points[i - 1];
          const p2 = drawItem.points[i];

          page.drawLine({
            start: { x: p1.x * width, y: height - (p1.y * height) },
            end: { x: p2.x * width, y: height - (p2.y * height) },
            thickness: 2,
            color: rgb(0.86, 0.15, 0.15),
          });
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedBlob = new Blob([modifiedPdfBytes as any], { type: 'application/pdf' });
      onSave(modifiedBlob);
    } catch (err) {
      console.error('Error modifying PDF with pdf-lib:', err);
      alert('Hubo un error al estampar las anotaciones en el PDF.');
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#1e1e24', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>edit_note</span>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Anotar PDF: {fileName}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn--ghost btn--sm" style={{ color: '#fff' }} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span>Página {currentPage} de {numPages || '...'}</span>
          <button className="btn btn--ghost btn--sm" style={{ color: '#fff' }} onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))} disabled={currentPage >= numPages}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn--secondary btn--sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn--primary btn--sm" onClick={handleSaveAndProcess} disabled={loading}>Guardar y Firmar</button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.5rem', background: '#2d2d34', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ color: '#aaa', fontSize: '0.8rem', fontWeight: 600 }}>HERRAMIENTAS:</span>
        <button className={`btn btn--sm ${tool === 'select' ? 'btn--primary' : 'btn--ghost'}`} style={{ color: '#fff' }} onClick={() => setTool('select')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>pan_tool</span> Selección
        </button>
        <button className={`btn btn--sm ${tool === 'text' ? 'btn--primary' : 'btn--ghost'}`} style={{ color: '#fff' }} onClick={() => setTool('text')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>title</span> Añadir Campo Texto
        </button>
        <button className={`btn btn--sm ${tool === 'draw' ? 'btn--primary' : 'btn--ghost'}`} style={{ color: '#fff' }} onClick={() => setTool('draw')}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>gesture</span> Dibujar/Firmar
        </button>
        {(texts.length > 0 || drawings.length > 0) && (
          <button className="btn btn--ghost btn--sm" style={{ color: '#ff8888', marginLeft: 'auto' }} onClick={() => { setTexts([]); setDrawings([]); }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete_sweep</span> Limpiar todo
          </button>
        )}
      </div>

      <div ref={containerRef} style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem', background: '#121214' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#aaa', marginTop: '10%' }}>
            <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff' }} />
            <span>Cargando lienzo PDF...</span>
          </div>
        ) : (
          <div style={{ position: 'relative', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', borderRadius: '4px', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block' }} />
            <canvas
              ref={overlayRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ position: 'absolute', inset: 0, cursor: tool === 'select' ? 'default' : tool === 'text' ? 'text' : 'crosshair' }}
            />

            {/* Renderizar Inputs de texto editables flotantes */}
            {texts.filter(t => t.page === currentPage).map(textItem => (
              <div
                key={textItem.id}
                style={{
                  position: 'absolute',
                  left: `${textItem.x * 100}%`,
                  top: `${textItem.y * 100}%`,
                  transform: 'translate(-5px, -5px)',
                  zIndex: 3100,
                  display: 'flex',
                  alignItems: 'center',
                  background: activeTextId === textItem.id ? '#fff' : 'rgba(255,255,255,0.85)',
                  border: activeTextId === textItem.id ? '2px solid var(--color-primary)' : '1px dashed #dc2626',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <input
                  type="text"
                  value={textItem.text}
                  autoFocus={activeTextId === textItem.id}
                  onClick={(e) => { e.stopPropagation(); setActiveTextId(textItem.id); }}
                  onChange={(e) => {
                    setTexts(texts.map(t => t.id === textItem.id ? { ...t, text: e.target.value } : t));
                  }}
                  onBlur={() => {
                    if (!textItem.text.trim() || textItem.text === 'Escribe aquí...') {
                      handleRemoveText(textItem.id);
                    } else {
                      setActiveTextId(null);
                    }
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#dc2626',
                    fontFamily: 'sans-serif',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    outline: 'none',
                    padding: 0,
                    margin: 0,
                    width: `${Math.max(textItem.text.length * 7, 80)}px`
                  }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveText(textItem.id); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#dc2626',
                    padding: '0 0 0 4px',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
