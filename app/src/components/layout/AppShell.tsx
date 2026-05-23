'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useAuth } from '@/lib/auth-context';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Si estamos en la página de login, no renderizar Sidebar ni TopBar
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Mientras carga la autenticación, o si no hay usuario pero estamos en otra ruta,
  // AuthProvider maneja la redirección, así que aquí mostramos un loader si está cargando.
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg-base)' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(242, 190, 140, 0.3)', borderTopColor: 'var(--color-primary)', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  // Si no hay usuario (a punto de ser redirigido por AuthProvider), no renderizamos el shell
  if (!user) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <TopBar />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          marginTop: 'var(--topbar-height)',
          padding: 'var(--space-md)',
          height: 'calc(100vh - var(--topbar-height))',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </>
  );
}
