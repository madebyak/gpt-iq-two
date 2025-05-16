import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import FeatureRequestContent from './feature-request-content';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Navbar' });
  return {
    title: t('featureRequest'),
  };
}

interface FeatureRequestPageProps {
  params: {
    locale: string;
  };
}

export default function FeatureRequestPage({ params: { locale } }: FeatureRequestPageProps) {
  const isArabic = locale === 'ar';

  const headingText = isArabic 
    ? "ساهم في المرحلة القادمة من ميزات \"جاهز\"" 
    : "Write the Next Chapter of Jahiz";
  
  const subheadingText = isArabic
    ? "مقتراحتكم سترسم ملامح مستقبل العراق الرقمي — شاركوا احتياجاتكم وشاهدوها تتحقق."
    : "Your feature ideas will script Iraq's digital future—share what you need and watch it come to life.";

  return (
    <FeatureRequestContent 
      locale={locale} 
      headingText={headingText} 
      subheadingText={subheadingText} 
    />
  );
} 