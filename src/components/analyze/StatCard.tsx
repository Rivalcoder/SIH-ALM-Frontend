"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  index?: number;
  gradient?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  index = 0,
  gradient = "from-blue-500/30 via-purple-500/20 to-pink-500/30",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{ scale: 1.03, y: -8 }}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden border-0 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-xl shadow-xl group">
        {/* Animated gradient background */}
        <motion.div
          className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl", `bg-gradient-to-br ${gradient}`)}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </CardTitle>
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 backdrop-blur-sm"
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="h-5 w-5 text-accent" />
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent"
            >
              {value}
            </motion.div>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

