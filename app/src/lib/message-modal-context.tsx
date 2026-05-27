'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import MessageModal, { MessageModalConfig, MessageType } from '@/components/ui/MessageModal';

interface ShowModalOptions {
  type: MessageType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface MessageModalContextType {
  showModal: (options: ShowModalOptions) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void, confirmLabel?: string, cancelLabel?: string) => void;
}

const MessageModalContext = createContext<MessageModalContextType | null>(null);

export function MessageModalProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MessageModalConfig | null>(null);

  const closeModal = useCallback(() => {
    setConfig(null);
  }, []);

  const showModal = useCallback((options: ShowModalOptions) => {
    setConfig({
      type: options.type,
      title: options.title,
      message: options.message,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      confirmLabel: options.confirmLabel,
      cancelLabel: options.cancelLabel,
    });
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showModal({ type: 'success', title, message });
  }, [showModal]);

  const showError = useCallback((title: string, message: string) => {
    showModal({ type: 'error', title, message });
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string) => {
    showModal({ type: 'warning', title, message });
  }, [showModal]);

  const showInfo = useCallback((title: string, message: string) => {
    showModal({ type: 'info', title, message });
  }, [showModal]);

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmLabel?: string,
    cancelLabel?: string
  ) => {
    showModal({ type: 'confirm', title, message, onConfirm, onCancel, confirmLabel, cancelLabel });
  }, [showModal]);

  return (
    <MessageModalContext.Provider value={{ showModal, showSuccess, showError, showWarning, showInfo, showConfirm }}>
      {children}
      {config && (
        <MessageModal config={config} onClose={closeModal} />
      )}
    </MessageModalContext.Provider>
  );
}

export function useMessageModal() {
  const ctx = useContext(MessageModalContext);
  if (!ctx) {
    throw new Error('useMessageModal must be used within a MessageModalProvider');
  }
  return ctx;
}
