import NavbarClient from '@/components/layout/navbar-client';

export default async function FeatureRequestLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <>
      <NavbarClient />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </>
  );
} 