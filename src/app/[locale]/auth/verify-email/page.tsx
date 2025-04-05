import { getTranslations } from 'next-intl/server';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { MailCheck } from 'lucide-react';

interface VerifyEmailPageProps {
  params: {
    locale: string;
  };
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  // Get translations for the verify email page
  const t = await getTranslations('Auth.VerifyEmail');
  
  return (
    <AuthCard 
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Email Icon */}
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <MailCheck className="h-8 w-8" />
        </div>
        
        {/* Description */}
        <p className="text-base text-muted-foreground max-w-sm">
          {t('description')}
        </p>
        
        {/* Resend Button */}
        <Button className="w-full mt-8">
          {t('resendButton')}
        </Button>
        
        {/* Return to Login Link */}
        <div className="text-base mt-4">
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {t('backToLoginLink')}
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
