"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";
import { SplittingText } from "@/components/ui/splitting-text";
import { useEffect, useState } from "react";

export function Hero() {
  const [waveformHeights, setWaveformHeights] = useState<number[]>([]);

  useEffect(() => {
    // Initialize waveform heights
    const initialHeights = Array.from({ length: 60 }, () => Math.random() * 100);
    setWaveformHeights(initialHeights);

    // Animate waveform continuously
    const interval = setInterval(() => {
      setWaveformHeights(prev => 
        prev.map(() => Math.random() * 100)
      );
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Retro Grid Background - Infinite perspective scrolling */}
      <RetroGrid 
        angle={65}
        cellSize={50}
        opacity={0.7}
        lightLineColor="hsl(var(--accent) / 0.6)"
        darkLineColor="hsl(var(--accent))"
        className="z-[1]"
      />
      
      {/* Animated background */}
      <div className="absolute inset-0 animated-gradient z-[2]" />
      
      {/* Floating blob */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl float z-[3]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl float z-[3]" style={{ animationDelay: '3s' }} />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Animated heading - All screen sizes */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <SplittingText
                text="Where Sound Turns Into"
                type="words"
                inView={true}
                inViewOnce={true}
                motionVariants={{
                  initial: { opacity: 0, y: 50 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.6, ease: 'easeOut' },
                  stagger: 0.15
                }}
              />
              {" "}
              <span className="gradient-text whitespace-nowrap inline-block">
                <SplittingText
                  text="Intelligence"
                  type="words"
                  delay={800}
                  inView={true}
                  inViewOnce={true}
                  motionVariants={{
                    initial: { opacity: 0, scale: 0.8 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { duration: 0.5, ease: 'easeOut' },
                    stagger: 0.1
                  }}
                />
              </span>
            </h1>
            
            {/* Animated description - All screen sizes */}
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto lg:mx-0">
              <SplittingText
                text="ALM-Asia is the next-gen audio intelligence engine that listens, thinks, and understands the entire sonic world — from speech to emotion to environmental reality."
                type="words"
                delay={1200}
                inView={true}
                inViewOnce={true}
                motionVariants={{
                  initial: { opacity: 0, y: 30 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.5, ease: 'easeOut' },
                  stagger: 0.1
                }}
              />
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/analyze">
                <Button 
                  size="lg" 
                  className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 group px-8 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Try Demo
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="relative border-2 border-accent/30 hover:border-accent/50 bg-background/50 dark:bg-background/30 hover:bg-accent/10 backdrop-blur-sm px-8 group transition-all duration-300 shadow-md hover:shadow-lg overflow-visible"
                >
                  <span className="relative z-20 flex items-center text-foreground dark:text-foreground">
                    <BookOpen className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Explore Dataset
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Audio Visualization */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-6">
            {/* Main Waveform */}
            <div className="relative w-full max-w-md">
              <div className="flex items-end justify-center h-64 space-x-1 bg-background/40 dark:bg-background/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-accent/30 dark:border-accent/20 shadow-lg dark:shadow-none">
                {waveformHeights.map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-accent via-accent/90 to-accent/50 dark:from-accent dark:dark:via-accent/80 dark:to-accent/40 rounded-full transition-all duration-150 ease-out shadow-sm dark:shadow-none"
                    style={{
                      height: `${height}%`,
                      minHeight: '10%',
                    }}
                  />
                ))}
              </div>
              
              {/* Sound waves circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-32 h-32">
                  {[1, 2, 3].map((ring) => (
                    <div
                      key={ring}
                      className="absolute inset-0 rounded-full border-2 border-accent/50 dark:border-accent/30 animate-ping"
                      style={{
                        animationDelay: `${ring * 0.5}s`,
                        animationDuration: '2s',
                        transform: `scale(${1 + ring * 0.3})`,
                      }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-accent/30 dark:bg-accent/20 flex items-center justify-center shadow-md dark:shadow-none">
                      <div className="w-8 h-8 rounded-full bg-accent dark:bg-accent pulse-glow shadow-lg dark:shadow-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Small waveform at bottom */}
          <div className="lg:hidden pt-8 flex justify-center items-end space-x-1 h-24">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-accent rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 80 + 20}%`,
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: `${Math.random() * 1 + 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
