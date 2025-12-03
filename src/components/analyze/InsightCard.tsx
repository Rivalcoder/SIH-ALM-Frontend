"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InsightCardProps {
  title: string;
  icon: LucideIcon;
  data: string[];
  emptyText: string;
  index?: number;
  gradient?: string;
}

export function InsightCard({
  title,
  icon: Icon,
  data,
  emptyText,
  index = 0,
  gradient = "from-blue-500/20 via-purple-500/20 to-pink-500/20",
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-xl group">
        {/* Animated gradient background */}
        <motion.div
          className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl", `bg-gradient-to-br ${gradient}`)}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative z-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <motion.div
                className={cn("p-3 rounded-xl bg-gradient-to-br", gradient)}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className="h-6 w-6 text-accent" />
              </motion.div>
              <span className="text-lg font-bold">{title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data && data.length > 0 ? (
              <ul className="space-y-3">
                {data.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + idx * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border-l-4 border-accent/30"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <span className="text-sm text-foreground/80 leading-relaxed">{item}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">{emptyText}</p>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

