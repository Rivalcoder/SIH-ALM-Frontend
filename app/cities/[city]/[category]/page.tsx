"use client";

import { motion, AnimatePresence } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, ChevronRight, Mic, CheckCircle2,
    X, Activity, Terminal, ShieldCheck, MapPin,
    Building2, ArrowRight, Server, Waves, Clock,
    PlayCircle, AlertTriangle, FileText, Calendar,
    Users, Globe, HeartPulse, Gauge, Sparkles, Wind, Info, Play, Pause
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

    // Audio playback state
    const [playingTimeframe, setPlayingTimeframe] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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
            // Stop audio playback when closing sub item
            if (audioRef.current) {
                audioRef.current.pause();
                setPlayingTimeframe(null);
            }
        }
    }, [selectedSubItem]);

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

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

    // Available audio files
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

    // Get audio file for a timeframe (map by index or random)
    const getAudioFileForTimeframe = (tfId: string) => {
        // Extract hour from timeframe ID (e.g., "tf-0" -> 0, "tf-12" -> 12)
        const hourMatch = tfId.match(/tf-(\d+)/);
        const hour = hourMatch ? parseInt(hourMatch[1]) : 0;
        // Use modulo to cycle through available audio files
        const audioIndex = hour % audioFiles.length;
        return `/audios/${audioFiles[audioIndex]}`;
    };

    // Handle audio playback for a timeframe
    const handlePlayAudio = (e: React.MouseEvent, tfId: string) => {
        e.stopPropagation(); // Prevent triggering the timeframe selection
        e.preventDefault();
        console.log('Play button clicked for timeframe:', tfId);
        
        // If already playing this timeframe, pause it
        if (playingTimeframe === tfId && audioRef.current) {
            audioRef.current.pause();
            setPlayingTimeframe(null);
            return;
        }

        // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Create or get audio element
        if (!audioRef.current) {
            audioRef.current = new Audio();
            
            // Handle audio end
            audioRef.current.addEventListener('ended', () => {
                setPlayingTimeframe(null);
            });

            // Handle errors
            audioRef.current.addEventListener('error', () => {
                console.error('Audio playback error');
                setPlayingTimeframe(null);
            });
        }

        // Set source and play
        const audioUrl = getAudioFileForTimeframe(tfId);
        audioRef.current.src = audioUrl;
        audioRef.current.play().then(() => {
            setPlayingTimeframe(tfId);
        }).catch((error) => {
            console.error('Failed to play audio:', error);
            setPlayingTimeframe(null);
        });
    };

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
                                                <div
                                                    key={tf.id}
                                                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border transition-all ${selectedTimeframe === tf.id
                                                        ? 'bg-white dark:bg-zinc-800 border-blue-500 shadow-sm ring-1 ring-blue-500/20 z-10'
                                                        : 'bg-transparent border-transparent hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                                                        }`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handlePlayAudio(e, tf.id)}
                                                        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all flex-shrink-0 shadow-sm ${
                                                            playingTimeframe === tf.id
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/50'
                                                                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:shadow-md'
                                                        }`}
                                                        title={playingTimeframe === tf.id ? 'Pause audio' : 'Play audio'}
                                                        aria-label={playingTimeframe === tf.id ? 'Pause audio' : 'Play audio'}
                                                    >
                                                        {playingTimeframe === tf.id ? (
                                                            <Pause size={14} fill="currentColor" />
                                                        ) : (
                                                            <Play size={14} fill="currentColor" className="ml-0.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => runAnalysis(tf.id)}
                                                        className="flex-1 flex items-center justify-between text-left min-w-0"
                                                    >
                                                        <span className={`font-mono text-xs font-medium truncate ${selectedTimeframe === tf.id ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                                            {tf.label}
                                                        </span>
                                                        {tf.status === 'pending' && <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 flex-shrink-0 ml-2" />}
                                                    </button>
                                                </div>
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
                                                                        onShowSidebar={() => { }}
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
