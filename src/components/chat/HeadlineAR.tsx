"use client";

import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

export function HeadlineAR() {
  const t = useTranslations('Chat');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center space-y-6"
    >
      <motion.h1 
        className="text-4xl font-bold tracking-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {t('headlineTitle')}
      </motion.h1>
      <motion.p
        className="text-xl text-muted-foreground max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {t('headlineSubtitle')}
      </motion.p>
    </motion.div>
  );
}
