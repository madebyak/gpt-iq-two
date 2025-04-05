import { getTranslations } from 'next-intl/server';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/navigation';

interface ForgotPasswordPageProps {
  params: {
    locale: string;
  };
}

export default async function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  // Get translations for the forgot password page
  const t = await getTranslations('Auth.ForgotPassword');
  const commonT = await getTranslations('Auth.Common');
  
  return (
    <AuthCard 
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <form className="space-y-6">
        {/* Email Input */}
        <div className="space-y-3">
          <Label htmlFor="email">{commonT('emailLabel')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={commonT('emailPlaceholder')}
            required
          />
        </div>
        
        {/* Reset Password Button */}
        <Button type="submit" className="w-full mt-8">
          {t('resetButton')}
        </Button>
        
        {/* Return to Login Link */}
        <div className="text-center text-base mt-4">
          {t('rememberedPassword')}{' '}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {t('backToLoginLink')}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
