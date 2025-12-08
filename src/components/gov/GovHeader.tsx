"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

export default function GovHeader({
    title,
    subtitle,
    showBack = true
}: {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
}) {
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();

    return (
        <div className="relative z-10 w-full mb-8">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Top Navigation Bar */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-4">
                        {showBack && (
                            <Link href="/cities" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-2 rounded-lg hover:bg-white/50 dark:hover:bg-zinc-900/50">
                                <Home size={18} />
                                <span className="text-sm font-medium">Home</span>
                            </Link>
                        )}
                        {!showBack && pathname === '/cities' && (
                            <Link href="/" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-2 rounded-lg hover:bg-white/50 dark:hover:bg-zinc-900/50">
                                <Home size={18} />
                                <span className="text-sm font-medium">Main Portal</span>
                            </Link>
                        )}
                    </div>

                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm"
                        title="Toggle Theme"
                    >
                        <div className="w-5 h-5 bg-gradient-to-br from-zinc-400 to-zinc-600 rounded-full dark:from-yellow-400 dark:to-orange-500" />
                    </button>
                </motion.div>

                {/* Main Branding */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 drop-shadow-xl"
                    >
                        <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                            alt="Ashoka Pillar - Emblem of India"
                            fill
                            className="object-contain filter dark:invert-0"
                        />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 font-serif tracking-wide mb-2 uppercase"
                    >
                        {title || "Government of India"}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-6"
                    >
                        {subtitle || "Satyameva Jayate"}
                    </motion.p>

                    {/* Animated Divider */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="h-1 w-24 bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-full mx-auto shadow-sm"
                    />
                </motion.div>
            </div>
        </div>
    );
}
