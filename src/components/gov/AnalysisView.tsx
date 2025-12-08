"use client";

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldCheck, Activity, Waves, FileText, ChevronRight, Download, Share2, X, AlertTriangle, MessageSquare, Send, Mic2, Speaker, BarChart3, Pause, Clock, Zap, User, Fingerprint, Layers, Maximize2, Minimize2, Lock, GripHorizontal, ChevronUp, RefreshCw, Trash2, Shield, Key } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { processAudio, chatAboutAudio, deleteSession } from "@/services/api/client";
import { ProcessAudioResponse, ChatResponse } from "@/services/api/types";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface AnalysisViewProps {
    timeframe: string;
    onClose: () => void;
    unitName: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalysisView({ timeframe, onClose, unitName }: AnalysisViewProps) {
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
    const [analysisData, setAnalysisData] = useState<ProcessAudioResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");

    // Chat state
    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [isChatting, setIsChatting] = useState(false);
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Load cache on mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem('alm_analysis_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                setAnalysisData(parsed);
                setStatus('done');
            }
        } catch (e) {
            console.error("Failed to load cached analysis", e);
        }
    }, []);

    // Save cache on update
    useEffect(() => {
        if (analysisData) {
            localStorage.setItem('alm_analysis_cache', JSON.stringify(analysisData));
        }
    }, [analysisData]);

    const clearCache = () => {
        localStorage.removeItem('alm_analysis_cache');
        setAnalysisData(null);
        setStatus('idle');
    }

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isChatWindowOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('uploading');
        try {
            const rawData = await processAudio(file);
            console.log("Raw API Response:", rawData);

            // Backend might send just the results object, so we need to wrap it
            let data: ProcessAudioResponse;
            if (rawData.results) {
                // Already in ProcessAudioResponse format
                data = rawData as ProcessAudioResponse;
            } else {
                // Handle the specific structure returned by the user's backend (root level fields)
                if (rawData.audio && rawData.transcription) {
                    data = {
                        ...rawData,
                        // Try to find session_id in rawData, otherwise fallback
                        session_id: rawData.session_id || "default"
                    } as unknown as ProcessAudioResponse;
                } else {
                    data = {
                        session_id: `session-${Date.now()}`,
                        filename: file.name,
                        results: rawData as any
                    };
                }
            }

            console.log("Processed API Response:", data);
            setAnalysisData(data);
            setStatus('done');
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Failed to process audio");
            setStatus('error');
        }
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !analysisData) return;

        const question = chatInput;
        setChatInput("");
        setChatHistory(prev => [...prev, { role: 'user', content: question }]);
        setIsChatting(true);

        try {
            // Use session_id from analysisData, or formatted date if missing, or "default"
            // This ensures we pass *something* that might match what the backend expects if it's stateful
            const sessionId = analysisData.session_id || "default";
            console.log("Sending chat with session_id:", sessionId);

            const response = await chatAboutAudio(sessionId, question);
            setChatHistory(prev => [...prev, { role: 'assistant', content: response.answer }]);
        } catch (err) {
            console.error("Chat error:", err);
            setChatHistory(prev => [...prev, { role: 'assistant', content: "Error: Failed to get response. Please check backend connection." }]);
        } finally {
            setIsChatting(false);
        }
    };

    // Helper to safely access data whether it's at root or nested in results
    const safeData = analysisData ? (analysisData.transcription ? analysisData : (analysisData as any).results) : null;

    // Data prep for charts
    const emotionData = safeData?.paralinguistics?.emotion?.all_emotions
        ? Object.entries(safeData.paralinguistics.emotion.all_emotions).map(([name, value]) => ({ name, value: value as number }))
        : [];

    // Sort emotion data to show top ones
    emotionData.sort((a, b) => b.value - a.value);

    // Audio events data prep
    const eventData = safeData?.audio_events?.events
        ? safeData.audio_events.events.slice(0, 10).map((e: any) => ({
            name: e.label,
            value: (e.probability * 100).toFixed(1),
            raw: e.probability
        }))
        : [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white dark:bg-zinc-950 z-[60] flex flex-col md:flex-row font-sans selection:bg-blue-100 dark:selection:bg-blue-900/40"
        >
            {/* Left Sidebar (Meta Info) */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col h-full relative z-20">
                {/* Header */}
                <div className="p-6 pb-4 flex justify-between items-center flex-none">
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-600" size={24} />
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Analysis Console</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                {/* Scrollable Info Section */}
                <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6 min-h-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Target Unit</label>
                            <div className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 border-l-2 border-blue-500 pl-3">
                                {unitName}
                            </div>
                        </div>
                        {status === 'done' && (
                            <button onClick={clearCache} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors" title="Clear Cache">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Timeframe</label>
                        <div className="font-mono text-sm bg-white dark:bg-black/20 border border-zinc-200 dark:border-zinc-800 rounded-md p-2 text-zinc-600 dark:text-zinc-400">
                            {timeframe}
                        </div>
                    </div>

                    {safeData && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Primary Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white dark:bg-black/20 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><User size={12} /> Gender</div>
                                    <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200 capitalize">
                                        {safeData.paralinguistics?.gender?.gender || 'Unknown'}
                                        <span className="text-xs font-normal text-zinc-400 ml-1">
                                            {safeData.paralinguistics?.gender?.confidence ? `(${(safeData.paralinguistics.gender.confidence * 100).toFixed(0)}%)` : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white dark:bg-black/20 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Mic2 size={12} /> Speakers</div>
                                    <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                                        {safeData.diarization?.num_speakers || 0}
                                    </div>
                                </div>
                                <div className="p-3 bg-white dark:bg-black/20 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Zap size={12} /> Energy</div>
                                    <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                                        {safeData.paralinguistics?.energy?.energy_db || '0'} dB
                                    </div>
                                </div>
                                <div className="p-3 bg-white dark:bg-black/20 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Pause size={12} /> Pauses</div>
                                    <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                                        {safeData.paralinguistics?.pauses?.num_pauses || '0'}
                                    </div>
                                </div>
                            </div>

                            {/* Emotion Chart */}
                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-4">Emotional Tone</label>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={emotionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {emotionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px' }}
                                                itemStyle={{ color: '#e4e4e7' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center mt-2">
                                    {emotionData.slice(0, 3).map((entry, index) => (
                                        <div key={index} className="flex items-center gap-1 text-xs text-zinc-500">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                            {entry.name}: {(entry.value * 100).toFixed(0)}%
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Footer: Ask AI Trigger */}
                {status === 'done' && (
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50">
                        <button
                            onClick={() => setIsChatWindowOpen(true)}
                            className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 rounded-xl p-4 flex items-center justify-between border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                                    <Lock size={20} className="text-blue-500 dark:text-blue-400 group-hover:text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Secure Analysis</div>
                                    <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                                        <ShieldCheck size={10} className="text-emerald-500" />
                                        Encrypted Channel Ready
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-zinc-950">
                {status === 'idle' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 border-dashed border-2 border-zinc-200 dark:border-zinc-800 m-8 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                        <Waves size={64} className="text-zinc-300 dark:text-zinc-700 mb-6" />
                        <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Upload Audio Stream</h2>
                        <p className="text-zinc-500 mb-6 text-center max-w-sm">Upload a .wav or .mp3 file to initiate advanced signal processing and threat detection.</p>
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                            <Download size={18} className="rotate-180" />
                            Select Audio File
                            <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>
                )}

                {(status === 'uploading' || status === 'processing') && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                            <Activity size={64} className="text-blue-600 dark:text-blue-400 relative z-10 animate-bounce" />
                        </div>
                        <h2 className="mt-8 text-2xl font-light text-zinc-600 dark:text-zinc-300 animate-pulse">
                            Processing Signal...
                        </h2>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <AlertTriangle size={64} className="text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Analysis Failed</h2>
                        <p className="text-zinc-500 mt-2 max-w-md text-center">{errorMsg}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-6 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {status === 'done' && safeData && (
                    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                        {/* Results Scroll Area: Full Height now */}
                        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 scroll-smooth pb-32">

                            {/* Translation & Original Text Split */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-6"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">English Translation</h3>
                                    </div>
                                    <p className="text-emerald-900 dark:text-emerald-200 text-lg leading-relaxed font-serif italic">
                                        "{safeData.transcription?.english_translation || "Translation unavailable."}"
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Original Transcript</h3>
                                        <span className="text-xs font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">
                                            {safeData.transcription?.detected_language || 'unknown'} ({safeData.transcription?.language_confidence ? (safeData.transcription.language_confidence * 100).toFixed(0) : 'NaN'}%)
                                        </span>
                                    </div>
                                    <p className="text-zinc-600 dark:text-zinc-300 text-sm font-mono whitespace-pre-wrap">
                                        {safeData.transcription?.original_text || 'No transcript available'}
                                    </p>
                                </motion.div>
                            </div>

                            {/* Speaker Segments Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-4"
                            >
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Speaker Segments</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {(!(safeData.diarization_with_text?.segments || safeData.diarization?.segments) || (safeData.diarization_with_text?.segments || safeData.diarization?.segments).length === 0) ? (
                                        <div className="p-8 text-center text-zinc-400 text-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                            No distinct speaker segments identified.
                                        </div>
                                    ) : (
                                        (safeData.diarization_with_text?.segments || safeData.diarization?.segments).map((seg: any, i: number) => (
                                            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                                                    <span className="font-mono text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                                        {typeof seg.start === 'number' ? seg.start.toFixed(2) : '0.00'}s
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-zinc-400">
                                                            {typeof seg.duration === 'number' ? seg.duration.toFixed(2) : (seg.end - seg.start).toFixed(2)}s duration
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                                                        {seg.speaker}
                                                    </span>
                                                </div>
                                                <p className="text-zinc-700 dark:text-zinc-300 text-sm font-medium leading-relaxed" dir="auto">
                                                    {seg.text || <span className="italic text-zinc-300">No text detected</span>}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                            {/* Background Events Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800"
                            >
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Detected Background Events</h3>

                                {/* Refined Events Visualization */}
                                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row gap-8">
                                    {/* Horizontal Bars with proper labelling */}
                                    <div className="flex-1 flex flex-col gap-4">
                                        {eventData.slice(0, 5).map((ev, i) => (
                                            <div key={i} className="w-full">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{ev.name}</span>
                                                    <span className="text-xs font-mono text-zinc-400">{ev.value}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${ev.value}%` }}
                                                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Small Radar or Summary for diversity */}
                                    <div className="w-full lg:w-1/3 flex flex-col justify-center items-center border-l border-zinc-200 dark:border-zinc-800 pl-0 lg:pl-8">
                                        <Layers size={32} className="text-zinc-300 dark:text-zinc-700 mb-2" />
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{eventData.length}</div>
                                            <div className="text-xs text-zinc-500 uppercase tracking-wide">Events Detected</div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                                            {eventData.slice(0, 3).map((ev, i) => (
                                                <span key={i} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] text-zinc-500">
                                                    {ev.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            {/* Side Drawer Chat Window - 60% Width */}
            <AnimatePresence>
                {isChatWindowOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[60%] lg:w-[50%] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                                    <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Secure Internal Communication</h3>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                                        <Lock size={10} />
                                        <span>End-to-End Encrypted (AES-256)</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsChatWindowOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-zinc-950 relative">
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                <ShieldCheck size={300} />
                            </div>

                            {chatHistory.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-sm gap-4 relative z-10">
                                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                                        <Key size={32} className="text-zinc-400 dark:text-zinc-500" />
                                    </div>
                                    <div className="text-center max-w-xs">
                                        <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Encrypted Analysis Channel</h4>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                                            This session is secured with military-grade encryption. You can discuss sensitive audio details here.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <div className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-lg text-center">
                                            Identified Speakers
                                        </div>
                                        <div className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-lg text-center">
                                            Threat Assessment
                                        </div>
                                        <div className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-lg text-center">
                                            Keyword Search
                                        </div>
                                        <div className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 rounded-lg text-center">
                                            Translation
                                        </div>
                                    </div>
                                </div>
                            )}

                            {chatHistory.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
                                >
                                    <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`rounded-2xl px-5 py-3 text-sm shadow-sm ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                        {msg.role === 'assistant' && (
                                            <div className="flex items-center gap-1 mt-1 ml-2">
                                                <ShieldCheck size={10} className="text-emerald-500" />
                                                <span className="text-[10px] text-zinc-400 font-mono">Verified Source</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {isChatting && (
                                <div className="flex justify-start relative z-10">
                                    <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100" />
                                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Drawer Input */}
                        <form onSubmit={handleChatSubmit} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type secure message..."
                                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-zinc-400 shadow-sm"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || isChatting}
                                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-md flex items-center justify-center"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
