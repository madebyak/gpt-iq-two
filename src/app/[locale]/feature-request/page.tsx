import { Metadata } from 'next';
import FeatureRequestContent from './feature-request-content';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'FeatureRequestPage' });
  return {
    title: t('metadataTitle'),
  };
}

interface FeatureRequestPageProps {
  params: {
    locale: string;
  };
}

export default async function FeatureRequestPage({ params: { locale } }: FeatureRequestPageProps) {
  const t = await getTranslations({ locale, namespace: 'FeatureRequestPage' });
  
  return (
    <FeatureRequestContent 
    />
  );
} 