"use client";

import React from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { motion } from "motion/react";

const uniqueFeatures = [
  {
    quote:
      "Context-Aware Ears that understand speech, emotion, accents, background noise, and social cues — like a human who never mishears. Experience audio intelligence that goes beyond simple transcription.",
    name: "Context-Aware Ears",
    title: "Advanced Speech Recognition",
  },
  {
    quote:
      "Transform raw audio into a living graph of people, moods, locations, events, and hidden signals. Our Audio Knowledge Graph creates connections that reveal the deeper meaning in every conversation.",
    name: "Audio Knowledge Graph",
    title: "Intelligent Audio Mapping",
  },
  {
    quote:
      "Not just 'what happened' — but 'why it happened' using audio-driven reasoning flows. Chain-of-Thought Reasoning provides insights that help you understand the context and implications.",
    name: "Chain-of-Thought Reasoning",
    title: "Deep Audio Analysis",
  },
  {
    quote:
      "Understands Hindi, Tamil, Telugu, Bangla, Urdu, Mandarin, Korean — with cultural depth. Our Asian Multilingual Intelligence ensures accurate understanding across diverse languages and dialects.",
    name: "Asian Multilingual Intelligence",
    title: "Multi-Language Support",
  },
  {
    quote:
      "Real-time audio processing with lightning-fast analysis. Get instant insights from your audio files with our cutting-edge AI technology that processes and understands audio in seconds.",
    name: "Real-Time Processing",
    title: "Instant Analysis",
  },
  {
    quote:
      "Emotion detection that goes beyond words. Understand the sentiment, tone, and emotional context of every conversation with our advanced emotion recognition technology.",
    name: "Emotion Recognition",
    title: "Sentiment Analysis",
  },
];

export default function Lanyard3D() {
  return (
    <section className="pt-12 pb-6 md:pt-16 md:pb-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-6"
          >
            <motion.span
              className="text-sm md:text-base font-semibold text-accent uppercase tracking-wider"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Unique Capabilities
            </motion.span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
          >
            Our <span className="gradient-text">Revolutionary</span> Features
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Experience the power of next-generation audio intelligence
          </motion.p>
        </div>

        {/* Infinite Moving Cards */}
        <div className="h-[25rem] md:h-[28rem] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={uniqueFeatures}
            direction="right"
            speed="slow"
          />
        </div>
      </div>
    </section>
  );
}
