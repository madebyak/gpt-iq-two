import { getTranslations } from 'next-intl/server';
import { AuthCard } from '@/components/auth/auth-card';
import { FormDivider } from '@/components/auth/form-divider';
import { SocialButton } from '@/components/auth/social-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from '@/i18n/navigation';

interface SignupPageProps {
  params: {
    locale: string;
  };
}

export default async function SignupPage({ params }: SignupPageProps) {
  // Get translations for the signup page
  const t = await getTranslations('Auth.Signup');
  const commonT = await getTranslations('Auth.Common');
  
  return (
    <AuthCard 
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <form className="space-y-6">
        {/* Google Signup Button */}
        <SocialButton
          icon={
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z" fill="currentColor"></path>
              </g>
            </svg>
          }
          label={t('googleSignup')}
        />
      
        <FormDivider text={commonT('orContinueWith')} />
      
        <div className="space-y-5">
          {/* Name Input */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <Label htmlFor="firstName">{t('firstNameLabel')}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder={t('firstNamePlaceholder')}
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lastName">{t('lastNameLabel')}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder={t('lastNamePlaceholder')}
                required
              />
            </div>
          </div>

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
          
          {/* Password Input */}
          <div className="space-y-3">
            <Label htmlFor="password">{commonT('passwordLabel')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={commonT('passwordPlaceholder')}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-3">
            <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              required
            />
          </div>
          
          {/* Terms & Conditions */}
          <div className="flex items-start space-x-3">
            <Checkbox id="terms" className="mt-1" />
            <Label htmlFor="terms" className="text-base font-medium leading-normal">
              {t('termsText')} <Link href="/terms" className="text-primary hover:underline underline-offset-4">{t('termsLink')}</Link>
            </Label>
          </div>
        </div>
        
        {/* Signup Button */}
        <Button type="submit" className="w-full mt-8">
          {t('signupButton')}
        </Button>
        
        {/* Login Link */}
        <div className="text-center text-base mt-4">
          {t('hasAccount')}{' '}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {t('loginLink')}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
