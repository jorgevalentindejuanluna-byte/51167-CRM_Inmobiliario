'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

const PdfViewerModal = dynamic(() => import('@/components/documents/PdfViewerModal'), { ssr: false });

interface ViewerOptions {
  url: string;
  fileName: string;
  fileType?: string;
  metadata?: Record<string, any>;
}

interface DocumentViewerContextType {
  openViewer: (options: ViewerOptions) => void;
  closeViewer: () => void;
}

const DocumentViewerContext = createContext<DocumentViewerContextType | null>(null);

export function useDocumentViewer() {
  const ctx = useContext(DocumentViewerContext);
  if (!ctx) throw new Error('useDocumentViewer must be used within DocumentViewerProvider');
  return ctx;
}

export function DocumentViewerProvider({ children }: { children: ReactNode }) {
  const [viewerOptions, setViewerOptions] = useState<ViewerOptions | null>(null);

  const openViewer = useCallback((options: ViewerOptions) => {
    setViewerOptions(options);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerOptions(null);
  }, []);

  return (
    <DocumentViewerContext.Provider value={{ openViewer, closeViewer }}>
      {children}
      {viewerOptions && (
        <PdfViewerModal
          url={viewerOptions.url}
          fileName={viewerOptions.fileName}
          fileType={viewerOptions.fileType}
          metadata={viewerOptions.metadata}
          onClose={closeViewer}
        />
      )}
    </DocumentViewerContext.Provider>
  );
}
