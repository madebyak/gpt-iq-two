"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AuthCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';

interface ForgotPasswordPageProps {
  params: {
    locale: string;
  };
}

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const { locale } = params;
  const isRtl = locale === 'ar';
  const t = useTranslations('Auth.ForgotPassword');
  const commonT = useTranslations('Auth.Common');
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError(commonT('fieldsRequired'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      // Show success message
      setSuccessMessage(t('resetLinkSent'));
      
      // Clear form
      setEmail('');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || commonT('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthCard 
      title={t('title')}
      subtitle={t('subtitle')}
    >
      <form className="space-y-6" onSubmit={handleResetPassword}>
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
        
        {/* Email Input */}
        <div className="space-y-3">
          <Label htmlFor="email">{commonT('emailLabel')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={commonT('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className={isRtl ? "text-right" : ""}
            dir={isRtl ? "rtl" : "ltr"}
          />
        </div>
        
        {/* Reset Password Button */}
        <Button 
          type="submit" 
          className="w-full mt-8"
          disabled={isLoading}
          aria-disabled={isLoading}
        >
          {isLoading ? commonT('loading') : t('resetButton')}
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
