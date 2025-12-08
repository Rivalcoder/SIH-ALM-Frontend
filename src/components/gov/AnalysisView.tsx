"use client";

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldCheck, Activity, Waves, FileText, ChevronRight, Download, Share2, X } from "lucide-react";
import { useState, useEffect } from "react";

interface AnalysisViewProps {
    timeframe: string;
    onClose: () => void;
    unitName: string;
}

export default function AnalysisView({ timeframe, onClose, unitName }: AnalysisViewProps) {
    const [status, setStatus] = useState<'processing' | 'done'>('processing');
    const [step, setStep] = useState(0);

    // Processing Simulation
    useEffect(() => {
        if (status === 'processing') {
            const steps = [
                setTimeout(() => setStep(1), 1000),
                setTimeout(() => setStep(2), 2000),
                setTimeout(() => setStep(3), 3000),
                setTimeout(() => setStatus('done'), 4500),
            ];
            return () => steps.forEach(clearTimeout);
        }
    }, [status]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white dark:bg-zinc-950 z-[60] flex flex-col md:flex-row"
        >
            {/* Left Sidebar (Meta Info) */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-600" size={24} />
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Analysis Console</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Target Unit</label>
                        <div className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 border-l-2 border-blue-500 pl-3">
                            {unitName}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Timeframe</label>
                        <div className="font-mono text-sm bg-white dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-md p-2 text-zinc-600 dark:text-zinc-400">
                            {timeframe}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-4">Live Status</label>
                        <div className="space-y-4">
                            {[
                                "Signal Decomposition",
                                "Noise Filtering",
                                "Voice Pattern Matching",
                                "Threat Prob. Calc"
                            ].map((label, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${step > i ? 'bg-green-500' : step === i ? 'bg-blue-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                                    <span className={`text-sm transition-colors ${step === i ? 'font-semibold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>{label}</span>
                                    {step > i && <CheckCircle2 size={14} className="text-green-500 ml-auto" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {status === 'processing' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-grid-zinc-200/50 dark:bg-grid-zinc-800/20 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                            <Waves size={64} className="text-blue-600 dark:text-blue-400 relative z-10 animate-bounce-slow" />
                        </div>
                        <h2 className="mt-8 text-2xl font-light text-zinc-600 dark:text-zinc-300">
                            Analyzing Audio Stream...
                        </h2>
                        <div className="w-64 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-6 overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-600"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 4.5, ease: "linear" }}
                            />
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 overflow-y-auto p-8 lg:p-12"
                    >
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-2xl p-6 mb-8 flex items-center gap-4">
                                <div className="p-3 bg-green-500 rounded-full shadow-lg shadow-green-500/20 text-white">
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-green-800 dark:text-green-400">Security Clearance Granted</h2>
                                    <p className="text-sm text-green-700 dark:text-green-500">No anomalous patterns detected in this sector.</p>
                                </div>
                                <div className="ml-auto text-4xl font-black text-green-200 dark:text-green-900 select-none">SAFE</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <MetricCard label="Noise Floor" value="-72dB" sub="Optimal" />
                                <MetricCard label="Voice Clarity" value="98.2%" sub="High Fidelity" />
                                <MetricCard label="Active Sources" value="12" sub="Identified" />
                            </div>

                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-8 shadow-sm">
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                                    <FileText size={16} className="text-zinc-500" />
                                    <span className="text-xs font-bold uppercase text-zinc-500">Transcript Log</span>
                                </div>
                                <div className="p-6 font-mono text-sm space-y-3 text-zinc-600 dark:text-zinc-400">
                                    <p><span className="text-blue-500">[00:05]</span> Ambience check initiated.</p>
                                    <p><span className="text-blue-500">[00:12]</span> Speaker A: "Check complete for Zone 1."</p>
                                    <p><span className="text-blue-500">[00:15]</span> <span className="text-orange-500 ml-2"># FILTER_APPLIED: MECHANICAL_HUM</span></p>
                                    <p><span className="text-blue-500">[00:22]</span> Analysis complete. Signature match: 99%.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 justify-end">
                                <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    <Download size={16} />
                                    Export RAW
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                                    <Share2 size={16} />
                                    Share Report
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

function MetricCard({ label, value, sub }: { label: string, value: string, sub: string }) {
    return (
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
            <div className="text-xs font-bold uppercase text-zinc-400 mb-2">{label}</div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{value}</div>
            <div className="text-xs text-blue-500 font-medium">{sub}</div>
        </div>
    );
}
