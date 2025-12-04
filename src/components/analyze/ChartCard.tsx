"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface ChartCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function ChartCard({
  title,
  description,
  children,
  className,
  index = 0,
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
      }}
      className={className}
    >
      <Card className="border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="relative z-10 bg-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${index === 0 ? 'bg-violet-100 dark:bg-violet-900/30 border border-violet-500' : 'bg-amber-100 dark:bg-amber-900/30 border border-amber-500'}`}>
                <Sparkles className={`h-5 w-5 ${index === 0 ? 'text-violet-600 dark:text-violet-400' : 'text-amber-600 dark:text-amber-400'}`} />
              </div>
              <span className="text-xl font-bold">{title}</span>
            </CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 bg-transparent">{children}</CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

