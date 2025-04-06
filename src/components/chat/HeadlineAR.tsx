"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';

export function HeadlineAR() {
  const t = useTranslations('Chat');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Arabic cycling words as provided by the user
  const words = [" نسولف", " نفكر ", " نخطط ", "ننتج", "نبدع"];
  
  // Simulate checking for user authentication
  useEffect(() => {
    const checkUserAuth = () => {
      const isLoggedIn = false;
      if (isLoggedIn) {
        setUserName("احمد");
      }
      setIsLoaded(true);
    };
    
    checkUserAuth();
  }, []);
  
  // Word cycling animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [words.length]);
  
  // Blur animation variants
  const containerVariants = {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { 
      opacity: 1, 
      filter: "blur(0px)",
      transition: { duration: 1.2 }
    }
  };
  
  // Word animation variants
  const wordVariants = {
    enter: { opacity: 0, y: 40 },
    center: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    exit: { 
      opacity: 0, 
      y: -40,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center space-y-6"
      dir="rtl"
    >
      {isLoaded && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="inline-block"
        >
          <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
            <span className="headline-gradient">الله بالخير{userName ? ` ${userName}` : ""} ، خلي</span>
            <span className="relative h-[1.5em] w-48 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  className="headline-gradient absolute inset-0 flex items-center"
                  key={currentWordIndex}
                  variants={wordVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {words[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
        </motion.div>
      )}
    </motion.div>
  );
}
