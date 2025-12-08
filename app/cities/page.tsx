"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MapPin, Plus } from "lucide-react";
import { citiesData } from "@/lib/data";
import GovHeader from "@/components/gov/GovHeader";
import AnalysisView from "@/components/gov/AnalysisView";
import ArchitectureViz from "@/components/ArchitectureViz";

export default function CitiesPage() {
    const [isQuickAnalysisOpen, setIsQuickAnalysisOpen] = useState(false);

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 w-full h-full opacity-[0.02] dark:opacity-[0.03] pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <GovHeader
                title="Ministry of Defence"
                subtitle="Central Monitoring System"
                showBack={false} // Main dashboard
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <div className="mb-8 pl-1 border-l-4 border-orange-500">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 ml-4">
                            Monitored Regions
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-4">
                            Select a metropolitan area to access real-time infrastructure analytics.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(citiesData || []).map((city, index) => (
                            <Link href={`/cities/${city.id}`} key={city.id}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                                    className="group relative bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-all cursor-pointer h-full flex flex-col"
                                >
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />

                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
                                            <MapPin className="text-zinc-500 dark:text-zinc-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" size={24} />
                                        </div>
                                        <span className="text-xs font-mono text-zinc-400">ID: {city.id.toUpperCase()}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                        {city.name}
                                    </h3>

                                    

                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 flex-grow">
                                        {city.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-200">{city.sectors.length}</span>
                                            <span>Sectors</span>
                                        </div>
                                        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
                                        <div className="flex items-center gap-2 ml-auto text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                                            Access Dashboard
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Quick Analysis FAB */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsQuickAnalysisOpen(true)}
                className="fixed bottom-16 mr-8 right-8 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center group"
            >
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="absolute right-full mr-4 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Upload &amp; Analyze Audio
                </span>
            </motion.button>

            {/* Analysis Overlay */}
            <AnimatePresence>
                {isQuickAnalysisOpen && (
                    <AnalysisView
                        timeframe="Instant Analysis"
                        unitName="Custom Input Stream"
                        onClose={() => setIsQuickAnalysisOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Architecture Visualization */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12 mt-8">
                <div className="mb-8 pl-1 border-l-4 border-blue-500">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 ml-4">
                        System Architecture
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 ml-4">
                        Real-time data flow and processing pipeline visualization.
                    </p>
                </div>
                <ArchitectureViz />
            </div>

            {/* Footer */}
            <div className="w-full text-center py-8 border-t border-zinc-200 dark:border-zinc-800 mt-12 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <p className="text-xs text-zinc-500">
                    © 2024 Government of India. Secure Access System v2.0
                </p>
            </div>
        </div>
    );
}
