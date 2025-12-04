"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const cardColors = [
  { iconBg: "bg-cyan-100 dark:bg-cyan-900/30", iconColor: "text-cyan-600 dark:text-cyan-400", iconBorder: "border-cyan-500", itemBorder: "border-cyan-500", dotColor: "bg-cyan-600 dark:bg-cyan-400" },
  { iconBg: "bg-rose-100 dark:bg-rose-900/30", iconColor: "text-rose-600 dark:text-rose-400", iconBorder: "border-rose-500", itemBorder: "border-rose-500", dotColor: "bg-rose-600 dark:bg-rose-400" },
  { iconBg: "bg-teal-100 dark:bg-teal-900/30", iconColor: "text-teal-600 dark:text-teal-400", iconBorder: "border-teal-500", itemBorder: "border-teal-500", dotColor: "bg-teal-600 dark:bg-teal-400" },
];

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
  const colors = cardColors[index % cardColors.length];
  
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
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl">
        <div className="relative z-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${colors.iconBg} border ${colors.iconBorder}`}>
                <Icon className={`h-6 w-6 ${colors.iconColor}`} />
              </div>
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
                    className={`flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-muted/30 border-l-4 ${colors.itemBorder}`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${colors.dotColor} mt-2 shrink-0`} />
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

