import NavbarClient from '@/components/layout/navbar-client';

export default async function FeatureRequestLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <NavbarClient />
      </div>
      <main className="flex-1 overflow-y-auto min-h-0">
        {children}
      </main>
    </div>
  );
} 