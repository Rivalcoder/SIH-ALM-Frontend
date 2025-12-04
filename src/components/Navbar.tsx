"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu, X, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on analyze/results page
  const isAnalyzePage = pathname === "/analyze" || pathname?.includes("/analyze");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ backdropFilter: "blur(0px)" }}
      animate={{
        backdropFilter: isAnalyzePage 
          ? (scrolled ? "blur(10px)" : "blur(6px)")
          : (scrolled ? "blur(16px)" : "blur(8px)"),
        backgroundColor: isAnalyzePage
          ? (scrolled ? "hsl(var(--background) / 0.4)" : "hsl(var(--background) / 0.1)")
          : (scrolled ? "hsl(var(--background) / 0.9)" : "hsl(var(--background) / 0.7)"),
        borderBottomWidth: isAnalyzePage ? "0px" : "1px",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 ${isAnalyzePage ? "border-0" : "border-b border-border/50"}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Clean and professional */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center">
              {!isAnalyzePage && (
                <div className="absolute inset-0 rounded-lg blur-sm transition-all duration-300 bg-accent/10 group-hover:bg-accent/15" />
              )}
              <Waves className={`h-7 w-7 text-accent relative z-10 transition-transform group-hover:scale-110 duration-300 ${
                isAnalyzePage ? "opacity-90" : ""
              }`} />
            </div>
            <span className={`text-lg md:text-xl font-bold ${
              isAnalyzePage ? "text-foreground/90" : "gradient-text"
            }`}>
              ALM-Asia
            </span>
          </Link>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link href="/signin">
              <Button 
                variant="ghost" 
                size="sm"
                className={`transition-colors ${
                  isAnalyzePage 
                    ? "hover:bg-accent/5 text-foreground/80 hover:text-foreground" 
                    : "hover:bg-accent/10"
                }`}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                size="sm"
                className={`transition-all ${
                  isAnalyzePage
                    ? "bg-accent/70 hover:bg-accent/85 text-accent-foreground shadow-sm hover:shadow-md backdrop-blur-sm border border-accent/20"
                    : "bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm hover:shadow-md"
                }`}
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`h-9 w-9 ${
                isAnalyzePage ? "hover:bg-accent/5" : ""
              }`}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 overflow-hidden"
          >
            <div className="py-3 space-y-2">
              <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start hover:bg-accent/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
