"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthCard } from '@/components/auth/auth-card';
import { FormDivider } from '@/components/auth/form-divider';
import { SocialButton } from '@/components/auth/social-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-context';

interface LoginPageProps {
  params: {
    locale: string;
  };
}

export default function LoginPage({ params }: LoginPageProps) {
  const { locale } = params;
  const isRtl = locale === 'ar';
  const t = useTranslations('Auth.Login');
  const commonT = useTranslations('Auth.Common');
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(commonT('fieldsRequired'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: signInError } = await signInWithEmail(email, password);
      
      if (signInError) {
        setError(commonT('invalidCredentials'));
        return;
      }
      
      // Redirect is handled in the auth context after successful login
    } catch (err) {
      console.error('Login error:', err);
      setError(commonT('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      // Redirect happens automatically after OAuth flow
    } catch (err) {
      console.error('Google login error:', err);
      setError(commonT('errorOccurred'));
      setGoogleLoading(false);
    }
  };
  
  return (
    <AuthCard 
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <form className="space-y-6" onSubmit={handleEmailLogin}>
        {/* Error message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-center">
            {error}
          </div>
        )}
      
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
          onClick={handleGoogleLogin}
          isLoading={googleLoading}
          disabled={isLoading || googleLoading}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || googleLoading}
              required
              className={isRtl ? "text-right" : ""}
              dir={isRtl ? "rtl" : "ltr"}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || googleLoading}
              required
              className={isRtl ? "text-right" : ""}
              dir={isRtl ? "rtl" : "ltr"}
            />
          </div>
          
          {/* Remember Me */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={isLoading || googleLoading}
            />
            <Label htmlFor="remember" className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('rememberMe')}
            </Label>
          </div>
        </div>
        
        {/* Login Button */}
        <Button 
          type="submit" 
          className="w-full mt-8"
          disabled={isLoading || googleLoading}
          aria-disabled={isLoading || googleLoading}
        >
          {isLoading ? commonT('loading') : t('loginButton')}
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
