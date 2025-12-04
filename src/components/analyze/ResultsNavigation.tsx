"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ResultsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showSidebar: boolean;
  onShowSidebar: () => void;
}

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "transcript", label: "Transcript" },
  { id: "insights", label: "Insights" },
  { id: "visualizations", label: "Charts" },
  { id: "chat", label: "Chat" },
];

export function ResultsNavigation({
  activeTab,
  onTabChange,
  showSidebar,
  onShowSidebar,
}: ResultsNavigationProps) {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full relative"
      style={{
        backgroundColor: "hsl(var(--background) / 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "none",
        boxShadow: "none",
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Subtle gradient shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-center h-14 md:h-16">
          {/* Tab Navigation - Desktop */}
          <div className="hidden md:flex items-center justify-center gap-2 flex-1">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative px-6 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap",
                  "transition-all duration-300 ease-out",
                  activeTab === tab.id
                    ? "text-foreground pb-3"
                    : "text-muted-foreground"
                )}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ 
                  scale: 1.05,
                  color: "hsl(var(--foreground))",
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Inactive tab background - always visible */}
                {activeTab !== tab.id && (
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border) / 0.6)",
                      boxShadow: "0 1px 3px hsl(var(--foreground) / 0.08)",
                    }}
                  />
                )}
                
                {/* Active background with gradient */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--accent) / 0.15), hsl(var(--accent) / 0.08))",
                      border: "1px solid hsl(var(--accent) / 0.3)",
                      boxShadow: "0 0 20px hsl(var(--accent) / 0.2)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}
                
                {/* Hover background */}
                {activeTab !== tab.id && (
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-0"
                    style={{
                      backgroundColor: "hsl(var(--muted) / 0.5)",
                    }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                {/* Text */}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-accent"
                      style={{
                        boxShadow: "0 0 8px hsl(var(--accent) / 0.8)",
                      }}
                    />
                  )}
                </span>
                
                {/* Active indicator line */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--accent) / 0.6))",
                      boxShadow: "0 2px 8px hsl(var(--accent) / 0.5)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Tab Navigation - Mobile */}
          <div className="md:hidden flex items-center justify-center gap-1.5 flex-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative px-4 py-2 text-xs font-medium rounded-md whitespace-nowrap",
                  "transition-all duration-200",
                  activeTab === tab.id
                    ? "text-foreground pb-2.5"
                    : "text-muted-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Inactive tab background - always visible */}
                {activeTab !== tab.id && (
                  <div
                    className="absolute inset-0 rounded-md"
                    style={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border) / 0.6)",
                      boxShadow: "0 1px 2px hsl(var(--foreground) / 0.08)",
                    }}
                  />
                )}
                
                {/* Active background */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabMobile"
                    className="absolute inset-0 rounded-md"
                    style={{
                      background: "hsl(var(--accent) / 0.12)",
                      border: "1px solid hsl(var(--accent) / 0.25)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
                
                {/* Hover background */}
                {activeTab !== tab.id && (
                  <motion.div
                    className="absolute inset-0 rounded-md opacity-0"
                    style={{
                      backgroundColor: "hsl(var(--muted) / 0.5)",
                    }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                <span className="relative z-10">{tab.label}</span>
                
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeIndicatorMobile"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2/3 h-0.5 rounded-full bg-accent"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
