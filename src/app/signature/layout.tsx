import '@/styles/globals.css';
import '@/styles/components.css';

export const metadata = {
  title: 'Firma Biométrica — Real Top State CRM',
  description: 'Firma biométrica presencial de documentos inmobiliarios',
};

export default function SignatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-base)',
    }}>
      {children}
    </div>
  );
}
