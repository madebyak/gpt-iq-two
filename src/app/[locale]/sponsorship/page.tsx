import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'SponsorshipPage'}); 
  return {
    title: t('title'),
  };
}

export default function SponsorshipPage() {
  const t = useTranslations('SponsorshipPage'); 

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
      <p>{t('contentPlaceholder')}</p>
      {/* Add sponsorship page content here */}
    </div>
  );
} 