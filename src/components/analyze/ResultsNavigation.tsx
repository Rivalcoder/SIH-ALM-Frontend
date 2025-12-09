"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ResultsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showSidebar: boolean;
  onShowSidebar: () => void;
  hiddenTabs?: string[];
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
  hiddenTabs = [],
}: ResultsNavigationProps) {
  const visibleTabs = tabs.filter((tab) => !hiddenTabs.includes(tab.id));

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full relative"
      style={{
        backgroundColor: "hsl(var(--background) / 0.98)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "none",
        boxShadow: "none",
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'opacity',
        pointerEvents: 'auto',
      }}
    >
      {/* Subtle gradient shimmer */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" 
        style={{ pointerEvents: 'none' }}
      />
      
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-center h-14 md:h-16">
          {/* Tab Navigation - Desktop */}
          <div className="hidden md:flex items-center justify-center gap-2 flex-1">
            {visibleTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative px-6 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap",
                  "transition-colors duration-200",
                  activeTab === tab.id
                    ? "text-gray-900 dark:text-foreground pb-3"
                    : "text-gray-900 dark:text-muted-foreground"
                )}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                whileHover={{ 
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  pointerEvents: 'auto',
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
                      boxShadow: "0 0 12px hsl(var(--accent) / 0.15)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                      mass: 0.5,
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
                <span className="relative z-10 flex items-center gap-2 text-gray-900 dark:text-foreground">
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: 1 }}
                      className="w-1.5 h-1.5 rounded-full bg-accent"
                      style={{
                        boxShadow: "0 0 6px hsl(var(--accent) / 0.6)",
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
                      boxShadow: "0 2px 6px hsl(var(--accent) / 0.4)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                      mass: 0.5,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Tab Navigation - Mobile */}
          <div 
            className="md:hidden flex items-center justify-center gap-1.5 flex-1"
            style={{
              position: 'relative',
            }}
          >
            <div 
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide"
              style={{
                width: '100%',
                overflowY: 'visible',
                touchAction: 'pan-x',
                overscrollBehavior: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                height: 'auto',
                maxHeight: 'none',
                position: 'relative',
                zIndex: 1,
              }}
            >
            {visibleTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative px-4 py-2 text-xs font-medium rounded-md whitespace-nowrap",
                  "transition-colors duration-200",
                  activeTab === tab.id
                    ? "text-gray-900 dark:text-foreground pb-2.5"
                    : "text-gray-900 dark:text-muted-foreground"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  pointerEvents: 'auto',
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
                
                <span className="relative z-10 text-gray-900 dark:text-foreground">{tab.label}</span>
                
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
      </div>
    </motion.nav>
  );
}
