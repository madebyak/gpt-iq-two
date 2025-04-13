'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import Navbar from '@/components/layout/navbar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const t = useTranslations('Common');

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <Navbar />
      <Container className="py-16">
        <div className={cn(
          "flex flex-col items-center text-center max-w-md mx-auto",
          isRtl ? "text-right" : "text-left"
        )}>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('notFound.title', { fallback: 'Conversation Not Found' })}
          </h2>
          <p className="text-muted-foreground mt-4 mb-8">
            {t('notFound.description', { fallback: 'The conversation you\'re looking for doesn\'t exist or may have been deleted.' })}
          </p>
          <Button 
            asChild
            className={cn(
              "px-8",
              isRtl && "flex-row-reverse"
            )}
          >
            <Link href={`/${locale}/chat`}>
              {t('notFound.backToChat', { fallback: 'Back to Chat' })}
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}
