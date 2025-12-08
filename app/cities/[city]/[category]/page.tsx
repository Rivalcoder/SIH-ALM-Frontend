"use client";

import { motion, AnimatePresence } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, ChevronRight, Mic, CheckCircle2,
    X, Activity, Terminal, ShieldCheck, MapPin,
    Building2, ArrowRight, Server, Waves, Clock,
    PlayCircle, AlertTriangle, FileText, Calendar,
    Users, Globe, HeartPulse, Gauge, Sparkles, Wind, Info
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { processAudio } from "@/lib/api/client";
import { mapApiResponseToDatasetSample } from "@/lib/api/mapper";
import { ProcessAudioResponse } from "@/lib/api/types";
import { DatasetSample } from "@/lib/datasetSamples";
import { getLanguageName } from "@/lib/languageUtils";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { OverviewTab } from "@/components/analyze/tabs/OverviewTab";
import { InsightsTab } from "@/components/analyze/tabs/InsightsTab";
import { VisualizationsTab } from "@/components/analyze/tabs/VisualizationsTab";
import { ResultsNavigation } from "@/components/analyze/ResultsNavigation";
import { TranscriptView } from "@/components/analyze/TranscriptView";
import { cn } from "@/lib/utils";

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
    const [analysisState, setAnalysisState] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
    const [processingSteps, setProcessingSteps] = useState<number>(0);
    const [apiResponse, setApiResponse] = useState<ProcessAudioResponse | null>(null);
    const [mappedAnalysis, setMappedAnalysis] = useState<DatasetSample | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [translatedTranscript, setTranslatedTranscript] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState<string>("Original");
    const [showDiarization, setShowDiarization] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Computed values for visualizations
    const audioMetrics = useMemo(() => {
        if (!mappedAnalysis) return [];
        return [
            { name: "Duration", value: mappedAnalysis.duration, unit: "s" },
            { name: "Speech Ratio", value: (mappedAnalysis.mixing_ratios?.speech || 0) * 100, unit: "%" },
            { name: "Non-Speech Ratio", value: (mappedAnalysis.mixing_ratios?.nonspeech || 0) * 100, unit: "%" },
        ];
    }, [mappedAnalysis]);

    const speakerData = useMemo(() => {
        if (!mappedAnalysis?.diarization) return [];
        const speakerMap = new Map<string, number>();
        mappedAnalysis.diarization.forEach((seg) => {
            const duration = seg.end - seg.start;
            speakerMap.set(seg.speaker, (speakerMap.get(seg.speaker) || 0) + duration);
        });
        return Array.from(speakerMap.entries()).map(([speaker, duration]) => ({
            name: speaker,
            duration: Math.round(duration),
        }));
    }, [mappedAnalysis]);

    const emotionScores = useMemo(() => {
        return apiResponse?.results?.paralinguistics?.emotion?.all_emotions || {};
    }, [apiResponse]);

    const dominantEmotion = useMemo(() => {
        return mappedAnalysis?.paralinguistics?.dominant_emotion || apiResponse?.results?.paralinguistics?.emotion?.emotion || "neutral";
    }, [mappedAnalysis, apiResponse]);

    const backgroundEvents = useMemo(() => {
        if (mappedAnalysis?.paralinguistics?.background_events && Array.isArray(mappedAnalysis.paralinguistics.background_events)) {
            return mappedAnalysis.paralinguistics.background_events.map(event => ({
                name: event.name,
                percentage: (event.score || 0) * 100
            }));
        }
        return [];
    }, [mappedAnalysis]);

    const uniqueSpeakers = useMemo(() => {
        if (!mappedAnalysis?.diarization) return 0;
        const speakers = new Set(mappedAnalysis.diarization.map(seg => seg.speaker).filter(Boolean));
        return speakers.size || mappedAnalysis.diarization.length;
    }, [mappedAnalysis]);

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

    const runAnalysis = async (tfId: string) => {
        if (selectedTimeframe === tfId && analysisState === 'done') return;

        setSelectedTimeframe(tfId);
        setAnalysisState('processing');
        setProcessingSteps(0);
        setErrorMessage(null);
        setApiResponse(null);
        setMappedAnalysis(null);

        try {
            // Step 1: Decomposing Audio Signal
            setProcessingSteps(1);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Step 2: Filtering Ambient Noise
            setProcessingSteps(2);
            await new Promise(resolve => setTimeout(resolve, 800));

            // Step 3: Identifying Voice Patterns
            setProcessingSteps(3);
            
            // Try to get audio file for the timeframe
            // First, try to fetch from backend API endpoint
            let audioFile: File | null = null;
            
            try {
                // Option 1: Try to fetch audio from a Next.js API route
                const audioApiUrl = `/api/audio?city=${cityId}&category=${categoryId}&subItem=${selectedSubItem?.id}&timeframe=${tfId}`;
                const audioResponse = await fetch(audioApiUrl);
                
                if (audioResponse.ok) {
                    const audioBlob = await audioResponse.blob();
                    audioFile = new File([audioBlob], `audio-${tfId}.wav`, { type: audioBlob.type || 'audio/wav' });
                }
            } catch (fetchError) {
                console.log('Could not fetch audio from API route, trying direct backend...', fetchError);
            }
            
            // If no file from API route, try direct backend endpoint
            if (!audioFile) {
                try {
                    const PRIMARY_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://untraceable-tiara-fittingly.ngrok-free.dev";
                    const SECONDARY_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_SECONDARY || "http://localhost:8000";
                    
                    const audioUrl = `${PRIMARY_API_BASE_URL}/audio/${cityId}/${categoryId}/${selectedSubItem?.id}/${tfId}`;
                    const audioResponse = await fetch(audioUrl);
                    
                    if (audioResponse.ok) {
                        const audioBlob = await audioResponse.blob();
                        audioFile = new File([audioBlob], `audio-${tfId}.wav`, { type: audioBlob.type || 'audio/wav' });
                    }
                } catch (directError) {
                    console.log('Could not fetch audio from direct backend...', directError);
                }
            }
            
            // If we have an audio file, process it
            if (audioFile) {
                console.log('Processing audio file:', audioFile.name);
                const response = await processAudio(audioFile);
                
                // Store the raw API response
                setApiResponse(response);
                console.log('API Response received:', response);
                
                // Map the API response to frontend format
                const mapped = mapApiResponseToDatasetSample(response, audioFile.name);
                setMappedAnalysis(mapped);
                console.log('Mapped analysis:', mapped);
            } else {
                // If no audio file available, check if backend sends analysis directly
                // Try to fetch analysis result instead of audio file
                try {
                    const PRIMARY_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://untraceable-tiara-fittingly.ngrok-free.dev";
                    const SECONDARY_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_SECONDARY || "http://localhost:8000";
                    
                    const analysisUrl = `${PRIMARY_API_BASE_URL}/analysis/${cityId}/${categoryId}/${selectedSubItem?.id}/${tfId}`;
                    const analysisResponse = await fetch(analysisUrl);
                    
                    if (analysisResponse.ok) {
                        const rawData = await analysisResponse.json();
                        console.log('Raw Analysis Response received:', rawData);
                        
                        // Backend sends just the results object, so we need to wrap it
                        let responseData: ProcessAudioResponse;
                        if (rawData.results) {
                            // Already in ProcessAudioResponse format
                            responseData = rawData as ProcessAudioResponse;
                        } else {
                            // Just the results object - wrap it
                            responseData = {
                                session_id: `session-${tfId}-${Date.now()}`,
                                filename: `analysis-${tfId}.json`,
                                results: rawData
                            };
                        }
                        
                        setApiResponse(responseData);
                        console.log('Processed API Response:', responseData);
                        
                        // Map the API response
                        const mapped = mapApiResponseToDatasetSample(responseData, `analysis-${tfId}.json`);
                        setMappedAnalysis(mapped);
                        console.log('Mapped analysis:', mapped);
                    } else {
                        throw new Error('No audio file or analysis data available for this timeframe');
                    }
                } catch (analysisError) {
                    console.error('Could not fetch analysis:', analysisError);
                    throw new Error('Unable to retrieve audio or analysis data. Please ensure the backend is providing audio data for this timeframe.');
                }
            }
            
            // Step 4: Generating Final Report
            setProcessingSteps(4);
            await new Promise(resolve => setTimeout(resolve, 800));

            setAnalysisState('done');
            setTimeframes(prev => prev.map(t => t.id === tfId ? { ...t, status: 'analyzed', risk: 'low' } : t));
            
        } catch (error) {
            console.error('Analysis failed:', error);
            setAnalysisState('error');
            setErrorMessage(error instanceof Error ? error.message : 'Failed to process audio');
        }
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
                                        className="flex-1 bg-white dark:bg-zinc-900 relative flex flex-col min-w-0 overflow-hidden"
                                    >
                                        {/* Premium Animated Background */}
                                        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                                            {/* Animated gradient background */}
                                            <div 
                                                className="absolute inset-0"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                                                    transform: 'translateZ(0)',
                                                    backfaceVisibility: 'hidden',
                                                }}
                                            />
                                            
                                            {/* Gradient orbs */}
                                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                                <div
                                                    className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-2xl opacity-20"
                                                    style={{
                                                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25), transparent)',
                                                        transform: 'translateZ(0)',
                                                    }}
                                                />
                                                <div
                                                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-2xl opacity-20"
                                                    style={{
                                                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25), transparent)',
                                                        transform: 'translateZ(0)',
                                                    }}
                                                />
                                            </div>

                                            {/* Grid pattern */}
                                            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                                                <div 
                                                    className="w-full h-full"
                                                    style={{
                                                        backgroundImage: `
                                                            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                                                            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                                                        `,
                                                        backgroundSize: "50px 50px",
                                                    }}
                                                />
                                            </div>
                                        </div>

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
                                            <div className="flex-1 overflow-y-auto flex flex-col relative">
                                                {mappedAnalysis ? (
                                                    <>
                                                        {/* Premium Header Section */}
                                                        <div className="flex-none relative z-10" style={{ pointerEvents: 'auto' }}>
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="px-6 py-8"
                                                                style={{
                                                                    backgroundColor: "hsl(var(--background) / 0.98)",
                                                                    backdropFilter: "blur(8px)",
                                                                    WebkitBackdropFilter: "blur(8px)",
                                                                }}
                                                            >
                                                                <div className="text-center space-y-5">
                                                                    {/* Premium Badge */}
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ duration: 0.5 }}
                                                                        className="inline-block"
                                                                    >
                                                                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
                                                                            <Waves className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                                                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wide">AUDIO INTELLIGENCE</span>
                                                                        </div>
                                                                    </motion.div>
                                                                    
                                                                    {/* Main Title with Gradient */}
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ duration: 0.5, delay: 0.1 }}
                                                                        className="space-y-2"
                                                                    >
                                                                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                                                                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                                                                                Analysis Report
                                                                            </span>
                                                                        </h1>
                                                                        <motion.p
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            transition={{ duration: 0.6, delay: 0.3 }}
                                                                            className="text-sm text-zinc-500 dark:text-zinc-400"
                                                                        >
                                                                            Timeframe: <span className="font-mono font-medium text-zinc-900 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded ml-1">{timeframes.find(t => t.id === selectedTimeframe)?.label}</span>
                                                                        </motion.p>
                                                                    </motion.div>
                                                                </div>
                                                            </motion.div>

                                                            {/* Premium Tab Navigation */}
                                                            <motion.nav
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.3, delay: 0.2 }}
                                                                className="w-full relative"
                                                                style={{
                                                                    backgroundColor: "hsl(var(--background) / 0.98)",
                                                                    backdropFilter: "blur(8px)",
                                                                    WebkitBackdropFilter: "blur(8px)",
                                                                }}
                                                            >
                                                                <div className="px-6">
                                                                    <ResultsNavigation
                                                                        activeTab={activeTab}
                                                                        onTabChange={(tab) => setActiveTab(tab)}
                                                                        showSidebar={false}
                                                                        onShowSidebar={() => {}}
                                                                    />
                                                                </div>
                                                            </motion.nav>
                                                        </div>

                                                        {/* Tab Content */}
                                                        <div className="flex-1 overflow-y-auto relative z-10" style={{ paddingTop: '24px', paddingBottom: '128px', maxWidth: '1280px', margin: '0 auto', paddingLeft: '16px', paddingRight: '16px' }}>
                                                            <AnimatePresence mode="wait">
                                                                {activeTab === 'overview' && (
                                                                    <motion.div
                                                                        key="overview"
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -20 }}
                                                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                                    >
                                                                        <OverviewTab analysis={mappedAnalysis} />
                                                                    </motion.div>
                                                                )}

                                                                {activeTab === 'transcript' && (
                                                                    <motion.div
                                                                        key="transcript"
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -20 }}
                                                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                                        className="space-y-6"
                                                                    >
                                                                        <TranscriptView
                                                                            analysis={mappedAnalysis}
                                                                            translatedTranscript={translatedTranscript}
                                                                            isTranslating={isTranslating}
                                                                            targetLanguage={targetLanguage}
                                                                            showDiarization={showDiarization}
                                                                            onLanguageChange={setTargetLanguage}
                                                                            onDiarizationToggle={setShowDiarization}
                                                                        />
                                                                    </motion.div>
                                                                )}

                                                                {activeTab === 'insights' && (
                                                                    <motion.div
                                                                        key="insights"
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -20 }}
                                                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                                    >
                                                                        <InsightsTab analysis={mappedAnalysis} />
                                                                    </motion.div>
                                                                )}

                                                                {activeTab === 'visualizations' && (
                                                                    <motion.div
                                                                        key="visualizations"
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -20 }}
                                                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                                        className="w-full"
                                                                    >
                                                                        <VisualizationsTab analysis={mappedAnalysis} />
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-12">
                                                        <AlertTriangle size={48} className="mb-4 text-amber-500" />
                                                        <p className="text-lg font-semibold mb-2">No Analysis Data</p>
                                                        <p className="text-sm">Analysis completed but no data was returned.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ERROR STATE */}
                                        {analysisState === 'error' && (
                                            <div className="flex-1 flex flex-col items-center justify-center p-12">
                                                <AlertTriangle size={48} className="mb-4 text-red-500" />
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Analysis Failed</h3>
                                                <p className="text-zinc-500 text-center max-w-md">{errorMessage || 'An error occurred while processing the audio.'}</p>
                                                <button
                                                    onClick={() => selectedTimeframe && runAnalysis(selectedTimeframe)}
                                                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Retry Analysis
                                                </button>
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
                                                                    {/* Stats Grid */}
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 20 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.1 }}
                                                                            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 backdrop-blur-xl shadow-xl"
                                                                        >
                                                                            <div className="flex items-center justify-between mb-3">
                                                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Speakers</span>
                                                                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-500">
                                                                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{uniqueSpeakers}</div>
                                                                            <p className="text-xs text-zinc-500 mt-1">Distinct voices identified</p>
                                                                        </motion.div>

                                                                    {/* Stats Grid - Using StatCard style */}
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 30 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                                                            className="relative h-full overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-sm shadow-xl rounded-2xl"
                                                                        >
                                                                            <div className="relative z-10 p-6">
                                                                                <div className="flex items-center justify-between mb-3">
                                                                                    <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Speakers</span>
                                                                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-500">
                                                                                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                                                                                    </div>
                                                                                </div>
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                    transition={{ delay: 0.3, duration: 0.4 }}
                                                                                    className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100"
                                                                                >
                                                                                    {uniqueSpeakers}
                                                                                </motion.div>
                                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Distinct voices identified</p>
                                                                            </div>
                                                                        </motion.div>

                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 30 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                                                            className="relative h-full overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-sm shadow-xl rounded-2xl"
                                                                        >
                                                                            <div className="relative z-10 p-6">
                                                                                <div className="flex items-center justify-between mb-3">
                                                                                    <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Language</span>
                                                                                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-500">
                                                                                        <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                                                                                    </div>
                                                                                </div>
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                    transition={{ delay: 0.4, duration: 0.4 }}
                                                                                    className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100"
                                                                                >
                                                                                    {getLanguageName(mappedAnalysis.language)}
                                                                                </motion.div>
                                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Primary language spoken</p>
                                                                            </div>
                                                                        </motion.div>

                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 30 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                                            className="relative h-full overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-sm shadow-xl rounded-2xl"
                                                                        >
                                                                            <div className="relative z-10 p-6">
                                                                                <div className="flex items-center justify-between mb-3">
                                                                                    <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Emotion</span>
                                                                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-500">
                                                                                        <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                                                                                    </div>
                                                                                </div>
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                    transition={{ delay: 0.5, duration: 0.4 }}
                                                                                    className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 capitalize"
                                                                                >
                                                                                    {typeof dominantEmotion === 'string' ? dominantEmotion : 'Neutral'}
                                                                                </motion.div>
                                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Detected audio emotion</p>
                                                                            </div>
                                                                        </motion.div>

                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 30 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                                            className="relative h-full overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-sm shadow-xl rounded-2xl"
                                                                        >
                                                                            <div className="relative z-10 p-6">
                                                                                <div className="flex items-center justify-between mb-3">
                                                                                    <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Duration</span>
                                                                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-500">
                                                                                        <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                                                                                    </div>
                                                                                </div>
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                    transition={{ delay: 0.6, duration: 0.4 }}
                                                                                    className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100"
                                                                                >
                                                                                    {mappedAnalysis.duration.toFixed(1)}s
                                                                                </motion.div>
                                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Total audio length</p>
                                                                            </div>
                                                                        </motion.div>
                                                                    </div>

                                                                    {/* Background Events - Premium Card */}
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 30 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                                                        className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-xl shadow-xl overflow-hidden rounded-2xl"
                                                                    >
                                                                        <div className="relative z-10">
                                                                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-500">
                                                                                        <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                                    </div>
                                                                                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Background Events</h3>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-6">
                                                                                <div className="flex flex-wrap gap-3">
                                                                                    {backgroundEvents.length > 0 ? (
                                                                                        backgroundEvents.slice(0, 5).map((event, idx) => (
                                                                                            <span key={idx} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-medium text-sm backdrop-blur-sm">
                                                                                                {event.name.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ({event.percentage.toFixed(1)}%)
                                                                                            </span>
                                                                                        ))
                                                                                    ) : (
                                                                                        <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-medium text-sm backdrop-blur-sm">
                                                                                            {mappedAnalysis.audio_event.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>

                                                                    {/* Transcript - Premium Card */}
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 30 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                                                        className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-xl shadow-xl overflow-hidden rounded-2xl"
                                                                    >
                                                                        <div className="relative z-10">
                                                                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-900/30 border border-sky-500">
                                                                                        <FileText className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Transcript</h3>
                                                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Full transcription of your audio content</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-6">
                                                                                <div className="relative">
                                                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl blur-xl" />
                                                                                    <div className="relative bg-gray-50 dark:bg-zinc-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-zinc-700/50">
                                                                                        {mappedAnalysis.paralinguistics?.diarization_with_text && 
                                                                                         Array.isArray(mappedAnalysis.paralinguistics.diarization_with_text) &&
                                                                                         mappedAnalysis.paralinguistics.diarization_with_text.length > 0 ? (
                                                                                            <div className="font-mono text-sm space-y-3 text-zinc-600 dark:text-zinc-400">
                                                                                                {mappedAnalysis.paralinguistics.diarization_with_text.map((segment: any, idx: number) => (
                                                                                                    <p key={idx} className="leading-relaxed">
                                                                                                        <span className="text-blue-500/70 select-none mr-3">
                                                                                                            [{typeof segment.start === 'number' ? segment.start.toFixed(2) : '00:00'}]
                                                                                                        </span>
                                                                                                        <span className="text-zinc-400 text-xs mr-2">Speaker {segment.speaker || 'unknown'}:</span>
                                                                                                        {segment.text || 'No transcription'}
                                                                                                    </p>
                                                                                                ))}
                                                                                            </div>
                                                                                        ) : mappedAnalysis.transcription ? (
                                                                                            <p className="text-base leading-relaxed whitespace-pre-wrap text-zinc-900 dark:text-zinc-100 font-medium">
                                                                                                {mappedAnalysis.transcription}
                                                                                            </p>
                                                                                        ) : (
                                                                                            <p className="text-sm text-zinc-500 italic">
                                                                                                No transcript available.
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                </div>
                                                            )}

                                                            {/* VISUALIZATIONS TAB */}
                                                            {activeTab === 'visualizations' && (
                                                                <div className="space-y-6">
                                                                    {/* Audio Metrics Chart */}
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 100 }}
                                                                        className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-xl shadow-xl overflow-hidden rounded-2xl"
                                                                    >
                                                                        <div className="relative z-10 bg-transparent">
                                                                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 border border-violet-500`}>
                                                                                        <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Audio Metrics</h3>
                                                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Duration and mixing ratios analysis</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-6 pt-0 bg-transparent h-64">
                                                                                <ResponsiveContainer width="100%" height="100%">
                                                                                    <BarChart data={audioMetrics} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                                                                                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} tick={{ fill: "hsl(var(--foreground))" }} />
                                                                                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} tick={{ fill: "hsl(var(--foreground))" }} />
                                                                                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", boxShadow: "0 4px 24px hsl(0 0% 0% / 0.1)", color: "hsl(var(--foreground))" }} />
                                                                                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                                                                            {audioMetrics.map((_, index) => {
                                                                                                const colors = ["#8b5cf6", "#ec4899", "#06b6d4"];
                                                                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                                                            })}
                                                                                        </Bar>
                                                                                    </BarChart>
                                                                                </ResponsiveContainer>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>

                                                                    {/* Speaker Duration Chart */}
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
                                                                        className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-xl shadow-xl overflow-hidden rounded-2xl"
                                                                    >
                                                                        <div className="relative z-10 bg-transparent">
                                                                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-500`}>
                                                                                        <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                                                    </div>
                                                                                    <div>
                                                                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Speaker Duration Distribution</h3>
                                                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Time each speaker was active</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-6 pt-0 bg-transparent h-64">
                                                                                <ResponsiveContainer width="100%" height="100%">
                                                                                    <BarChart data={speakerData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                                                                                        <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} tick={{ fill: "hsl(var(--foreground))" }} />
                                                                                        <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} tick={{ fill: "hsl(var(--foreground))" }} />
                                                                                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", boxShadow: "0 4px 24px hsl(0 0% 0% / 0.1)", color: "hsl(var(--foreground))" }} />
                                                                                        <Bar dataKey="duration" radius={[8, 8, 0, 0]}>
                                                                                            {speakerData.map((_, index) => {
                                                                                                const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
                                                                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                                                            })}
                                                                                        </Bar>
                                                                                    </BarChart>
                                                                                </ResponsiveContainer>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>

                                                                    {/* Emotion & Background Events */}
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 30 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                                        className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 backdrop-blur-xl shadow-xl overflow-hidden rounded-2xl"
                                                                    >
                                                                        <div className="relative z-10">
                                                                            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-500">
                                                                                        <HeartPulse className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                                                    </div>
                                                                                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Emotion & Background Events</h3>
                                                                                </div>
                                                                            </div>
                                                                            <div className="p-6 space-y-6">
                                                                                {/* Emotion Breakdown */}
                                                                                <div>
                                                                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Audio Emotions</h4>
                                                                                    <div className="space-y-3">
                                                                                        {Object.entries(emotionScores).length > 0 ? (
                                                                                            Object.entries(emotionScores)
                                                                                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                                                                                .map(([emotion, score]) => {
                                                                                                    const percentage = ((score as number) * 100).toFixed(1);
                                                                                                    const isDominant = emotion === dominantEmotion;
                                                                                                    return (
                                                                                                        <div key={emotion} className="space-y-1.5">
                                                                                                            <div className="flex items-center justify-between text-sm">
                                                                                                                <span className={`font-medium ${isDominant ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}`}>
                                                                                                                    {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                                                                                                                    {isDominant && <span className="ml-2 text-xs">(Dominant)</span>}
                                                                                                                </span>
                                                                                                                <span className="text-muted-foreground">{percentage}%</span>
                                                                                                            </div>
                                                                                                            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                                                <motion.div
                                                                                                                    initial={{ width: 0 }}
                                                                                                                    animate={{ width: `${percentage}%` }}
                                                                                                                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                                                                                                    className={`h-full rounded-full ${isDominant ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}
                                                                                                                />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    );
                                                                                                })
                                                                                        ) : (
                                                                                            <p className="text-sm text-muted-foreground">No emotion data available</p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Background Events */}
                                                                                <div>
                                                                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Background Events</h4>
                                                                                    <div className="space-y-3">
                                                                                        {backgroundEvents.length > 0 ? (
                                                                                            backgroundEvents.map((event, index) => (
                                                                                                <div key={index} className="space-y-1.5">
                                                                                                    <div className="flex items-center justify-between text-sm">
                                                                                                        <span className="font-medium text-foreground">
                                                                                                            {event.name.replace(/_/g, ' ').split(', ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(', ')}
                                                                                                        </span>
                                                                                                        <span className="text-muted-foreground">
                                                                                                            {event.percentage.toFixed(1)}%
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                                        <motion.div
                                                                                                            initial={{ width: 0 }}
                                                                                                            animate={{ width: `${event.percentage}%` }}
                                                                                                            transition={{ duration: 0.8, delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                                                                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                                                                                        />
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))
                                                                                        ) : (
                                                                                            <div className="space-y-1.5">
                                                                                                <div className="flex items-center justify-between text-sm">
                                                                                                    <span className="font-medium text-foreground">
                                                                                                        {mappedAnalysis.audio_event.replace(/_/g, " ").split(" ").map(word => 
                                                                                                            word.charAt(0).toUpperCase() + word.slice(1)
                                                                                                        ).join(" ")}
                                                                                                    </span>
                                                                                                    <span className="text-muted-foreground">
                                                                                                        {((mappedAnalysis.mixing_ratios?.nonspeech || 0) * 100).toFixed(1)}%
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                                    <motion.div
                                                                                                        initial={{ width: 0 }}
                                                                                                        animate={{ width: `${((mappedAnalysis.mixing_ratios?.nonspeech || 0) * 100)}%` }}
                                                                                                        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                                                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </motion.div>
                                                                </div>
                                                            )}

                                                            {/* INSIGHTS TAB */}
                                                            {activeTab === 'insights' && (
                                                                <div className="space-y-6">
                                                                    {/* Q&A Pairs */}
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                                                                    >
                                                                        <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                                                                            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 border border-pink-500">
                                                                                <Info className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                                                                            </div>
                                                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Question & Answer Pairs</h3>
                                                                        </div>
                                                                        <div className="p-6">
                                                                            {mappedAnalysis.question_answer_pair && mappedAnalysis.question_answer_pair.length > 0 ? (
                                                                                <div className="space-y-4">
                                                                                    {mappedAnalysis.question_answer_pair.map((qa, idx) => (
                                                                                        <motion.div
                                                                                            key={idx}
                                                                                            initial={{ opacity: 0, x: -20 }}
                                                                                            animate={{ opacity: 1, x: 0 }}
                                                                                            transition={{ delay: idx * 0.1 }}
                                                                                            className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border-l-4 border-pink-500"
                                                                                        >
                                                                                            <p className="font-bold text-sm mb-2 text-zinc-900 dark:text-zinc-100">Q: {qa.question}</p>
                                                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">A: {qa.answer}</p>
                                                                                        </motion.div>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-sm text-zinc-500 italic">No Q&A pairs available.</p>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>

                                                                    {/* Additional Stats */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 20 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.1 }}
                                                                            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                                                                        >
                                                                            <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400">
                                                                                <Activity size={20} />
                                                                                <span className="text-xs font-bold uppercase tracking-wider">Energy Level</span>
                                                                            </div>
                                                                            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                                                                {apiResponse?.results?.paralinguistics?.energy?.energy_db 
                                                                                    ? `${apiResponse.results.paralinguistics.energy.energy_db.toFixed(1)}dB`
                                                                                    : 'N/A'}
                                                                            </div>
                                                                            <div className="text-xs text-zinc-500 mt-1 font-medium">
                                                                                {apiResponse?.results?.paralinguistics?.energy?.mean_energy 
                                                                                    ? `Mean: ${apiResponse.results.paralinguistics.energy.mean_energy.toFixed(2)}`
                                                                                    : 'Energy Analysis'}
                                                                            </div>
                                                                        </motion.div>

                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 20 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            transition={{ delay: 0.2 }}
                                                                            className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                                                                        >
                                                                            <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
                                                                                <Waves size={20} />
                                                                                <span className="text-xs font-bold uppercase tracking-wider">Sample Rate</span>
                                                                            </div>
                                                                            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                                                                                {apiResponse?.results?.audio?.sample_rate 
                                                                                    ? `${apiResponse.results.audio.sample_rate}Hz`
                                                                                    : 'N/A'}
                                                                            </div>
                                                                            <div className="text-xs text-zinc-500 mt-1 font-medium">
                                                                                {apiResponse?.results?.audio?.num_samples 
                                                                                    ? `${apiResponse.results.audio.num_samples.toLocaleString()} samples`
                                                                                    : 'Audio quality'}
                                                                            </div>
                                                                        </motion.div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-12">
                                                        <AlertTriangle size={48} className="mb-4 text-amber-500" />
                                                        <p className="text-lg font-semibold mb-2">No Analysis Data</p>
                                                        <p className="text-sm">Analysis completed but no data was returned.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ERROR STATE */}
                                        {analysisState === 'error' && (
                                            <div className="flex-1 flex flex-col items-center justify-center p-12">
                                                <AlertTriangle size={48} className="mb-4 text-red-500" />
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Analysis Failed</h3>
                                                <p className="text-zinc-500 text-center max-w-md">{errorMessage || 'An error occurred while processing the audio.'}</p>
                                                <button
                                                    onClick={() => selectedTimeframe && runAnalysis(selectedTimeframe)}
                                                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Retry Analysis
                                                </button>
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
