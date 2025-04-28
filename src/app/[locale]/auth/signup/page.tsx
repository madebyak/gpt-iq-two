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

interface SignupPageProps {
  params: {
    locale: string;
  };
}

export default function SignupPage({ params }: SignupPageProps) {
  const { locale } = params;
  const isRtl = locale === 'ar';
  const t = useTranslations('Auth.Signup');
  const commonT = useTranslations('Auth.Common');
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Fetch translations unconditionally
  const messages = {
    fieldsRequired: commonT('fieldsRequired'),
    passwordsMismatch: t('passwordsMismatch'),
    acceptTerms: t('acceptTerms'),
    passwordTooShort: t('passwordTooShort'),
    verifyEmail: t('verifyEmail'),
    errorOccurred: commonT('errorOccurred'),
    loading: commonT('loading')
  };
  
  const validateForm = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError(messages.fieldsRequired);
      return false;
    }
    
    if (password !== confirmPassword) {
      setError(messages.passwordsMismatch);
      return false;
    }
    
    if (!termsAccepted) {
      setError(messages.acceptTerms);
      return false;
    }
    
    if (password.length < 8) {
      setError(messages.passwordTooShort);
      return false;
    }
    
    return true;
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign up with Supabase
      const { error: signUpError } = await signUpWithEmail(email, password, firstName, lastName);
      
      if (signUpError) {
        throw signUpError;
      }
      
      // Show success message
      setSuccessMessage(messages.verifyEmail);
      
      // Clear form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setTermsAccepted(false);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || messages.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      // Redirect happens automatically after OAuth flow
    } catch (err) {
      console.error('Google signup error:', err);
      setError(messages.errorOccurred);
      setGoogleLoading(false);
    }
  };
  
  return (
    <AuthCard 
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <form className="space-y-6" onSubmit={handleSignup}>
        {/* Error message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-center">
            {error}
          </div>
        )}
        
        {/* Success message */}
        {successMessage && (
          <div className="p-3 rounded-md bg-primary/10 text-primary text-center">
            {successMessage}
          </div>
        )}
      
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
          onClick={handleGoogleSignup}
          isLoading={googleLoading}
          disabled={isLoading || googleLoading}
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading || googleLoading}
                required
                className={isRtl ? "text-right" : ""}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="lastName">{t('lastNameLabel')}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder={t('lastNamePlaceholder')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading || googleLoading}
                required
                className={isRtl ? "text-right" : ""}
                dir={isRtl ? "rtl" : "ltr"}
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
            <Label htmlFor="password">{commonT('passwordLabel')}</Label>
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

          {/* Confirm Password Input */}
          <div className="space-y-3">
            <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || googleLoading}
              required
              className={isRtl ? "text-right" : ""}
              dir={isRtl ? "rtl" : "ltr"}
            />
          </div>
          
          {/* Terms & Conditions */}
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <Checkbox 
              id="terms" 
              className="mt-1" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              disabled={isLoading || googleLoading}
            />
            <Label htmlFor="terms" className="text-base font-medium leading-normal">
              {t('termsText')}{' '}
              <Link href="/terms" className="text-primary hover:underline underline-offset-4">
                {t('termsLink')}
              </Link>
            </Label>
          </div>
        </div>
        
        {/* Signup Button */}
        <Button 
          type="submit" 
          className="w-full mt-8"
          disabled={isLoading || googleLoading}
          aria-disabled={isLoading || googleLoading}
        >
          {isLoading ? messages.loading : t('signupButton')}
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
