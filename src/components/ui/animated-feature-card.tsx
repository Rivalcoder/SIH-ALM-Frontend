"use client";

import * as React from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
  variant?: "default" | "wide" | "tall" | "compact";
  className?: string;
}

export function AnimatedFeatureCard({
  icon: Icon,
  title,
  description,
  index,
  variant = "default",
  className,
}: AnimatedFeatureCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: "easeOut",
      }}
      className={cn("relative group", className)}
    >
      {/* Smooth background with subtle gradient */}
      <div className="relative rounded-2xl bg-gradient-to-br from-background via-background to-accent/5 dark:from-background/50 dark:to-background/30 p-8 border border-border/50 hover:border-accent/30 transition-all duration-300 overflow-hidden">
        
        {/* Subtle animated gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "linear-gradient(135deg, hsl(var(--accent) / 0.05), transparent 50%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon - simple and clean */}
          <motion.div
            className="mb-6 inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                <Icon className="h-7 w-7 text-accent" />
              </div>
              
              {/* Subtle glow on hover */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-accent/20 blur-xl"
                animate={{
                  opacity: isHovered ? 0.6 : 0,
                  scale: isHovered ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h3
            className="text-2xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors duration-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 + 0.1 }}
          >
            {title}
          </motion.h3>

          {/* Description */}
          <motion.p
            className="text-muted-foreground leading-relaxed text-base"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 + 0.2 }}
          >
            {description}
          </motion.p>

          {/* Subtle bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-accent to-transparent"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.6 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
