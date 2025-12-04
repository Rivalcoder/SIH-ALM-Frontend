"use client";

import React, { useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'motion/react';

// Loading placeholder component
function LottiePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 animate-pulse" />
    </div>
  );
}

export default function HeroVisual() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only start loading when component is mounted (client-side)
  useEffect(() => {
    // Small delay to allow initial render to complete
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if Lottie has loaded by monitoring the container
  useEffect(() => {
    if (!shouldLoad) return;
    
    const checkLoaded = () => {
      // Check if the Lottie player has rendered
      const lottieElement = containerRef.current?.querySelector('dotlottie-player, canvas, svg');
      if (lottieElement) {
        setIsLoaded(true);
      }
    };

    // Check immediately and then periodically
    checkLoaded();
    const interval = setInterval(checkLoaded, 100);
    
    // Also set a timeout to mark as loaded after a reasonable time
    const timeout = setTimeout(() => {
      setIsLoaded(true);
      clearInterval(interval);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [shouldLoad]);

  return (
    <div 
      className="relative w-full aspect-[7/4] md:aspect-[5/4] bg-transparent dark:bg-transparent overflow-hidden rounded-2xl"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        willChange: 'transform',
      }}
    >
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 dark:from-primary/10 dark:via-accent/10 dark:to-primary/10"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />
      
      {/* Floating gradient orbs - optimized for Linux */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent)',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform, opacity',
          opacity: 0.4,
          contain: 'layout style paint',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [-20, 20, -20],
          y: [-20, 20, -20],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent)',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform, opacity',
          opacity: 0.4,
          contain: 'layout style paint',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
          x: [20, -20, 20],
          y: [20, -20, 20],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Lottie Animation */}
      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          isolation: 'isolate',
        }}
      >
        {!shouldLoad || !isLoaded ? (
          <LottiePlaceholder />
        ) : null}
        {shouldLoad && (
          <motion.div
            className="w-full h-full"
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              willChange: 'opacity, transform',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div
              style={{
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                width: '100%',
                height: '100%',
                display: isLoaded ? 'block' : 'none',
              }}
            >
              <DotLottieReact
                src="/Voicemail.lottie"
                loop
                autoplay
                className="w-full h-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
