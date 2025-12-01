"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Demo() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showFrequency, setShowFrequency] = useState(false);
  const [frequencies, setFrequencies] = useState<number[]>([]);

  // Generate frequency data
  useEffect(() => {
    if (isProcessing || showFrequency) {
      const interval = setInterval(() => {
        setFrequencies(
          Array.from({ length: 80 }, () => Math.random() * 100)
        );
      }, 100);
      return () => clearInterval(interval);
    } else {
      setFrequencies(Array.from({ length: 80 }, () => 10));
    }
  }, [isProcessing, showFrequency]);

  const handleDemo = () => {
    setShowFrequency(true);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        setShowFrequency(false);
      }, 10000);
    }, 2000);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-accent/10 via-purple-500/10 to-pink-500/10 blur-3xl"
          animate={{
            scale: showFrequency ? [1, 1.2, 1] : 1,
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Experience the <span className="gradient-text">Power</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload any audio and watch ALM-Asia decode its meaning
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload area - nice card design */}
          <Card className="glass-strong p-8 md:p-12 border border-accent/20 hover:border-accent/40 transition-all duration-300">
            <div className="text-center space-y-6">
              {/* Icon and visual element */}
              <motion.div
                className="flex items-center justify-center mb-6"
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="relative">
                  {/* Pulsing rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-accent/30"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-accent/20"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: 0.3,
                    }}
                  />
                  
                  {/* Icon container */}
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-accent/5 dark:from-accent/30 dark:via-accent/20 dark:to-accent/10 border-2 border-accent/40 flex items-center justify-center">
                    <Upload className="h-10 w-10 md:h-12 md:w-12 text-accent" />
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                  Ready to Analyze Audio?
                </h3>
                <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                  Upload any audio file and experience ALM-Asia&apos;s powerful analysis capabilities
                </p>
              </div>

              {/* Upload button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  onClick={handleDemo}
                  disabled={isProcessing}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground hover-glow px-12 group relative overflow-hidden"
                >
                  {/* Button glow effect */}
                  {showFrequency && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center">
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Audio...
                      </>
                    ) : isDone ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Analysis Complete!
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        Upload Audio
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Audio frequency visualization - appears above upload button when active */}
          <AnimatePresence>
            {showFrequency && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <Card className="glass-strong p-6 md:p-8 border border-accent/20 overflow-hidden">
                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `linear-gradient(135deg, 
                        hsl(var(--accent)) 0%, 
                        rgba(168, 85, 247, 0.5) 50%, 
                        hsl(var(--accent)) 100%)`,
                      backgroundSize: "200% 200%",
                    }}
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Frequency bars */}
                  <div className="relative flex items-end justify-center h-40 md:h-48 gap-1 md:gap-1.5">
                    {frequencies.map((height, i) => (
                      <motion.div
                        key={i}
                        className="rounded-t-sm relative overflow-hidden"
                        style={{
                          width: "8px",
                          minHeight: "4px",
                        }}
                        animate={{
                          height: `${Math.max(height, 5)}%`,
                          opacity: isProcessing ? 1 : 0.6,
                        }}
                        transition={{
                          height: {
                            duration: 0.1,
                            ease: "easeOut",
                          },
                          opacity: {
                            duration: 0.3,
                          },
                        }}
                      >
                        {/* Gradient fill */}
                        <motion.div
                          className="absolute inset-0 w-full"
                          style={{
                            background: `linear-gradient(to top, 
                              hsl(var(--accent)) 0%, 
                              rgba(168, 85, 247, 0.8) 50%, 
                              rgba(236, 72, 153, 0.6) 100%)`,
                            boxShadow: `0 0 ${isProcessing ? "8px" : "4px"} hsl(var(--accent))`,
                          }}
                          animate={{
                            boxShadow: isProcessing
                              ? [
                                  "0 0 8px hsl(var(--accent))",
                                  "0 0 16px hsl(var(--accent))",
                                  "0 0 8px hsl(var(--accent))",
                                ]
                              : "0 0 4px hsl(var(--accent))",
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />

                        {/* Pulse effect */}
                        {isProcessing && (
                          <motion.div
                            className="absolute inset-0 bg-white/30"
                            animate={{
                              y: ["100%", "-100%"],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.02,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Center frequency peak indicator */}
                  {isProcessing && (
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="w-32 h-32 rounded-full border-2 border-accent/50" />
                      <div className="absolute inset-0 w-32 h-32 rounded-full border border-accent/30 scale-150" />
                    </motion.div>
                  )}

                  {/* Status text */}
                  <div className="mt-4 text-center">
                    <motion.p
                      className="text-sm font-medium text-accent"
                      animate={{
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {isProcessing
                        ? "Analyzing audio frequencies..."
                        : "Audio frequency spectrum"}
                    </motion.p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo output */}
          {isDone && (
            <Card className="glass p-8 fade-in-up">
              <h3 className="text-xl font-semibold mb-4 text-accent">AI Analysis Output</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
                  <p className="text-foreground">
                    &quot;Hello, I need assistance with my flight booking...&quot;
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Detected Emotions:</p>
                  <div className="flex gap-2 flex-wrap">
                    {["Concerned", "Polite", "Urgent"].map((emotion) => (
                      <span
                        key={emotion}
                        className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Context:</p>
                  <p className="text-foreground">
                    Customer service interaction, airport environment, multiple speakers detected
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
