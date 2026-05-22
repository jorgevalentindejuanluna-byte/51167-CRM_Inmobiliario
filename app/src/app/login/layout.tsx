/* Login no usa el layout principal (sin sidebar/topbar).
   Se gestiona con z-index y position:fixed en el componente. */

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
