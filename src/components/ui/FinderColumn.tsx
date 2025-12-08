"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Home, ChevronLeft } from "lucide-react";

interface MenuItem {
    id: string;
    name: string;
    type?: string;
    icon?: any;
    status?: string;
    data?: any;
}

interface ColumnProps {
    depth: number;
    items: MenuItem[];
    selectedId: string | null;
    onSelect: (item: MenuItem) => void;
    title: string;
    loading?: boolean;
}

const Column: React.FC<ColumnProps> = ({ depth, items = [], selectedId, onSelect, title }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to ensure latest panel is visible
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-shrink-0 w-80 lg:w-96 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl h-full flex flex-col hover:bg-white/80 dark:hover:bg-zinc-900/80 transition-colors"
        >
            <div className="h-12 flex-none px-4 flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {title}
                </h3>
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-mono">
                        {items?.length || 0}
                    </span>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
                {(items || []).map((item) => {
                    const isSelected = selectedId === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className={`
                w-full group flex items-center text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 border
                ${isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-transparent border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700'
                                }
              `}
                        >
                            <div className={`p-1.5 rounded-md mr-3 transition-colors ${isSelected ? 'bg-blue-500 text-blue-100' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                {Icon ? <Icon size={16} /> : <div className="w-4 h-4 bg-zinc-300 rounded" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="truncate font-medium">{item.name}</div>
                            </div>

                            <ChevronRight
                                size={16}
                                className={`flex-none ml-2 transition-transform ${isSelected ? 'text-white' : 'text-zinc-300 opacity-0 group-hover:opacity-100'}`}
                            />
                        </button>
                    );
                })}
                {(!items || items.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-32 text-zinc-400 text-sm italic">
                        <span>No items found</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export interface ExplorerItem {
    id: string;
    label: string,
    type: 'root' | 'category' | 'place' | 'spot' | 'timeframe';
    data: any,
}

export function ExplorerView({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-full overflow-x-auto overflow-y-hidden snap-x bg-zinc-50 dark:bg-zinc-950 scroll-smooth">
            {children}
            {/* Added padding at the end so the last column isn't stuck to the edge */}
            <div className="w-20 lg:w-40 flex-shrink-0" />
        </div>
    )
}

export { Column };
