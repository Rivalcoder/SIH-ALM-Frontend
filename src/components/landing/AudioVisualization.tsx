"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface SoundWave {
  id: number;
  radius: number;
  opacity: number;
  speed: number;
}

interface Orb {
  id: number;
  angle: number;
  radius: number;
  size: number;
  speed: number;
}

interface HoverParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export function AudioVisualization() {
  const [soundWaves, setSoundWaves] = useState<SoundWave[]>([]);
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [frequencies, setFrequencies] = useState<number[]>([]);
  const [hoverParticles, setHoverParticles] = useState<HoverParticle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Initialize radial sound waves
  useEffect(() => {
    const waves: SoundWave[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      radius: i * 40 + 20,
      opacity: 1 - i * 0.2,
      speed: 0.5 + i * 0.2,
    }));
    setSoundWaves(waves);
  }, []);

  // Animate sound waves expanding
  useEffect(() => {
    const interval = setInterval(() => {
      setSoundWaves(prev =>
        prev.map((wave, i) => {
          if (wave.radius >= 200) {
            return {
              ...wave,
              radius: 20,
              opacity: 1,
            };
          }
          return {
            ...wave,
            radius: wave.radius + wave.speed,
            opacity: Math.max(0.1, wave.opacity - 0.015),
          };
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Initialize orbiting particles
  useEffect(() => {
    const newOrbs: Orb[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * Math.PI * 2,
      radius: 60 + Math.random() * 40,
      size: 3 + Math.random() * 4,
      speed: 0.02 + Math.random() * 0.03,
    }));
    setOrbs(newOrbs);
  }, []);

  // Animate orbs
  useEffect(() => {
    const interval = setInterval(() => {
      setOrbs(prev =>
        prev.map(orb => ({
          ...orb,
          angle: orb.angle + orb.speed,
        }))
      );
      setTime(t => t + 0.1);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Initialize circular frequency bars
  useEffect(() => {
    const initialFreqs = Array.from({ length: 60 }, () => Math.random() * 100);
    setFrequencies(initialFreqs);

    const interval = setInterval(() => {
      setFrequencies(prev =>
        prev.map((_, i) => {
          const base = 40 + Math.sin(time + i * 0.3) * 30;
          const peak = Math.random() > 0.8 ? Math.random() * 100 : base;
          return Math.max(20, Math.min(100, peak));
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [time]);

  // Hover particle effect
  useEffect(() => {
    if (!isHovered) return;

    const interval = setInterval(() => {
      setHoverParticles(prev => {
        const newParticles = Array.from({ length: 3 }, (_, i) => ({
          id: Date.now() + i,
          x: mousePos.x,
          y: mousePos.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
        }));
        return [...prev, ...newParticles].filter(p => p.life > 0);
      });
    }, 100);

    const updateParticles = setInterval(() => {
      setHoverParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      );
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(updateParticles);
    };
  }, [isHovered, mousePos]);

  // Mouse tracking with hover effects
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const rotateX = useSpring(useTransform(mouseY, [0, 1], isHovered ? [-12, 12] : [-8, 8]), {
    stiffness: isHovered ? 200 : 150,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], isHovered ? [-12, 12] : [-8, 8]), {
    stiffness: isHovered ? 200 : 150,
    damping: 25,
  });
  
  const scale = useSpring(isHovered ? 1.02 : 1, {
    stiffness: 300,
    damping: 30,
  });

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-md h-[500px] flex items-center justify-center cursor-pointer"
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glass container */}
      <motion.div
        className="relative w-full h-full rounded-3xl p-6 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          borderColor: isHovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)",
          boxShadow: isHovered 
            ? "0 25px 80px rgba(0,0,0,0.4), 0 0 40px hsl(var(--accent) / 0.2), inset 0 1px 0 rgba(255,255,255,0.3)"
            : "0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Hover particles */}
        {hoverParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "6px",
              height: "6px",
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              background: "radial-gradient(circle, hsl(var(--accent)), transparent)",
              boxShadow: "0 0 10px hsl(var(--accent) / 0.8)",
            }}
            animate={{
              opacity: particle.life,
              scale: particle.life,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}

        {/* Cursor glow effect */}
        {isHovered && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "200px",
              height: "200px",
              left: mousePos.x,
              top: mousePos.y,
              background: "radial-gradient(circle, hsl(var(--accent) / 0.1), transparent 70%)",
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        {/* Animated mesh background */}
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            opacity: isHovered ? 0.5 : 0.3,
          }}
          transition={{ duration: 0.3 }}
        >
          <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <motion.path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="0.5"
                  opacity="0.2"
                  animate={{
                    strokeWidth: isHovered ? "1" : "0.5",
                    opacity: isHovered ? 0.4 : 0.2,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </pattern>
            </defs>
            <motion.rect 
              width="100%" 
              height="100%" 
              fill="url(#grid)"
              animate={{
                opacity: isHovered ? 0.6 : 0.4,
              }}
            />
          </svg>
        </motion.div>

        {/* Central visualization area */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Expanding sound wave rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            {soundWaves.map((wave) => (
              <motion.div
                key={wave.id}
                className="absolute rounded-full border-2"
                style={{
                  width: `${wave.radius * 2}px`,
                  height: `${wave.radius * 2}px`,
                  borderColor: `hsl(var(--accent) / ${wave.opacity})`,
                  boxShadow: `0 0 ${wave.radius * 0.5}px hsl(var(--accent) / ${wave.opacity * 0.5})`,
                }}
                animate={{
                  scale: isHovered ? [1, 1.05, 1] : 1,
                  opacity: wave.opacity,
                  borderWidth: isHovered ? "3px" : "2px",
                }}
                transition={{ 
                  scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.3, ease: "linear" },
                  borderWidth: { duration: 0.3 },
                }}
              />
            ))}
          </div>

          {/* Circular frequency visualization */}
          <div className="relative w-80 h-80">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
              <defs>
                <linearGradient id="freqGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" />
                  <stop offset="50%" stopColor="hsl(var(--accent) / 0.7)" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
              {/* Outer frequency ring */}
              {frequencies.map((freq, i) => {
                const angle = (i / frequencies.length) * Math.PI * 2 - Math.PI / 2;
                const centerX = 150;
                const centerY = 150;
                const baseRadius = 100;
                const radius = baseRadius + (freq / 100) * 50;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const x2 = centerX + Math.cos(angle) * (baseRadius + 20);
                const y2 = centerY + Math.sin(angle) * (baseRadius + 20);

                return (
                  <motion.line
                    key={i}
                    x1={x2}
                    y1={y2}
                    x2={x}
                    y2={y}
                    stroke="url(#freqGradient)"
                    strokeWidth={isHovered ? "2.5" : "2"}
                    strokeLinecap="round"
                    animate={{
                      x2: centerX + Math.cos(angle) * (baseRadius + 20),
                      y2: centerY + Math.sin(angle) * (baseRadius + 20),
                      x1: centerX + Math.cos(angle) * (baseRadius + (freq / 100) * (isHovered ? 60 : 50)),
                      y1: centerY + Math.sin(angle) * (baseRadius + (freq / 100) * (isHovered ? 60 : 50)),
                      opacity: isHovered ? [0.6, 1, 0.6] : [0.4, 1, 0.4],
                    }}
                    transition={{
                      x1: { duration: 0.1 },
                      y1: { duration: 0.1 },
                      opacity: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                      strokeWidth: { duration: 0.3 },
                    }}
                    whileHover={{
                      strokeWidth: 3,
                      opacity: 1,
                    }}
                  />
                );
              })}

              {/* Inner frequency ring */}
              {frequencies.slice(0, 30).map((freq, i) => {
                const angle = (i / 30) * Math.PI * 2 - Math.PI / 2;
                const centerX = 150;
                const centerY = 150;
                const baseRadius = 60;
                const radius = baseRadius + (freq / 100) * 30;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const x2 = centerX + Math.cos(angle) * baseRadius;
                const y2 = centerY + Math.sin(angle) * baseRadius;

                return (
                  <motion.line
                    key={`inner-${i}`}
                    x1={x2}
                    y1={y2}
                    x2={x}
                    y2={y}
                    stroke="hsl(var(--accent) / 0.6)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    animate={{
                      x2: centerX + Math.cos(angle) * baseRadius,
                      y2: centerY + Math.sin(angle) * baseRadius,
                      x1: centerX + Math.cos(angle) * (baseRadius + (freq / 100) * 30),
                      y1: centerY + Math.sin(angle) * (baseRadius + (freq / 100) * 30),
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      x1: { duration: 0.1 },
                      y1: { duration: 0.1 },
                      opacity: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                );
              })}
            </svg>

            {/* Orbiting particles */}
            {orbs.map((orb) => {
              const centerX = 150;
              const centerY = 150;
              const x = centerX + Math.cos(orb.angle) * orb.radius;
              const y = centerY + Math.sin(orb.angle) * orb.radius;

              return (
                <motion.div
                  key={orb.id}
                  className="absolute rounded-full cursor-pointer"
                  style={{
                    width: `${orb.size}px`,
                    height: `${orb.size}px`,
                    left: `${(x / 300) * 100}%`,
                    top: `${(y / 300) * 100}%`,
                    background: `radial-gradient(circle, hsl(var(--accent)), hsl(var(--accent) / 0.3))`,
                    boxShadow: `0 0 ${orb.size * 2}px hsl(var(--accent) / 0.6)`,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{
                    scale: isHovered ? [1, 1.5, 1] : [1, 1.3, 1],
                    opacity: isHovered ? [0.8, 1, 0.8] : [0.6, 1, 0.6],
                  }}
                  transition={{
                    scale: { duration: isHovered ? 1.5 : 2, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: isHovered ? 1 : 1.5, repeat: Infinity, ease: "easeInOut" },
                  }}
                  whileHover={{
                    scale: 2,
                    boxShadow: `0 0 ${orb.size * 4}px hsl(var(--accent) / 1)`,
                  }}
                />
              );
            })}

            {/* Central 3D sphere */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer"
              style={{
                width: "80px",
                height: "80px",
                background: "radial-gradient(circle at 30% 30%, hsl(var(--accent) / 0.9), hsl(var(--accent) / 0.4), transparent)",
                boxShadow: "0 0 40px hsl(var(--accent) / 0.8), inset 0 0 30px hsl(var(--accent) / 0.3)",
              }}
              animate={{
                rotateY: [0, 360],
                rotateX: isHovered ? [0, 25, -25, 0] : [0, 15, -15, 0],
                scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1],
              }}
              transition={{
                rotateY: { duration: isHovered ? 6 : 8, repeat: Infinity, ease: "linear" },
                rotateX: { duration: isHovered ? 3 : 4, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: isHovered ? 1.5 : 2, repeat: Infinity, ease: "easeInOut" },
              }}
              whileHover={{
                scale: 1.3,
                boxShadow: "0 0 60px hsl(var(--accent) / 1), inset 0 0 40px hsl(var(--accent) / 0.5)",
              }}
            >
              {/* Inner glow */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
                style={{
                  width: "20px",
                  height: "20px",
                  boxShadow: "0 0 20px rgba(255,255,255,0.8)",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Connecting lines between particles */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              {orbs.slice(0, orbs.length - 1).map((orb, i) => {
                const nextOrb = orbs[(i + 1) % orbs.length];
                const centerX = 150;
                const centerY = 150;
                const x1 = centerX + Math.cos(orb.angle) * orb.radius;
                const y1 = centerY + Math.sin(orb.angle) * orb.radius;
                const x2 = centerX + Math.cos(nextOrb.angle) * nextOrb.radius;
                const y2 = centerY + Math.sin(nextOrb.angle) * nextOrb.radius;

                return (
                  <motion.line
                    key={`line-${i}`}
                    x1={(x1 / 300) * 100 + "%"}
                    y1={(y1 / 300) * 100 + "%"}
                    x2={(x2 / 300) * 100 + "%"}
                    y2={(y2 / 300) * 100 + "%"}
                    stroke="hsl(var(--accent) / 0.3)"
                    strokeWidth="1"
                    animate={{
                      opacity: [0.1, 0.4, 0.1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />
                );
              })}
            </svg>
          </div>

          {/* Floating data points */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full cursor-pointer"
              style={{
                width: "4px",
                height: "4px",
                background: "hsl(var(--accent))",
                boxShadow: "0 0 8px hsl(var(--accent) / 0.8)",
                left: `${15 + (i % 4) * 25}%`,
                top: `${10 + Math.floor(i / 4) * 30}%`,
              }}
              animate={{
                y: isHovered ? [0, -30, 0] : [0, -20, 0],
                opacity: isHovered ? [0.5, 1, 0.5] : [0.3, 1, 0.3],
                scale: isHovered ? [1, 2, 1] : [1, 1.5, 1],
              }}
              transition={{
                duration: isHovered ? 1.5 + i * 0.2 : 2 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
              whileHover={{
                scale: 2.5,
                boxShadow: "0 0 15px hsl(var(--accent) / 1)",
              }}
            />
          ))}

          {/* Additional animated background particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={`bg-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: `hsl(var(--accent) / ${0.2 + Math.random() * 0.3})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30 - Math.random() * 50, 0],
                x: [0, (Math.random() - 0.5) * 30, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Edge glow effects */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
          animate={{
            opacity: isHovered ? [0.5, 1, 0.5] : [0.3, 0.7, 0.3],
            height: isHovered ? ["4px", "6px", "4px"] : "1px",
          }}
          transition={{
            duration: isHovered ? 1.5 : 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
          animate={{
            opacity: isHovered ? [0.5, 1, 0.5] : [0.3, 0.7, 0.3],
            height: isHovered ? ["4px", "6px", "4px"] : "1px",
          }}
          transition={{
            duration: isHovered ? 1.5 : 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Pin/Poster holes at corners - transparent */}
        {[
          { position: "top-6 left-6", translate: "translate(-50%, -50%)" },
          { position: "top-6 right-6", translate: "translate(50%, -50%)" },
          { position: "bottom-6 left-6", translate: "translate(-50%, 50%)" },
          { position: "bottom-6 right-6", translate: "translate(50%, 50%)" },
        ].map(({ position, translate }, i) => (
          <motion.div
            key={`pin-${i}`}
            className={`absolute ${position} pointer-events-none z-50`}
            style={{
              transform: translate,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
          >
            {/* Outer subtle ring */}
            <div
              className="absolute rounded-full"
              style={{
                width: "20px",
                height: "20px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            />
            {/* Transparent center hole */}
            <div
              className="absolute rounded-full"
              style={{
                width: "16px",
                height: "16px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "inset 0 0 4px rgba(255,255,255,0.05)",
              }}
            />
          </motion.div>
        ))}

        {/* Corner glow effects on hover */}
        {isHovered && (
          <>
            {[
              { position: "top-0 left-0", transform: "translate(-50%, -50%)" },
              { position: "top-0 right-0", transform: "translate(50%, -50%)" },
              { position: "bottom-0 left-0", transform: "translate(-50%, 50%)" },
              { position: "bottom-0 right-0", transform: "translate(50%, 50%)" },
            ].map(({ position, transform }, i) => (
              <motion.div
                key={i}
                className={`absolute ${position}`}
                style={{
                  width: "100px",
                  height: "100px",
                  background: "radial-gradient(circle, hsl(var(--accent) / 0.3), transparent)",
                  transform,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
