import type { Metadata } from 'next';
import '@/styles/globals.css';
import '@/styles/components.css';
import { AuthProvider } from '@/lib/auth-context';
import { MessageModalProvider } from '@/lib/message-modal-context';
import { DocumentViewerProvider } from '@/lib/document-viewer-context';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Real Top State CRM — Gestión Inmobiliaria',
  description: 'CRM SaaS integral para agencias inmobiliarias en España. Gestión de leads, propiedades, documentos, firmas digitales y facturación.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <MessageModalProvider>
            <DocumentViewerProvider>
              <AppShell>{children}</AppShell>
            </DocumentViewerProvider>
          </MessageModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
