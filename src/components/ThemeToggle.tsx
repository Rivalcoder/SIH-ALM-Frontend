"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full relative group border border-transparent hover:border-accent/50 transition-all duration-300 !text-foreground hover:!text-foreground"
    >
      <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 rounded-full ring-2 ring-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-offset-2 ring-offset-background" />
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0 relative z-10 text-foreground" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 z-10 text-foreground" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
