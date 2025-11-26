"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isHomePage = pathname === "/";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/analyze", label: "Analyze" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ backdropFilter: "blur(0px)", backgroundColor: "transparent" }}
      animate={{
        backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
        backgroundColor: scrolled 
          ? "hsl(var(--background) / 0.8)" 
          : "transparent",
        borderBottomWidth: scrolled ? "1px" : "0px",
        boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 blur-lg bg-accent/30 group-hover:bg-accent/50 transition-all rounded-full" />
              <Waves className="h-8 w-8 text-accent transition-transform relative z-10" />
            </motion.div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-accent via-purple-500 to-accent bg-clip-text text-transparent">
              ALM-Asia
            </span>
          </Link>

          {/* Desktop Navigation - hidden on home page */}
          {!isHomePage && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all relative",
                    isActive(link.href)
                      ? "bg-accent text-accent-foreground shadow-md shadow-accent/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-foreground/20"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Link href="/signin">
              <Button 
                variant="ghost" 
                className="hover:bg-accent/10 transition-all relative z-10 overflow-visible"
              >
                <span className="relative z-20 text-foreground">Sign In</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/30 transition-all">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu - hide nav links on home page */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 space-y-2 fade-in-up">
            {!isHomePage && navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4 border-t border-border/50">
              <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full hover:bg-accent/10 relative z-10 overflow-visible">
                  <span className="relative z-20 text-foreground">Sign In</span>
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
