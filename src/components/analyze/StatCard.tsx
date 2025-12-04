"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  index?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden border-2 border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 group">
        {/* Subtle accent gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/15 transition-colors duration-300">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
              className="text-3xl sm:text-4xl font-bold text-foreground"
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

