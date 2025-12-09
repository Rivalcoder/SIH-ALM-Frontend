"use client";

import { motion, AnimatePresence } from "motion/react";
import { Activity, Waves, Download, X, AlertTriangle, Trash2, User, Mic2, Zap, Pause, FileText, MessageSquare, Lock, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { processAudio } from "@/services/api/client";
import { ProcessAudioResponse as ServicesProcessAudioResponse } from "@/services/api/types";
import { ProcessAudioResponse as LibProcessAudioResponse } from "@/lib/api/types";
import { mapApiResponseToDatasetSample } from "@/lib/api/mapper";
import { generateDummyAudioResponse } from "@/lib/api/dummyData";
import { DatasetSample } from "@/lib/datasetSamples";
import { OverviewTabNoGemini } from "./tabs/OverviewTabNoGemini";

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
    
    // Audio playback state
    const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
    const [currentAudioFileName, setCurrentAudioFileName] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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
                    setCurrentAudioUrl(audioUrl); // Store the audio URL for playback
                    setCurrentAudioFileName(selectedFile); // Store the filename for display
                    const response = await fetch(audioUrl);

                    if (!response.ok) {
                        throw new Error(`Failed to fetch audio file: ${selectedFile}`);
                    }

                    const audioBlob = await response.blob();
                    const audioFile = new File([audioBlob], selectedFile, { type: 'audio/wav' });

                    // Process the audio file
                    let rawData;
                    try {
                        rawData = await processAudio(audioFile);
                        console.log("Raw API Response:", rawData);
                    } catch (err: any) {
                        console.error("Auto-load audio failed:", err);
                        const errorMessage = err instanceof Error ? err.message : String(err);
                        const errorString = String(err);
                        
                        // Check if all API endpoints failed
                        const isApiFailure = 
                            errorMessage.includes("All API endpoints failed") ||
                            errorMessage.includes("All API endpoints") ||
                            errorMessage.includes("Failed to fetch") ||
                            errorMessage.includes("NetworkError") ||
                            errorMessage.includes("Network error") ||
                            errorMessage.includes("fetch failed") ||
                            errorMessage.includes("ERR_NETWORK") ||
                            errorMessage.includes("ERR_CONNECTION") ||
                            errorMessage.includes("ERR_FAILED") ||
                            errorString.includes("192.168.9.219") ||
                            errorString.includes("192.168.15.183") ||
                            errorString.includes("process-audio");
                        
                        if (isApiFailure) {
                            console.error("All API endpoints failed. Skipping dummy load.");
                            setErrorMsg("API unavailable. Please start the backend server and retry.");
                            setStatus('error');
                            return;
                        }
                        throw err;
                    }

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
        if (analysisData && !(datasetSample as any)?.is_placeholder) {
            localStorage.setItem('alm_analysis_cache', JSON.stringify(analysisData));
        }
    }, [analysisData, datasetSample]);

    const clearCache = () => {
        localStorage.removeItem('alm_analysis_cache');
        setAnalysisData(null);
        setDatasetSample(null);
        setStatus('idle');
    }

    // Handle audio playback
    const handlePlayPause = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (!currentAudioUrl) {
            console.warn('No audio URL available');
            return;
        }

        try {
            if (!audioPlayerRef.current) {
                audioPlayerRef.current = new Audio(currentAudioUrl);
                
                audioPlayerRef.current.addEventListener('ended', () => {
                    setIsPlaying(false);
                });
                
                audioPlayerRef.current.addEventListener('pause', () => {
                    setIsPlaying(false);
                });
                
                audioPlayerRef.current.addEventListener('play', () => {
                    setIsPlaying(true);
                });

                audioPlayerRef.current.addEventListener('error', (error) => {
                    console.error('Audio playback error:', error);
                    setIsPlaying(false);
                });
            }

            if (isPlaying && audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                setIsPlaying(false);
            } else if (audioPlayerRef.current) {
                audioPlayerRef.current.play().catch((error) => {
                    console.error('Failed to play audio:', error);
                    setIsPlaying(false);
                });
            }
        } catch (error) {
            console.error('Error in handlePlayPause:', error);
            setIsPlaying(false);
        }
    };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current = null;
            }
        };
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create object URL for uploaded file
        const audioUrl = URL.createObjectURL(file);
        setCurrentAudioUrl(audioUrl);
        setCurrentAudioFileName(file.name);

        setStatus('uploading');
        try {
            let rawData;
            try {
                rawData = await processAudio(file);
                console.log("Raw API Response:", rawData);
            } catch (err: any) {
                console.error("Audio processing failed:", err);
                const errorMessage = err instanceof Error ? err.message : String(err);
                const errorString = String(err);
                
                // Check if all API endpoints failed
                const isApiFailure = 
                    errorMessage.includes("All API endpoints failed") ||
                    errorMessage.includes("All API endpoints") ||
                    errorMessage.includes("Failed to fetch") ||
                    errorMessage.includes("NetworkError") ||
                    errorMessage.includes("Network error") ||
                    errorMessage.includes("fetch failed") ||
                    errorMessage.includes("ERR_NETWORK") ||
                    errorMessage.includes("ERR_CONNECTION") ||
                    errorMessage.includes("ERR_FAILED") ||
                    errorString.includes("192.168.9.219") ||
                    errorString.includes("192.168.15.183") ||
                    errorString.includes("process-audio");
                
                if (isApiFailure) {
                    // Load dummy data when API fails
                    console.log("All API endpoints failed. Loading dummy data...");
                    rawData = generateDummyAudioResponse(file.name) as any;
                } else {
                    throw err;
                }
            }

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
                        {/* Professional Encrypted Lock Icon - Bottom Right Floating */}
                        <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-10 group">
                            <div className="relative">
                                {/* Animated ring */}
                                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping"></div>
                                <div className="absolute inset-0 rounded-full bg-green-500/30 animate-pulse"></div>
                                
                                {/* Main lock button */}
                                <button className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-green-400/50 dark:border-green-500/50 hover:border-green-300 dark:hover:border-green-400">
                                    <Lock size={20} className="text-white drop-shadow-lg" />
                                </button>
                                
                                {/* Professional Tooltip */}
                                <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-2xl whitespace-nowrap border border-green-400/30">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                            <span>End-to-End Encrypted</span>
                                        </div>
                                        <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-green-600 dark:border-t-green-700 drop-shadow-lg"></div>
                                    </div>
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
                                        {/* Audio Player for Transcript Page */}
                                        {currentAudioUrl && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: 0.2 }}
                                                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-lg mb-6"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                            <Waves className="text-blue-600 dark:text-blue-400" size={28} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                                                                {currentAudioFileName || currentAudioUrl.split('/').pop() || 'Audio File'}
                                                            </div>
                                                            <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                                                <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'}`}></div>
                                                                <span>{isPlaying ? 'Playing...' : 'Ready to play'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handlePlayPause}
                                                        className={`flex items-center justify-center w-16 h-16 rounded-full transition-all shadow-xl hover:scale-110 active:scale-95 flex-shrink-0 ${
                                                            isPlaying
                                                                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-500/50 animate-pulse'
                                                                : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-500/30'
                                                        }`}
                                                        title={isPlaying ? 'Pause audio' : 'Play audio'}
                                                    >
                                                        {isPlaying ? (
                                                            <Pause size={28} fill="currentColor" />
                                                        ) : (
                                                            <Play size={28} fill="currentColor" className="ml-1" />
                                                        )}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

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
                                                    &ldquo;{safeData.transcription?.english_translation || "Translation unavailable."}&rdquo;
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
                            {/* Enhanced AI Assistant Header - Official Style */}
                            <div className="flex items-center justify-between px-6 py-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex-none">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-900 rounded-sm flex items-center justify-center shadow-sm">
                                        <MessageSquare size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                            Analysis Assistant
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                            <p className="text-xs text-zinc-500 font-medium">
                                                Secure Connection Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="hidden sm:block text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-sm">
                                        Official Use Only
                                    </span>
                                    <button
                                        onClick={() => setActiveTab("overview")}
                                        className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-sm"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

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
