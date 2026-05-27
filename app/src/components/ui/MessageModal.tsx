'use client';

import { useEffect, useCallback } from 'react';

export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface MessageModalConfig {
  type: MessageType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface MessageModalProps {
  config: MessageModalConfig;
  onClose: () => void;
}

const iconMap: Record<MessageType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
  confirm: 'help',
};

const colorMap: Record<MessageType, string> = {
  success: 'var(--color-success, #4caf50)',
  error: 'var(--color-error, #e53935)',
  warning: 'var(--color-warning, #ff9800)',
  info: 'var(--color-primary, #1565c0)',
  confirm: 'var(--color-primary, #1565c0)',
};

export default function MessageModal({ config, onClose }: MessageModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (config.type === 'confirm') {
        config.onCancel?.();
      }
      onClose();
    }
  }, [config, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (config.type === 'confirm') {
        config.onCancel?.();
      }
      onClose();
    }
  };

  const handleConfirm = () => {
    config.onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    config.onCancel?.();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={handleOverlayClick}
    >
      <div
        style={{
          background: 'var(--color-surface-high, #1e1e1e)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '480px',
          width: '90vw',
          animation: 'slideUp 0.25s ease',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1.5rem 1.5rem 0', textAlign: 'center' }}>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '48px',
              color: colorMap[config.type],
              marginBottom: '0.75rem',
              display: 'block',
            }}
          >
            {iconMap[config.type]}
          </span>
          <h3
            style={{
              margin: '0 0 0.5rem',
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--color-text-primary, #e0e0e0)',
            }}
          >
            {config.title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary, #aaa)',
              lineHeight: 1.5,
            }}
          >
            {config.message}
          </p>
        </div>

        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            gap: '0.75rem',
            justifyContent: config.type === 'confirm' ? 'space-between' : 'center',
          }}
        >
          {config.type === 'confirm' ? (
            <>
              <button
                className="btn btn--ghost"
                onClick={handleCancel}
                style={{ flex: 1 }}
              >
                {config.cancelLabel || 'Cancelar'}
              </button>
              <button
                className="btn btn--primary"
                onClick={handleConfirm}
                style={{ flex: 1 }}
              >
                {config.confirmLabel || 'Confirmar'}
              </button>
            </>
          ) : (
            <button
              className="btn btn--primary"
              onClick={onClose}
              style={{ minWidth: '140px' }}
            >
              Aceptar
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
