"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
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
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Tab Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative px-5 py-2.5 text-sm font-semibold transition-all duration-200 rounded-lg whitespace-nowrap",
                  "hover:bg-accent/50",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-accent/20 rounded-lg border border-accent/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Tab Navigation - Mobile */}
          <div className="md:hidden flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide pb-1">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative px-4 py-2 text-xs font-semibold transition-all duration-200 rounded-lg whitespace-nowrap",
                  "hover:bg-accent/50",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabMobile"
                    className="absolute inset-0 bg-accent/20 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-primary rounded-full"
                    layoutId="activeIndicatorMobile"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Right: Actions */}
          {!showSidebar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="ml-4"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onShowSidebar}
                className="h-9 w-9 rounded-lg hover:bg-accent/50 transition-all duration-200"
              >
                <History className="h-4 w-4 text-muted-foreground" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

