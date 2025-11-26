"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Ear, Network, BrainCircuit, Languages } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Ear,
    title: "Context-Aware Ears",
    description:
      "Understands speech, emotion, accents, background noise, and social cues — like a human who never mishears.",
    position: "left" as const,
    gradient: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
    glowColor: "rgba(59, 130, 246, 0.5)",
  },
  {
    icon: Network,
    title: "Audio Knowledge Graph",
    description:
      "Transforms raw audio into a living graph of people, moods, locations, events, and hidden signals.",
    position: "right" as const,
    gradient: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
    glowColor: "rgba(168, 85, 247, 0.5)",
  },
  {
    icon: BrainCircuit,
    title: "Chain-of-Thought Reasoning",
    description:
      "Not just 'what happened' — but 'why it happened' using audio-driven reasoning flows.",
    position: "left" as const,
    gradient: "from-cyan-500/20 via-blue-500/20 to-indigo-500/20",
    glowColor: "rgba(6, 182, 212, 0.5)",
  },
  {
    icon: Languages,
    title: "Asian Multilingual Intelligence",
    description:
      "Understands Hindi, Tamil, Telugu, Bangla, Urdu, Mandarin, Korean — with cultural depth.",
    position: "right" as const,
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
    glowColor: "rgba(16, 185, 129, 0.5)",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = feature.icon;
  const isLeft = feature.position === "left";
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7.5, -7.5]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7.5, 7.5]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXRelative = (e.clientX - rect.left) / width - 0.5;
    const mouseYRelative = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(mouseXRelative);
    mouseY.set(mouseYRelative);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.23, 1, 0.32, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`group relative ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-6xl ${isLeft ? "md:ml-0" : "md:ml-auto"}`}
    >
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500 -z-10`}
        animate={{
          scale: isHovered ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glass morphism card */}
      <motion.div
        className="relative flex-1 glass-strong rounded-3xl p-8 md:p-10 border border-accent/20 group-hover:border-accent/40 transition-all duration-500"
        animate={{
          boxShadow: isHovered
            ? [
                "0 0 0px rgba(59, 130, 246, 0)",
                `0 0 60px ${feature.glowColor}`,
                "0 0 0px rgba(59, 130, 246, 0)",
              ]
            : "0 0 0px rgba(59, 130, 246, 0)",
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Floating particles effect */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-accent/30"
            style={{
              left: `${20 + i * 30}%`,
              top: `${15 + i * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10">
          <motion.h3
            className="text-3xl md:text-4xl font-bold mb-4 text-foreground group-hover:text-accent transition-colors duration-300"
            initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 + 0.3 }}
          >
            {feature.title}
          </motion.h3>
          
          <motion.p
            className="text-muted-foreground leading-relaxed text-lg md:text-xl max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 + 0.5 }}
          >
            {feature.description}
          </motion.p>
        </div>
      </motion.div>

      {/* Enhanced Icon section */}
      <motion.div
        className="flex-shrink-0 relative"
        initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.8,
          delay: index * 0.2 + 0.4,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        {/* Pulsing glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent/30"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: index * 0.3,
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border border-accent/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: index * 0.3 + 0.5,
          }}
        />

        {/* Main icon container */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.4,
          }}
          whileHover={{
            scale: 1.2,
            rotate: [0, -10, 10, -10, 0],
            transition: { duration: 0.5 },
          }}
        >
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl bg-accent/40 blur-2xl"
            animate={{
              opacity: isHovered ? [0.4, 0.8, 0.4] : 0.2,
              scale: isHovered ? [1, 1.3, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Icon background */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br from-accent/30 via-accent/20 to-accent/10 dark:from-accent/40 dark:via-accent/30 dark:to-accent/20 border-2 border-accent/40 flex items-center justify-center shadow-2xl shadow-accent/20 backdrop-blur-sm">
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Icon className="h-12 w-12 md:h-14 md:w-14 text-accent relative z-10" />
            </motion.div>
          </div>

          {/* Sparkle effects */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full"
              style={{
                top: `${25 + (i % 2) * 50}%`,
                left: `${25 + Math.floor(i / 2) * 50}%`,
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function Features() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
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
        <div className="text-center mb-20">
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
              Core Capabilities
            </motion.span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
          >
            Intelligent Audio{" "}
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
                Processing
              </motion.span>
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Advanced features that decode the complexity of human communication
            through cutting-edge AI technology
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="space-y-16 md:space-y-24">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
