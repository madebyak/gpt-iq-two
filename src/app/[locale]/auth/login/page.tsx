import { getTranslations } from 'next-intl/server';
import { AuthCard } from '@/components/auth/auth-card';
import { FormDivider } from '@/components/auth/form-divider';
import { SocialButton } from '@/components/auth/social-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from '@/i18n/navigation';

interface LoginPageProps {
  params: {
    locale: string;
  };
}

export default async function LoginPage({ params }: LoginPageProps) {
  // Get translations for the login page
  const t = await getTranslations('Auth.Login');
  const commonT = await getTranslations('Auth.Common');
  
  return (
    <AuthCard 
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <form className="space-y-6">
        {/* Google Login Button */}
        <SocialButton
          icon={
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.25,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z" fill="currentColor"></path>
              </g>
            </svg>
          }
          label={t('googleLogin')}
        />
      
        <FormDivider text={commonT('orContinueWith')} />
      
        <div className="space-y-5">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{commonT('passwordLabel')}</Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder={commonT('passwordPlaceholder')}
              required
            />
          </div>
          
          {/* Remember Me */}
          <div className="flex items-center space-x-3">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('rememberMe')}
            </Label>
          </div>
        </div>
        
        {/* Login Button */}
        <Button type="submit" className="w-full mt-8">
          {t('loginButton')}
        </Button>
        
        {/* Sign Up Link */}
        <div className="text-center text-base mt-4">
          {t('noAccount')}{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {t('signUpLink')}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
