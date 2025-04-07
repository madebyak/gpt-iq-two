'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import Navbar from '@/components/layout/navbar';
import { cn } from '@/lib/utils';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  // Use Common namespace for basic translations that should be available
  const t = useTranslations('Common');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />
      <Container className="py-16">
        <div className={cn(
          "flex flex-col items-center text-center max-w-md mx-auto",
          isRtl ? "text-right" : "text-left"
        )}>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('error.title', { fallback: 'Something went wrong!' })}
          </h2>
          <p className="text-muted-foreground mt-4 mb-8">
            {t('error.description', { fallback: 'An unexpected error occurred. We apologize for the inconvenience.' })}
          </p>
          <Button 
            onClick={reset} 
            className={cn(
              "px-8",
              isRtl && "flex-row-reverse"
            )}
          >
            {t('error.retry', { fallback: 'Try again' })}
          </Button>
        </div>
      </Container>
    </div>
  );
}
