import NavbarClient from '@/components/layout/navbar-client';
import React from 'react';
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import { getTranslations, getLocale } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ChangelogEntry } from '@/lib/types/changelog.types';
import { unstable_noStore as noStore } from 'next/cache';

const ChangelogPage = async () => {
  noStore();
  const t = await getTranslations('Changelog');
  const locale = await getLocale();
  const isRtl = locale === 'ar';

  const supabase = createSupabaseServerClient();
  let entries: ChangelogEntry[] = [];
  let fetchError: string | null = null;

  try {
    const { data, error } = await supabase
      .from('changelog_entries')
      .select('*')
      .order('published_date', { ascending: false });

    if (error) {
      console.error('Error fetching changelog entries:', error);
      throw new Error(error.message);
    }
    entries = data || [];
  } catch (error: any) {
    console.error('Catch block error fetching changelog:', error);
    fetchError = "Failed to load changelog entries. Please try again later.";
  }

  return (
    <div className="flex flex-col h-full w-full">
      <NavbarClient />
      <div 
        className="flex-grow overflow-y-auto w-full"
        style={isRtl ? { direction: 'ltr' } : {}}
      >
        <div 
          className="w-full max-w-7xl mx-auto px-4 py-8"
          style={isRtl ? { direction: 'rtl' } : {}}
        >
          <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground mb-1">{t('description')}</p>
          <Separator className="my-6" />

          {fetchError && (
            <div className="text-red-500 text-center py-4">
              {fetchError}
            </div>
          )}

          {!fetchError && entries.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              {t('noEntries')}
            </div>
          )}

          {!fetchError && entries.map((entry) => {
            const heading = isRtl ? entry.heading_ar : entry.heading_en;
            const rawParagraph = isRtl ? entry.paragraph_ar : entry.paragraph_en;
            const paragraphs = rawParagraph
              .replace(/\\n/g, '\n')
              .split('\n')
              .map(p => p.trim())
              .filter(p => p.length > 0);
            
            const publishedDate = new Date(entry.published_date).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <article key={entry.id} className="mb-12">
                <div className={`flex flex-col md:flex-row gap-8`}>
                  <aside
                    className={`
                      w-full text-sm text-muted-foreground shrink-0 pt-1 mb-4 md:mb-0
                      ${isRtl ? 'text-right' : 'text-left'} 
                      md:w-1/5
                      order-first
                      ${isRtl ? 'md:order-last' : 'md:order-first'}
                    `}
                  >
                    {publishedDate}
                  </aside>
                  <main
                    className={`
                      w-full flex
                      ${isRtl ? 'justify-end' : 'justify-start'}
                      md:w-4/5
                      order-2
                      ${isRtl ? 'md:order-first' : 'md:order-2'}
                    `}
                  >
                    <div className={`w-full max-w-xl ${isRtl ? 'text-right md:mr-auto' : 'text-left md:ml-auto'} md:max-w-none`}>
                      {entry.image_url && (
                        <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden border">
                          <Image 
                            src={entry.image_url}
                            alt={heading}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 40vw"
                          />
                        </div>
                      )}
                      <h2 className="text-4xl font-semibold mt-0 mb-4">{heading}</h2>
                      <div className={`prose prose-base dark:prose-invert max-w-none ${isRtl ? 'prose-rtl' : ''}`}>
                        {paragraphs.map((p, index) => (
                          <p key={index} className="mb-3">{p}</p>
                        ))}
                      </div>
                    </div>
                  </main>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChangelogPage; 