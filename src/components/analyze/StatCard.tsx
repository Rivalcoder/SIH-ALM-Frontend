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

const cardColors = [
  { iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400", iconBorder: "border-blue-500" },
  { iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400", iconBorder: "border-emerald-500" },
  { iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400", iconBorder: "border-purple-500" },
  { iconBg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600 dark:text-orange-400", iconBorder: "border-orange-500" },
];

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  index = 0,
}: StatCardProps) {
  const colors = cardColors[index % cardColors.length];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-sm shadow-xl">
        <div className="relative z-10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${colors.iconBg} border ${colors.iconBorder}`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${colors.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
              className="text-2xl sm:text-3xl font-bold text-foreground"
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

