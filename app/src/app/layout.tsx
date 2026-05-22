import type { Metadata } from 'next';
import '@/styles/globals.css';
import '@/styles/components.css';
import { AuthProvider } from '@/lib/auth-context';
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
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
