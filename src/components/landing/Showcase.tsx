"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  HeartPulse, 
  Sparkles, 
  Radio, 
  Globe2, 
  Activity,
  ArrowRight
} from "lucide-react";

const capabilities = [
  {
    icon: MessageSquare,
    label: "Speech Recognition",
    description: "Advanced voice processing and transcription",
    color: "blue",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    glowColor: "rgba(59, 130, 246, 0.6)",
    iconColor: "text-blue-500 dark:text-blue-400",
    position: { row: 0, col: 0 },
  },
  {
    icon: HeartPulse,
    label: "Emotion Detection",
    description: "Understand feelings and sentiment in voice",
    color: "pink",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    glowColor: "rgba(236, 72, 153, 0.6)",
    iconColor: "text-pink-500 dark:text-pink-400",
    position: { row: 0, col: 1 },
  },
  {
    icon: Sparkles,
    label: "Context Analysis",
    description: "Deep understanding of meaning and intent",
    color: "purple",
    gradient: "from-purple-500 via-indigo-500 to-blue-500",
    glowColor: "rgba(168, 85, 247, 0.6)",
    iconColor: "text-purple-500 dark:text-purple-400",
    position: { row: 0, col: 2 },
  },
  {
    icon: Radio,
    label: "Sound Classification",
    description: "Identify and categorize audio patterns",
    color: "green",
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.6)",
    iconColor: "text-emerald-500 dark:text-emerald-400",
    position: { row: 1, col: 0 },
  },
  {
    icon: Globe2,
    label: "Cultural Understanding",
    description: "Multilingual intelligence with cultural depth",
    color: "amber",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    glowColor: "rgba(245, 158, 11, 0.6)",
    iconColor: "text-amber-500 dark:text-amber-400",
    position: { row: 1, col: 1 },
  },
  {
    icon: Activity,
    label: "Real-time Processing",
    description: "Instant audio insights and analysis",
    color: "violet",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    glowColor: "rgba(139, 92, 246, 0.6)",
    iconColor: "text-violet-500 dark:text-violet-400",
    position: { row: 1, col: 2 },
  },
];

function CapabilityOrb({ 
  capability, 
  index,
  onHover,
  isHovered 
}: { 
  capability: typeof capabilities[0]; 
  index: number;
  onHover: (index: number | null) => void;
  isHovered: boolean;
}) {
  const Icon = capability.icon;
  const [expanded, setExpanded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 300,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), {
    stiffness: 300,
    damping: 25,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXRelative = (e.clientX - rect.left) / width - 0.5;
    const mouseYRelative = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(mouseXRelative);
    mouseY.set(mouseYRelative);
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setExpanded(false);
    onHover(null);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setExpanded(true);
        onHover(index);
      }}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: expanded ? rotateX : 0,
        rotateY: expanded ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className="group relative"
    >
      {/* Dark background on hover - only in dark mode */}
      <motion.div
        className="absolute inset-0 rounded-3xl hidden dark:block bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
      />

      {/* Main orb container - ensure it's square for perfect circle */}
      <motion.div
        className="relative w-full aspect-square rounded-3xl overflow-hidden"
        animate={{
          scale: expanded ? 1.03 : 1,
          borderRadius: expanded ? "1.5rem" : "50%",
        }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
      >

        {/* Glass morphism surface - transparent in light mode, dark in dark mode */}
        <motion.div 
          className="absolute inset-0 backdrop-blur-xl border"
          style={{
            background: expanded 
              ? "transparent" 
              : "transparent",
            borderColor: `${capability.glowColor}40`,
            boxShadow: `0 4px 16px ${capability.glowColor}30`,
          }}
        />
        {/* Dark mode overlay - dark background on hover */}
        <motion.div 
          className="absolute inset-0 backdrop-blur-xl border hidden dark:block"
          style={{
            background: expanded 
              ? "rgba(0, 0, 0, 0.4)" 
              : "transparent",
            borderColor: `${capability.glowColor}40`,
            boxShadow: `0 4px 16px ${capability.glowColor}30`,
          }}
          transition={{ duration: 0.3 }}
        />


        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${4 + Math.random() * 4}px`,
              height: `${4 + Math.random() * 4}px`,
              background: capability.glowColor,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, (Math.random() - 0.5) * 40, 0],
              opacity: [0, expanded ? 0.8 : 0.3, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
          {/* Icon with morphing container */}
          <motion.div
            className="relative mb-6"
            animate={{
              y: expanded ? 0 : [0, -12, 0],
              scale: expanded ? 1.2 : 1,
            }}
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              },
              scale: {
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1],
              },
            }}
          >
            {/* Pulsing orb rings - visible pulse only */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{
                  borderColor: capability.glowColor,
                  left: `${-i * 20}px`,
                  top: `${-i * 20}px`,
                  right: `${-i * 20}px`,
                  bottom: `${-i * 20}px`,
                  filter: `drop-shadow(0 0 ${4 + i * 2}px ${capability.glowColor})`,
                }}
                animate={{
                  scale: [1, 1.5 + i * 0.3, 1],
                  opacity: [0.8 - i * 0.2, 0, 0.8 - i * 0.2],
                }}
                transition={{
                  duration: 2.5 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.3 + index * 0.1,
                }}
              />
            ))}

            {/* Icon container with morphing shape - transparent background */}
            <motion.div
              className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center"
              animate={{
                borderRadius: expanded ? "1rem" : "50%",
                rotate: expanded ? [0, 360] : 0,
                scale: expanded ? 1.1 : 1,
              }}
              transition={{
                borderRadius: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                rotate: {
                  duration: expanded ? 20 : 0,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{
                background: "transparent",
                boxShadow: expanded 
                  ? `0 0 50px ${capability.glowColor}80, 0 4px 12px ${capability.glowColor}40`
                  : `0 0 30px ${capability.glowColor}50, 0 2px 8px ${capability.glowColor}30`,
              }}
            >
              <motion.div
                animate={{
                  rotate: expanded ? [0, -360] : 0,
                }}
                transition={{
                  duration: expanded ? 15 : 0,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Icon 
                  className={`h-10 w-10 sm:h-12 sm:w-12 ${capability.iconColor} relative z-10`}
                  style={{
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 8px currentColor)",
                  }}
                />
              </motion.div>

              {/* Inner glow - pulse effect only */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${capability.glowColor.replace('0.6', '0.4')}, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>

          {/* Text content with slide animation */}
          <AnimatePresence mode="wait">
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <motion.h3
                  className="font-bold text-lg sm:text-xl mb-2 text-foreground"
                  style={{ 
                    textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {capability.label}
                </motion.h3>
                
                <motion.p
                  className="text-sm sm:text-base mb-4 leading-relaxed font-semibold text-foreground/80"
                  style={{
                    textShadow: "0 1px 4px rgba(0,0,0,0.15)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {capability.description}
                </motion.p>

                <motion.div
                  className="flex items-center justify-center gap-2 font-bold text-foreground/70"
                  style={{ 
                    textShadow: "0 1px 4px rgba(0,0,0,0.2)",
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-xs">Explore</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact label when not expanded */}
          <AnimatePresence>
            {!expanded && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-sm sm:text-base mt-4 text-foreground"
                style={{ 
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {capability.label}
              </motion.h3>
            )}
          </AnimatePresence>
        </div>

        {/* Interactive light spot that follows mouse */}
        {expanded && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "200px",
              height: "200px",
              background: `radial-gradient(circle, ${capability.glowColor}30, transparent 70%)`,
              left: mousePosition.x - 100,
              top: mousePosition.y - 100,
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

export function Showcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-emerald-500/20 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-rose-500/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="inline-block mb-6"
          >
            <motion.span
              className="text-sm md:text-base font-semibold text-accent uppercase tracking-wider flex items-center justify-center gap-2"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              Core Capabilities
            </motion.span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            ALM-Asia Decodes the{" "}
            <span className="gradient-text relative inline-block">
              <motion.span
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="bg-gradient-to-r from-accent via-purple-500 to-accent bg-[length:200%_auto] bg-clip-text text-transparent"
              >
                Chaos Around You
              </motion.span>
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Airports, markets, traffic, factories, temples, metros — sounds everywhere carry meaning. 
            ALM-Asia extracts it, stitches it, and delivers context no other AI model can.
          </motion.p>
        </div>

        {/* Interactive orbs grid */}
        <div className="relative max-w-6xl mx-auto">
          {/* Animated connecting energy lines */}
          <div className="absolute inset-0 pointer-events-none" style={{ minHeight: "600px" }}>
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                </linearGradient>
                <filter id="energyGlow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {capabilities.map((cap1, i) => {
                return capabilities.slice(i + 1).map((cap2, j) => {
                  const rowDiff = Math.abs(cap1.position.row - cap2.position.row);
                  const colDiff = Math.abs(cap1.position.col - cap2.position.col);
                  
                  if ((rowDiff === 1 && colDiff <= 1) || (rowDiff <= 1 && colDiff === 1)) {
                    const cardWidth = 100 / 3;
                    const cardHeight = 50;
                    
                    const x1 = cap1.position.col * cardWidth + cardWidth / 2;
                    const y1 = cap1.position.row * cardHeight + cardHeight / 2;
                    const x2 = cap2.position.col * cardWidth + cardWidth / 2;
                    const y2 = cap2.position.row * cardHeight + cardHeight / 2;
                    
                    return (
                      <motion.line
                        key={`${i}-${j}`}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="url(#energyGradient)"
                        strokeWidth="2"
                        filter="url(#energyGlow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: hoveredIndex === i || hoveredIndex === i + j + 1 ? 0.6 : 0.15 }}
                        viewport={{ once: true }}
                        transition={{
                          pathLength: { duration: 2, delay: (i + j) * 0.15, ease: "easeInOut" },
                          opacity: { duration: 0.3 },
                        }}
                        animate={{
                          opacity: hoveredIndex === i || hoveredIndex === i + j + 1 ? 0.6 : 0.15,
                        }}
                      />
                    );
                  }
                  return null;
                });
              })}
            </svg>
          </div>

          {/* Orbs grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
            {capabilities.map((capability, index) => (
              <CapabilityOrb
                key={index}
                capability={capability}
                index={index}
                onHover={setHoveredIndex}
                isHovered={hoveredIndex === index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
