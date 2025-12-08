"use client";

import { motion, AnimatePresence } from "motion/react";
import { Activity, Waves, Download, X, AlertTriangle, Trash2, User, Mic2, Zap, Pause, FileText, MessageSquare, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { processAudio } from "@/services/api/client";
import { ProcessAudioResponse as ServicesProcessAudioResponse } from "@/services/api/types";
import { ProcessAudioResponse as LibProcessAudioResponse } from "@/lib/api/types";
import { mapApiResponseToDatasetSample } from "@/lib/api/mapper";
import { DatasetSample } from "@/lib/datasetSamples";
import { OverviewTabNoGemini } from "./tabs/OverviewTabNoGemini";
import { InsightsTabNoGemini } from "./tabs/InsightsTabNoGemini";
import { VisualizationsTab } from "@/components/analyze/tabs/VisualizationsTab";
import { TranscriptView } from "@/components/analyze/TranscriptView";
import { ChatInterface } from "@/components/analyze/ChatInterface";
import { ChatMessage } from "@/lib/analyzeTypes";
import { chatAboutAudio, chatWithAudioAnalysis } from "@/services/api/client";
import { cn } from "@/lib/utils";

interface AnalysisViewProps {
    timeframe: string;
    onClose: () => void;
    unitName: string;
}

// Adapter function to convert services API response to lib API response format
function adaptToLibFormat(data: ServicesProcessAudioResponse | any): LibProcessAudioResponse {
    // If already in lib format, return as is
    if (data.results && data.session_id && data.filename) {
        return data as LibProcessAudioResponse;
    }
    
    // If data has root-level fields (old format), wrap them
    if (data.audio && data.transcription) {
        return {
            session_id: data.session_id || `session-${Date.now()}`,
            filename: data.filename || "unknown",
            results: {
                audio: data.audio,
                transcription: data.transcription,
                diarization: data.diarization || { num_speakers: 0, segments: [] },
                diarization_with_text: data.diarization_with_text || { num_speakers: 0, segments: [] },
                paralinguistics: data.paralinguistics || {},
                audio_events: data.audio_events || { top_k: 0, events: [] },
            }
        };
    }
    
    // Fallback: wrap everything in results
    return {
        session_id: data.session_id || `session-${Date.now()}`,
        filename: data.filename || "unknown",
        results: data
    };
}

export default function AnalysisView({ timeframe, onClose, unitName }: AnalysisViewProps) {
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
    const [analysisData, setAnalysisData] = useState<ServicesProcessAudioResponse | any>(null);
    const [datasetSample, setDatasetSample] = useState<DatasetSample | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>("overview");
    const [translatedTranscript, setTranslatedTranscript] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState<string>("Original");
    const [showDiarization, setShowDiarization] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Helper to safely access data whether it's at root or nested in results
    const safeData = analysisData ? (analysisData.transcription ? analysisData : (analysisData as any).results) : null;

    // Load cache on mount
    useEffect(() => {
        try {
            const cached = localStorage.getItem('alm_analysis_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                setAnalysisData(parsed);
                // Convert to DatasetSample format
                try {
                    const adapted = adaptToLibFormat(parsed);
                    const mapped = mapApiResponseToDatasetSample(adapted, adapted.filename || "cached_file");
                    setDatasetSample(mapped);
                    setStatus('done');
                } catch (e) {
                    console.error("Failed to map cached data", e);
                    setStatus('done');
                }
            }
        } catch (e) {
            console.error("Failed to load cached analysis", e);
        }
    }, []);

    // Auto-load random audio file if not Custom mode
    useEffect(() => {
        const isCustom = unitName === "Custom Input Stream";
        
        if (!isCustom && status === 'idle' && !analysisData) {
            // Auto-load random audio file
            const loadRandomAudio = async () => {
                try {
                    setStatus('uploading');
                    
                    // List of available audio files
                    const audioFiles = [
                        'audio_000001.wav',
                        'audio_000002.wav',
                        'audio_000003.wav',
                        'audio_000004.wav',
                        'audio_000005.wav',
                        'audio_000006.wav',
                        'audio_000009.wav',
                        'mixed_000007.wav',
                        'mixed_000008.wav'
                    ];
                    
                    // Randomly select an audio file
                    const randomIndex = Math.floor(Math.random() * audioFiles.length);
                    const selectedFile = audioFiles[randomIndex];
                    console.log(`[Non-Custom Mode] Auto-loading random audio file: ${selectedFile}`);
                    
                    // Fetch the audio file
                    const audioUrl = `/audios/${selectedFile}`;
                    const response = await fetch(audioUrl);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch audio file: ${selectedFile}`);
                    }
                    
                    const audioBlob = await response.blob();
                    const audioFile = new File([audioBlob], selectedFile, { type: 'audio/wav' });
                    
                    // Process the audio file
                    const rawData = await processAudio(audioFile);
                    console.log("Raw API Response:", rawData);

                    // Store the raw data
                    setAnalysisData(rawData);
                    
                    // Adapt to lib format and convert to DatasetSample format
                    const adapted = adaptToLibFormat(rawData);
                    const mapped = mapApiResponseToDatasetSample(adapted, audioFile.name);
                    setDatasetSample(mapped);
                    setStatus('done');
                } catch (err: any) {
                    console.error("Auto-load audio failed:", err);
                    setErrorMsg(err.message || "Failed to auto-load audio file");
                    setStatus('error');
                }
            };
            
            loadRandomAudio();
        }
    }, [unitName, status, analysisData]);

    // Save cache on update
    useEffect(() => {
        if (analysisData) {
            localStorage.setItem('alm_analysis_cache', JSON.stringify(analysisData));
        }
    }, [analysisData]);

    const clearCache = () => {
        localStorage.removeItem('alm_analysis_cache');
        setAnalysisData(null);
        setDatasetSample(null);
        setStatus('idle');
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus('uploading');
        try {
            const rawData = await processAudio(file);
            console.log("Raw API Response:", rawData);

            // Store the raw data
            setAnalysisData(rawData);
            
            // Adapt to lib format and convert to DatasetSample format
            const adapted = adaptToLibFormat(rawData);
            const mapped = mapApiResponseToDatasetSample(adapted, file.name);
            setDatasetSample(mapped);
            setStatus('done');
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Failed to process audio");
            setStatus('error');
        }
    };

    const handleLanguageChange = async (lang: string) => {
        setTargetLanguage(lang);
        if (lang === "Original" || !datasetSample?.transcription) {
            setTranslatedTranscript(null);
            return;
        }
        // Translation disabled (no Gemini)
        setTranslatedTranscript(null);
    };

    // Navigation tabs
    const tabs = [
        { id: "overview", label: "Overview", icon: Activity },
        { id: "transcript", label: "Transcript", icon: Waves },
        { id: "insights", label: "Insights", icon: Activity },
        { id: "visualizations", label: "Charts", icon: Activity },
        { id: "chat", label: "Chat", icon: MessageSquare },
    ];

    const handleChatSubmit = async (message: string) => {
        if (!message.trim() || isChatLoading || !analysisData) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: message,
            timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, userMessage]);
        setIsChatLoading(true);

        try {
            // System instruction for the AI assistant
            const systemInstruction = `You are an AI assistant specialized in analyzing audio transcriptions and providing insights. 
You have access to detailed audio analysis data including:
- Transcription (original and English translation)
- Speaker diarization with timestamps
- Emotion analysis and confidence scores
- Paralinguistic features (gender, pauses, energy levels)
- Audio events classification

Provide clear, concise, and helpful responses based on the audio analysis data provided. Focus on actionable insights and explain the technical aspects in an accessible way.`;

            // Send full audio processed response along with the prompt
            const chatResponse = await chatWithAudioAnalysis(
                analysisData, // Full audio processed response
                message, // User's prompt/question
                systemInstruction // System instructions
            );

            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: chatResponse.answer || "I apologize, but I couldn't generate a response. Please try again.",
                timestamp: new Date(),
            };

            setChatMessages((prev) => [...prev, aiResponse]);
        } catch (error) {
            console.error("Chat request failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to get AI response";
            
            const errorResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
                timestamp: new Date(),
            };

            setChatMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white dark:bg-zinc-950 z-[60] flex flex-col md:flex-row font-sans"
        >
            {/* Left Sidebar (Meta Info + Navigation) */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col h-full relative z-20">
                {/* Header */}
                <div className="p-6 pb-4 flex justify-between items-center flex-none border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-600" size={24} />
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Analysis Console</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                {/* Scrollable Info Section */}
                <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6 min-h-0">
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

                    {/* Navigation Tabs */}
                    {status === 'done' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-3">Navigation</label>
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                                            activeTab === tab.id
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "bg-white dark:bg-black/20 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                                        )}
                                    >
                                        <Icon size={18} className={activeTab === tab.id ? "text-white" : "text-zinc-500"} />
                                        <span className="font-medium text-sm">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-zinc-950">
                {status === 'idle' && unitName === "Custom Input Stream" && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 border-dashed border-2 border-zinc-200 dark:border-zinc-800 m-8 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                        <Waves size={64} className="text-zinc-300 dark:text-zinc-700 mb-6" />
                        <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Upload Audio Stream</h2>
                        <p className="text-zinc-500 mb-6 text-center max-w-sm">Upload a .wav or .mp3 file to initiate advanced signal processing and analysis.</p>
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
                            Processing Audio File...
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

                {status === 'done' && datasetSample && (
                    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                        {/* Encrypted Lock Icon - Bottom Right Floating */}
                        <div className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-10 group">
                            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg shadow-lg border-2 border-green-500 dark:border-green-400 cursor-pointer transition-all hover:bg-green-100 dark:hover:bg-green-900/30 hover:shadow-xl">
                                <Lock size={18} className="text-green-600 dark:text-green-400" />
                                <span className="text-xs font-medium text-green-700 dark:text-green-300">Encrypted</span>
                            </div>
                            {/* Tooltip on Hover */}
                            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                <div className="bg-green-600 dark:bg-green-500 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                    End to End Encrypted
                                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600 dark:border-t-green-500"></div>
                                </div>
                            </div>
                        </div>
                        {/* Results Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 scroll-smooth pb-32">
                            <AnimatePresence mode="wait">
                                {activeTab === "overview" && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="pt-4"
                                    >
                                        <OverviewTabNoGemini analysis={datasetSample} safeData={safeData} />
                                    </motion.div>
                                )}

                                {activeTab === "transcript" && safeData && (
                                    <motion.div
                                        key="transcript"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="space-y-6 pt-4"
                                    >
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
                                    </motion.div>
                                )}

                                {activeTab === "insights" && (
                                    <motion.div
                                        key="insights"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="pt-4"
                                    >
                                        <InsightsTabNoGemini analysis={datasetSample} />
                                    </motion.div>
                                )}

                                {activeTab === "visualizations" && (
                                    <motion.div
                                        key="visualizations"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="w-full pt-4"
                                    >
                                        <VisualizationsTab analysis={datasetSample} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat Drawer - Slides in from right side */}
            <AnimatePresence>
                {activeTab === "chat" && status === 'done' && (
                    <>
                        {/* Background Overlay with Shadow */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"
                            onClick={() => setActiveTab("overview")}
                        />
                        
                        {/* Chat Panel - 60% width from right */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 right-0 w-full md:w-[60%] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-[70] flex flex-col"
                        >
                            {/* Enhanced AI Assistant Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-800 border-b-2 border-indigo-200/50 dark:border-zinc-700/50 backdrop-blur-sm shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 0.5 }}
                                        className="relative"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                opacity: [0.3, 0.5, 0.3],
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-lg"
                                        />
                                        <div className="relative p-3 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 shadow-xl border-2 border-white/20">
                                            <MessageSquare size={24} className="text-white" />
                                        </div>
                                    </motion.div>
                                    <div>
                                        <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            AI Assistant
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                                            Ask questions about your analysis
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => setActiveTab("overview")}
                                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                                >
                                    <X size={20} />
                                </motion.button>
                            </motion.div>

                            {/* Chat Content - Full Height */}
                            <div className="flex-1 overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-900/30">
                                <ChatInterface
                                    messages={chatMessages}
                                    isLoading={isChatLoading}
                                    onSubmit={handleChatSubmit}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
