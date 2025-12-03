"use client";

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'motion/react';

export default function HeroVisual() {
  return (
    <div className="relative w-full aspect-[7/4] md:aspect-[5/4] bg-transparent dark:bg-transparent overflow-hidden rounded-2xl">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 dark:from-primary/10 dark:via-accent/10 dark:to-primary/10" />
      
      {/* Floating gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent)',
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
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4), transparent)',
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
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <DotLottieReact
            src="https://lottie.host/1528e4a2-855a-44b3-97de-0b4b6d3d3c30/RwK7lguoEk.lottie"
            loop
            autoplay
            className="w-full h-full"
          />
        </motion.div>
      </div>
    </div>
  );
}
