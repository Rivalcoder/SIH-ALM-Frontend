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
      {/* Main card container - circular glass orb */}
      <motion.div
        className="relative w-full aspect-square overflow-hidden rounded-full"
        animate={{
          scale: expanded ? 1.02 : 1,
        }}
        transition={{
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
      >

        {/* Glass morphism surface - subtle black/gray with transparency in light mode */}
        <motion.div 
          className="absolute inset-0 backdrop-blur-xl border rounded-full dark:bg-transparent"
          style={{
            background: "rgba(0, 0, 0, 0.04)",
            borderColor: expanded 
              ? `${capability.glowColor}88`
              : "hsl(var(--border) / 0.3)",
            boxShadow: expanded
              ? `0 0 32px ${capability.glowColor}55, inset 0 0 20px ${capability.glowColor}15`
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        />
        {/* Subtle gradient overlay for depth in light mode */}
        <motion.div 
          className="absolute inset-0 rounded-full pointer-events-none dark:hidden"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.06), rgba(0,0,0,0.02))",
          }}
        />
        {/* Light mode only highlight - hidden in dark mode */}
        {expanded && (
          <motion.div 
            className="absolute inset-0 rounded-full pointer-events-none dark:hidden"
            style={{
              background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.2), transparent 60%)",
            }}
          />
        )}

        {/* Pulsing outline around card when hovered - circular */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: "2px solid",
            borderColor: `${capability.glowColor}80`,
          }}
          animate={expanded
            ? {
                opacity: [0.7, 0.3, 0.7],
                scale: [1, 1.03, 1],
              }
            : {
                opacity: 0,
                scale: 1,
              }}
          transition={{
            duration: 1.4,
            repeat: expanded ? Infinity : 0,
            ease: "easeOut",
          }}
        />


        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
          {/* Icon + label */}
          <motion.div
            className="relative mb-4 flex flex-col items-center"
            animate={{
              y: expanded ? -4 : 0,
            }}
            transition={{
              duration: 0.25,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <motion.div
              className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full border shadow-lg dark:bg-background/20 backdrop-blur-sm"
              style={{
                background: "rgba(0, 0, 0, 0.06)",
                borderColor: expanded 
                  ? `${capability.glowColor}60`
                  : "hsl(var(--border) / 0.4)",
                boxShadow: expanded
                  ? `0 0 36px ${capability.glowColor}75, 0 10px 26px rgba(0,0,0,0.1), inset 0 0 20px ${capability.glowColor}20`
                  : "0 2px 8px rgba(0,0,0,0.08)",
              }}
              animate={{
                scale: expanded ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: expanded ? 1.6 : 0.3,
                repeat: expanded ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              {/* Pulsing glow behind icon when hovered */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${capability.glowColor}40, transparent 70%)`,
                }}
                animate={expanded
                  ? {
                      scale: [1, 1.18, 1],
                      opacity: [0.5, 0, 0.5],
                    }
                  : {
                      scale: 1,
                      opacity: 0,
                    }}
                transition={{
                  duration: 1.8,
                  repeat: expanded ? Infinity : 0,
                  ease: "easeOut",
                }}
              />
              <Icon
                className={`h-10 w-10 sm:h-12 sm:w-12 ${capability.iconColor}`}
              />
            </motion.div>
            <motion.h3
              className="font-bold text-sm sm:text-base mt-4 text-foreground"
              style={{
                textShadow: expanded 
                  ? "0 2px 8px rgba(0,0,0,0.1)"
                  : "none",
              }}
              initial={false}
              animate={{ opacity: 1 }}
            >
              {capability.label}
            </motion.h3>
          </motion.div>

          {/* Description shown more on hover */}
          <motion.p
            className="text-xs sm:text-sm leading-relaxed text-foreground/70 dark:text-foreground/80 max-w-xs mx-auto"
            style={{
              textShadow: expanded 
                ? "0 1px 3px rgba(0,0,0,0.08)"
                : "none",
            }}
            initial={false}
            animate={{
              opacity: expanded ? 1 : 0.7,
              y: expanded ? 0 : 4,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {capability.description}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Showcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Mesh gradient background (static to improve scroll performance) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-emerald-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-rose-500/10 blur-3xl" />
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
                        whileInView={{ pathLength: 1, opacity: hoveredIndex === i || hoveredIndex === i + j + 1 ? 0.8 : 0.25 }}
                        viewport={{ once: true }}
                        transition={{
                          pathLength: { duration: 2, delay: (i + j) * 0.15, ease: "easeInOut" },
                          opacity: { duration: 0.3 },
                        }}
                        animate={{
                          opacity: hoveredIndex === i || hoveredIndex === i + j + 1 ? 0.8 : 0.25,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-16 md:gap-x-8 md:gap-y-24 relative z-10">
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
