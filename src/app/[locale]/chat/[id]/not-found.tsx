'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import Navbar from '@/components/layout/navbar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ConversationNotFound() {
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
            {t('notFound.conversationTitle', { fallback: 'Conversation Not Found' })}
          </h2>
          <p className="text-muted-foreground mt-4 mb-8">
            {t('notFound.conversationDescription', { fallback: 'This conversation may have been deleted or doesn\'t exist. Please try another conversation or start a new chat.' })}
          </p>
          <div className={cn("flex gap-4", isRtl && "flex-row-reverse")}>
            <Button 
              asChild
              variant="outline"
              className={cn(
                "px-8",
                isRtl && "flex-row-reverse"
              )}
            >
              <Link href={`/${locale}/chat`}>
                {t('notFound.newChat', { fallback: 'New Chat' })}
              </Link>
            </Button>
            <Button 
              asChild
              className={cn(
                "px-8",
                isRtl && "flex-row-reverse"
              )}
            >
              <Link href={`/${locale}`}>
                {t('notFound.backHome', { fallback: 'Go Home' })}
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
