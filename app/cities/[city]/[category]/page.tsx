"use client";

import { motion, AnimatePresence } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, ChevronRight, Mic, CheckCircle2,
    X, Activity, Terminal, ShieldCheck, MapPin,
    Building2, ArrowRight, Server, Waves, Clock,
    PlayCircle, AlertTriangle, FileText, Calendar
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Mock Data
const getPlaces = (city: string, category: string) => {
    return [
        {
            id: 1,
            name: `${city} Main Hub`,
            status: "Active",
            type: "Infrastructure",
            sub: [
                { id: "t1", name: "Terminal 1", status: "Operational" },
                { id: "t2", name: "Terminal 2", status: "Operational" },
                { id: "ch", name: "Cargo Hold", status: "Restricted" }
            ]
        },
        {
            id: 2,
            name: `${category} Center East`,
            status: "Maintenance",
            type: "Logistics",
            sub: [
                { id: "g1", name: "Entry Gate A", status: "Warning" },
                { id: "sz", name: "Security Zone", status: "Active" },
                { id: "l1", name: "Lounge", status: "Active" }
            ]
        },
        {
            id: 3,
            name: `North ${city} Complex`,
            status: "Active",
            type: "Facility",
            sub: [
                { id: "mh", name: "Main Hall", status: "Active" },
                { id: "tc", name: "Ticket Counter", status: "Closed" },
                { id: "sa", name: "Staff Area", status: "Restricted" }
            ]
        },
    ];
};

const getTimeframes = () => {
    // Generate full 24-hour cycle
    return Array.from({ length: 24 }, (_, i) => {
        const start = i.toString().padStart(2, '0');
        const end = ((i + 1) % 24).toString().padStart(2, '0');
        // Randomize status for visual variety
        const states = ["analyzed", "pending", "processing", "analyzed", "analyzed"];
        const status = states[Math.floor(Math.random() * states.length)];

        return {
            id: `tf-${i}`,
            label: `${start}:00 - ${end}:00`,
            status: status === "processing" ? "pending" : status, // Simplified for initial state
            risk: status === "analyzed" ? (Math.random() > 0.8 ? "medium" : "low") : "unknown"
        };
    });
};

export default function CategoryDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params?.category as string;
    const cityId = params?.city as string;

    const [places, setPlaces] = useState<any[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [selectedSubItem, setSelectedSubItem] = useState<any>(null);

    // Analysis & Timeframe State
    const [timeframes, setTimeframes] = useState<any[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState<string | null>(null);
    const [analysisState, setAnalysisState] = useState<'idle' | 'processing' | 'done'>('idle');
    const [processingSteps, setProcessingSteps] = useState<number>(0);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cityId && categoryId) {
            setPlaces(getPlaces(cityId, categoryId));
        }
    }, [cityId, categoryId]);

    useEffect(() => {
        if (selectedSubItem) {
            setTimeframes(getTimeframes());
        }
    }, [selectedSubItem]);

    // Cleanup when deselecting
    useEffect(() => {
        if (!selectedSubItem) {
            setSelectedTimeframe(null);
            setAnalysisState('idle');
        }
    }, [selectedSubItem]);

    // Auto-scroll when opening new panels
    useEffect(() => {
        if (selectedPlace || selectedSubItem || selectedTimeframe) {
            setTimeout(() => {
                scrollContainerRef.current?.scrollTo({
                    left: scrollContainerRef.current.scrollWidth,
                    behavior: 'smooth'
                });
            }, 200);
        }
    }, [selectedPlace, selectedSubItem, selectedTimeframe]);

    const runAnalysis = (tfId: string) => {
        if (selectedTimeframe === tfId && analysisState === 'done') return;

        setSelectedTimeframe(tfId);
        setAnalysisState('processing');
        setProcessingSteps(0);

        const intervals = [
            setTimeout(() => setProcessingSteps(1), 800),
            setTimeout(() => setProcessingSteps(2), 1600),
            setTimeout(() => setProcessingSteps(3), 2400),
            setTimeout(() => setProcessingSteps(4), 3200),
            setTimeout(() => {
                setAnalysisState('done');
                setTimeframes(prev => prev.map(t => t.id === tfId ? { ...t, status: 'analyzed', risk: 'low' } : t));
            }, 4000),
        ];

        return () => intervals.forEach(clearTimeout);
    };

    return (
        <div className="flex flex-col h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50">

            {/* Top Bar */}
            <header className="flex-none h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center px-6 z-30 shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="mr-4 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 dark:text-zinc-400"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300 capitalize">{cityId}</span>
                    <ChevronRight size={14} className="text-zinc-400" />
                    <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{categoryId}</span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">System Active</span>
                    </div>
                </div>
            </header>

            {/* Horizontal Scroll "Blade" Container */}
            <main
                ref={scrollContainerRef}
                className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth p-6 gap-4 items-start"
            >
                {/* BLADE 1: SECTORS */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-none w-full md:w-[320px] snap-center h-full flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">
                            <Building2 className="text-zinc-400" size={16} />
                            Sectors
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {places.map((place) => (
                            <div
                                key={place.id}
                                onClick={() => {
                                    setSelectedPlace(place);
                                    setSelectedSubItem(null);
                                    setSelectedTimeframe(null);
                                    setAnalysisState('idle');
                                }}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                                    ${selectedPlace?.id === place.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ring-1 ring-blue-500/20'
                                        : 'bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    }
                                `}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${selectedPlace?.id === place.id ? 'bg-blue-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                    }`}>
                                    <MapPin size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-sm truncate ${selectedPlace?.id === place.id ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                        {place.name}
                                    </h3>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">{place.type}</span>
                                </div>
                                {selectedPlace?.id === place.id && <ChevronRight size={14} className="text-blue-500" />}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* BLADE 2: UNITS */}
                <AnimatePresence mode="popLayout">
                    {selectedPlace && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-none w-full md:w-[320px] snap-center h-full flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
                        >
                            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                                <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 uppercase tracking-wide">Units</h2>
                                <button onClick={() => setSelectedPlace(null)} className="text-zinc-400 hover:text-zinc-600 transition-colors"><X size={16} /></button>
                            </div>

                            <div className="p-3 overflow-y-auto flex-1 space-y-2">
                                {selectedPlace.sub.map((sub: any) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => {
                                            setSelectedSubItem(sub);
                                            setSelectedTimeframe(null);
                                            setAnalysisState('idle');
                                        }}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3
                                            ${selectedSubItem?.id === sub.id
                                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                                                : 'bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                            }
                                        `}
                                    >
                                        <div className={`p-2 rounded-lg ${selectedSubItem?.id === sub.id ? 'bg-zinc-700 dark:bg-zinc-200 text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                            <Server size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm">{sub.name}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                <div className={`text-[10px] uppercase tracking-wider font-semibold ${selectedSubItem?.id === sub.id ? 'opacity-80' : 'text-zinc-500'}`}>
                                                    {sub.status}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* BLADE 3: ANALYSIS CONSOLE (EXPANDING) */}
                <AnimatePresence mode="popLayout">
                    {selectedSubItem && (
                        <motion.div
                            initial={{ opacity: 0, x: 40, width: "380px" }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                width: selectedTimeframe ? "85vw" : "380px"
                            }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            className="flex-none snap-center h-full flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl"
                        >
                            {/* Header */}
                            <div className={`px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center flex-none`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wide">Audio Analysis</h2>
                                        <p className="text-xs text-zinc-500 font-medium">{selectedSubItem.name} • Live Stream</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedSubItem(null)} className="text-zinc-400 hover:text-zinc-600 transition-colors"><X size={18} /></button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 flex overflow-hidden">

                                {/* LEFT LIST (30%) - TIME FRAMES */}
                                <div className={`${selectedTimeframe ? 'w-[300px] border-r border-zinc-200 dark:border-zinc-800' : 'w-full'} flex flex-col bg-zinc-50/50 dark:bg-zinc-900/30 transition-all duration-500`}>
                                    <div className="p-4 flex-1 overflow-y-auto">
                                        <div className="flex items-center gap-2 mb-4 px-2">
                                            <Calendar size={14} className="text-zinc-400" />
                                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select Timeframe</h3>
                                        </div>
                                        <div className="space-y-1">
                                            {timeframes.map((tf) => (
                                                <button
                                                    key={tf.id}
                                                    onClick={() => runAnalysis(tf.id)}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm border transition-all ${selectedTimeframe === tf.id
                                                        ? 'bg-white dark:bg-zinc-800 border-blue-500 shadow-sm ring-1 ring-blue-500/20 z-10'
                                                        : 'bg-transparent border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                                                        }`}
                                                >
                                                    <span className={`font-mono text-xs font-medium ${selectedTimeframe === tf.id ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                        {tf.label}
                                                    </span>
                                                    {tf.status === 'analyzed' && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Cleared</span>
                                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                                        </div>
                                                    )}
                                                    {tf.status === 'pending' && <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT PANEL (70%) - PROCESSING & RESULTS */}
                                {selectedTimeframe && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex-1 bg-white dark:bg-zinc-900 relative flex flex-col min-w-0"
                                    >

                                        {/* PROCESSING STATE */}
                                        {analysisState === 'processing' && (
                                            <div className="flex-1 flex flex-col items-center justify-center p-12">
                                                <div className="w-full max-w-lg space-y-10">
                                                    <div className="text-center">
                                                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Processing Stream</h3>
                                                        <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-mono font-medium">
                                                            ID: {selectedTimeframe}
                                                        </span>
                                                    </div>

                                                    {/* Progress Steps */}
                                                    <div className="space-y-6">
                                                        {[
                                                            "Decomposing Audio Signal",
                                                            "Filtering Ambient Noise",
                                                            "Identifying Voice Patterns",
                                                            "Generating Final Report"
                                                        ].map((step, i) => (
                                                            <div key={i} className="flex items-center gap-5">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 flex-shrink-0 ${processingSteps > i + 1
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : processingSteps === i + 1
                                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                                                    }`}>
                                                                    {processingSteps > i + 1 ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{i + 1}</span>}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between mb-2">
                                                                        <span className={`text-sm font-medium transition-colors ${processingSteps === i + 1 ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>
                                                                            {step}
                                                                        </span>
                                                                    </div>
                                                                    <div className={`h-1.5 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800`}>
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: processingSteps > i ? "100%" : processingSteps === i ? "100%" : "0%" }}
                                                                            transition={{ duration: 0.5 }}
                                                                            className={`h-full ${processingSteps > i + 1 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* RESULTS STATE */}
                                        {analysisState === 'done' && (
                                            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-8 border-b border-zinc-200 dark:border-zinc-800">
                                                    <div>
                                                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 tracking-tight">Analysis Report</h2>
                                                        <p className="text-zinc-500 text-sm">
                                                            Timeframe: <span className="font-mono font-medium text-zinc-900 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded ml-1">{timeframes.find(t => t.id === selectedTimeframe)?.label}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-5 py-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                                        <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm">
                                                            <ShieldCheck size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Status</div>
                                                            <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100 leading-none">CLEARED</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                                    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
                                                        <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
                                                            <Activity size={20} />
                                                            <span className="text-xs font-bold uppercase tracking-wider">Noise Floor</span>
                                                        </div>
                                                        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">12dB</div>
                                                        <div className="text-xs text-zinc-500 mt-1 font-medium">Optimal Range</div>
                                                    </div>
                                                    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
                                                        <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
                                                            <Waves size={20} />
                                                            <span className="text-xs font-bold uppercase tracking-wider">Clarity</span>
                                                        </div>
                                                        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">99.8%</div>
                                                        <div className="text-xs text-zinc-500 mt-1 font-medium">High Fidelity</div>
                                                    </div>
                                                    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
                                                        <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                                                            <ShieldCheck size={20} />
                                                            <span className="text-xs font-bold uppercase tracking-wider">Threats</span>
                                                        </div>
                                                        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">0</div>
                                                        <div className="text-xs text-zinc-500 mt-1 font-medium">None Detected</div>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                                    <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                                                        <FileText size={16} className="text-zinc-400" />
                                                        <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                                            Transcript Log
                                                        </h4>
                                                    </div>
                                                    <div className="p-6 bg-white dark:bg-zinc-950/50">
                                                        <div className="font-mono text-sm space-y-3 text-zinc-600 dark:text-zinc-400">
                                                            <p><span className="text-blue-500/70 select-none mr-3">[00:15]</span> Background ambience nominal.</p>
                                                            <p><span className="text-blue-500/70 select-none mr-3">[00:22]</span> Automated announcement: "Security check active at Gate B."</p>
                                                            <p><span className="text-blue-500/70 select-none mr-3">[00:45]</span> <span className="text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1 rounded">Pattern match [Industrial_Fan_Loop]</span> detected - Filtered.</p>
                                                            <p><span className="text-emerald-500/70 select-none mr-3">[00:58]</span> Segment end. No anomalous audio signatures identified.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom Action Bar */}
                                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex justify-end gap-3 flex-none backdrop-blur-sm">
                                            <button className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-transparent transition-colors">Download Raw Audio</button>
                                            <button className="px-4 py-2 rounded-lg text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-500/10 hover:opacity-90 transition-opacity">Export Full Report</button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
