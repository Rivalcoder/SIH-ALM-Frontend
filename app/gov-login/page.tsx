"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, User, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";

export default function GovLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showBiometric, setShowBiometric] = useState(false);
    const { theme, setTheme } = useTheme();
    const scanningStarted = useRef(false);

    // Mounted check for hydration mismatch prevention
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-start biometric scanning when biometric screen appears
    useEffect(() => {
        if (showBiometric && !scanningStarted.current) {
            scanningStarted.current = true;
            // Start loading immediately to show animations
            setIsLoading(true);
            
            // After 5 seconds of scanning, show success
            const scanningTimer = setTimeout(() => {
                setIsLoading(false);
                setIsSuccess(true);
            }, 5000);
            
            // Redirect after showing success for 1.5 seconds
            const redirectTimer = setTimeout(() => {
                router.push('/cities');
            }, 6500); // 5 seconds scanning + 1.5 seconds success display
            
            return () => {
                clearTimeout(scanningTimer);
                clearTimeout(redirectTimer);
            };
        }
    }, [showBiometric, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network request
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsLoading(false);
        setShowBiometric(true);
    };

    const handleFingerprintAuth = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
            router.push('/cities');
        }, 1500);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
            {/* Abstract Animated India Flag Background */}
            <div className="absolute inset-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-orange-500/30 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-green-500/30 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
                <div className="absolute top-[40%] left-[30%] w-[50vw] h-[50vw] bg-blue-500/20 rounded-full blur-[100px] animate-pulse-slow delay-500" />
            </div>

            <div className="relative z-10 w-full max-w-md p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header Section */}
                    <div className="pt-8 pb-6 px-8 flex flex-col items-center justify-center text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="relative w-24 h-24 drop-shadow-lg"
                        >
                            {/* Ashoka Pillar Placeholder - Using a high quality SVG URL or fallback */}
                            <div className="w-full h-full flex items-center justify-center">
                                {/* Trusted Wikimedia Commons URL for Emblem of India */}
                                <Image
                                    src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                    alt="Ashoka Pillar - Emblem of India"
                                    width={96}
                                    height={96}
                                    className="object-contain filter dark:invert-0" // Keep original colors usually, or invert for dark mode if it was black/white. Embelm is usually gold/black.
                                />
                            </div>
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-2xl mt-4 font-bold text-zinc-900 dark:text-zinc-100 font-serif tracking-wide"
                            >
                                GOVERNMENT OF INDIA
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]"
                            >
                                Satyameva Jayate
                            </motion.p>
                        </div>

                        {/* Animated Divider */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="h-1 w-24 bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-full"
                        />
                    </div>

                    <div className="px-8 pb-8">
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col items-center justify-center space-y-4 py-10"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    >
                                        <CheckCircle2 className="w-20 h-20 text-green-500" />
                                    </motion.div>
                                    <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
                                        Welcome Back
                                    </h2>
                                    <p className="text-zinc-500 dark:text-zinc-400">Redirecting to dashboard...</p>
                                </motion.div>
                            ) : showBiometric ? (
                                <motion.div
                                    key="biometric"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-col items-center justify-center space-y-6 py-8"
                                >
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-center"
                                    >
                                        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                                            Biometric Authentication
                                        </h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Place your finger on the scanner
                                        </p>
                                    </motion.div>

                                    {/* Aadhaar-style Fingerprint Scanner */}
                                    <div className="flex flex-col items-center justify-center space-y-5">
                                        <div className="relative">
                                            {/* Outer Circle */}
                                            <div className={`relative w-44 h-44 rounded-full border-4 ${
                                                isLoading 
                                                    ? "border-emerald-500 dark:border-emerald-400 shadow-2xl shadow-emerald-500/40" 
                                                    : "border-zinc-200 dark:border-zinc-700"
                                            } flex items-center justify-center transition-all duration-300 bg-white dark:bg-zinc-900`}>
                                                {/* Multiple Pulsing Rings */}
                                                {isLoading && (
                                                    <>
                                                        <motion.div
                                                            className="absolute inset-0 rounded-full border-3 border-emerald-500 dark:border-emerald-400"
                                                            animate={{
                                                                scale: [1, 1.4, 1],
                                                                opacity: [0.8, 0, 0.8],
                                                            }}
                                                            transition={{
                                                                duration: 1.2,
                                                                repeat: Infinity,
                                                                ease: "easeOut"
                                                            }}
                                                        />
                                                        <motion.div
                                                            className="absolute inset-0 rounded-full border-3 border-emerald-500 dark:border-emerald-400"
                                                            animate={{
                                                                scale: [1, 1.3, 1],
                                                                opacity: [0.6, 0, 0.6],
                                                            }}
                                                            transition={{
                                                                duration: 1.2,
                                                                repeat: Infinity,
                                                                ease: "easeOut",
                                                                delay: 0.15
                                                            }}
                                                        />
                                                        <motion.div
                                                            className="absolute inset-0 rounded-full border-3 border-emerald-500 dark:border-emerald-400"
                                                            animate={{
                                                                scale: [1, 1.2, 1],
                                                                opacity: [0.4, 0, 0.4],
                                                            }}
                                                            transition={{
                                                                duration: 1.2,
                                                                repeat: Infinity,
                                                                ease: "easeOut",
                                                                delay: 0.3
                                                            }}
                                                        />
                                                    </>
                                                )}
                                                
                                                {/* Inner Circle with Fingerprint Icon */}
                                                <div className={`w-32 h-32 rounded-full flex items-center justify-center relative overflow-hidden ${
                                                    isLoading 
                                                        ? "bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:via-emerald-800/30 dark:to-emerald-900/30" 
                                                        : "bg-zinc-50 dark:bg-zinc-800"
                                                } transition-all duration-300 border-2 border-zinc-200 dark:border-zinc-700`}>
                                                    {/* Scanning Beam Effect */}
                                                    {isLoading && (
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/40 to-transparent"
                                                            animate={{
                                                                rotate: [0, 360],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: "linear"
                                                            }}
                                                        />
                                                    )}
                                                    
                                                    <Fingerprint 
                                                        size={64} 
                                                        className={`relative z-10 ${
                                                            isLoading 
                                                                ? "text-emerald-600 dark:text-emerald-400" 
                                                                : "text-zinc-400 dark:text-zinc-500"
                                                        } transition-colors duration-300`} 
                                                    />
                                                    
                                                    {/* Glow effect when scanning */}
                                                    {isLoading && (
                                                        <motion.div
                                                            className="absolute inset-0 rounded-full bg-emerald-400/25 dark:bg-emerald-500/25"
                                                            animate={{
                                                                scale: [1, 1.15, 1],
                                                                opacity: [0.4, 0.7, 0.4],
                                                            }}
                                                            transition={{
                                                                duration: 1,
                                                                repeat: Infinity,
                                                                ease: "easeInOut"
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {/* Scanning Lines - Vertical sweep */}
                                                {isLoading && (
                                                    <div className="absolute inset-0 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="absolute w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent dark:via-emerald-400"
                                                            style={{
                                                                top: '50%',
                                                                left: 0,
                                                                transform: 'translateY(-50%)',
                                                            }}
                                                            animate={{
                                                                y: ['-100%', '100%'],
                                                            }}
                                                            transition={{
                                                                duration: 1.2,
                                                                repeat: Infinity,
                                                                ease: "easeInOut"
                                                            }}
                                                        />
                                                        <motion.div
                                                            className="absolute w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent dark:via-emerald-400"
                                                            style={{
                                                                top: '50%',
                                                                left: 0,
                                                                transform: 'translateY(-50%)',
                                                            }}
                                                            animate={{
                                                                y: ['-100%', '100%'],
                                                            }}
                                                            transition={{
                                                                duration: 1.2,
                                                                repeat: Infinity,
                                                                ease: "easeInOut",
                                                                delay: 0.6
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Text */}
                                        {isLoading && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center"
                                            >
                                                <motion.p 
                                                    className="text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                                                    animate={{
                                                        opacity: [0.8, 1, 0.8],
                                                    }}
                                                    transition={{
                                                        duration: 1.2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    Scanning fingerprint...
                                                </motion.p>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: 0.6 }}
                                    onSubmit={handleLogin}
                                    className="space-y-5"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase ml-1">Username</label>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                                                    <User size={20} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                                                    placeholder="Enter your specific ID"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase ml-1">Password</label>
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                                                    <Lock size={20} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-center-zinc-400"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                                            <span className="text-zinc-600 dark:text-zinc-400">Remember me</span>
                                        </label>
                                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                                            Forgot password?
                                        </a>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl py-3.5 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                    >
                                        {isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full"
                                            />
                                        ) : (
                                            <>
                                                <span>Secure Sign In</span>
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Ribbon */}
                    <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-white to-green-500"></div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-6"
                >
                    © 2024 Government of India. All rights reserved. <br />
                    Secure Access System v2.0
                </motion.p>
            </div>

            {/* Theme Toggle (Optional, usually in navbar but adding here for demo) */}
            <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-black transition-all"
                title="Toggle Theme"
            >
                <div className="w-5 h-5 bg-gradient-to-br from-zinc-400 to-zinc-600 rounded-full dark:from-yellow-400 dark:to-orange-500" />
            </button>

            <style jsx global>{`
        @keyframes scan {
          0% { top: 0; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 1.5s linear infinite;
          box-shadow: 0 0 10px #3b82f6;
        }
        .animate-pulse-slow {
            animation: pulse-slow 8s infinite ease-in-out;
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
        </div>
    );
}
