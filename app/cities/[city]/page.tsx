"use client";

import { motion, AnimatePresence } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getCity, getIcon, Sector, Place, Spot, Timeframe } from "@/lib/data";
import { Column, ExplorerView } from "@/components/ui/FinderColumn";
import AnalysisView from "@/components/gov/AnalysisView";
import { Home, ChevronRight, LayoutGrid, Clock, MapPin, Building2, Store, AlertTriangle, Play, Pause, Lock } from "lucide-react";

export default function CityFinderPage() {
    const params = useParams();
    const router = useRouter();
    const cityId = params?.city as string;
    const cityData = getCity(cityId);

    // Navigation PATH State
    // Format: [Sector, Place, Spot, Timeframe]
    const [path, setPath] = useState<any[]>([]);

    // Derived selections
    const selectedSector = path[0] as Sector | undefined;
    const selectedPlace = path[1] as Place | undefined;
    const selectedSpot = path[2] as Spot | undefined;
    const selectedTimeframe = path[3] as Timeframe | undefined;

    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

    // Audio playback state
    const [playingTimeframe, setPlayingTimeframe] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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

    // Map Bangalore folder structure to sectors/places/spots
    const getBangaloreResource = (sectorId: string, placeId: string, spotId: string, type: 'image' | 'audio') => {
        if (cityId !== 'bangalore') return null;

        // Map sector IDs to folder names
        const sectorMap: Record<string, string> = {
            'bangalore-it_parks': 'it-parks',
            'bangalore-metro': 'metro',
            'bangalore-airports': 'airport',
            'bangalore-startups': 'infra' // Assuming startups maps to infra
        };

        const folderName = sectorMap[sectorId];
        if (!folderName) return null;

        // For Bangalore, use the same audio file for all timeframes based on sector
        if (type === 'audio') {
            // Use the first available audio file in the folder for all timeframes
            if (folderName === 'metro') return '/bangalore/metro/metro-audio.wav';
            if (folderName === 'it-parks') return '/bangalore/it-parks/park1.wav';
            if (folderName === 'airport') return '/bangalore/airport/airport.wav';
            if (folderName === 'infra') return '/bangalore/infra/park.wav';
        } else {
            // For images - map places to specific images
            if (folderName === 'it-parks') {
                // Map IT Parks places to specific images
                if (placeId === 'bangalore-it_parks-p0') return '/bangalore/it-parks/it-park1.1.png'; // Tech Zone A
                if (placeId === 'bangalore-it_parks-p1') return '/bangalore/it-parks/it-park2.1.png'; // Cyber City
                return '/bangalore/it-parks/it-park1.1.png'; // Default
            }
            if (folderName === 'metro') return '/bangalore/metro/metro.png';
            if (folderName === 'airport') return '/bangalore/airport/airport.png';
            if (folderName === 'infra') return '/bangalore/infra/park.png';
        }

        return null;
    };

    // Get image URL for a place in Bangalore
    const getPlaceImage = (place: Place) => {
        if (cityId !== 'bangalore' || !selectedSector) {
            return undefined;
        }

        // Direct mapping for IT Parks places
        if (selectedSector.id === 'bangalore-it_parks') {
            // Map place IDs to their specific images
            const placeImageMap: Record<string, string> = {
                'bangalore-it_parks-p0': '/bangalore/it-parks/it-park1.1.png', // Tech Zone A
                'bangalore-it_parks-p1': '/bangalore/it-parks/it-park2.1.png', // Cyber City
            };
            
            const imageUrl = placeImageMap[place.id];
            if (imageUrl) {
                return imageUrl;
            }
        }

        // For other sectors, use the general mapping
        return getBangaloreResource(selectedSector.id, place.id, '', 'image');
    };

    // Get audio file for a timeframe
    const getAudioFileForTimeframe = (tfId: string) => {
        // For Bangalore, use the same audio file for all timeframes based on sector
        if (cityId === 'bangalore' && selectedSector) {
            const audioFile = getBangaloreResource(selectedSector.id, selectedPlace?.id || '', selectedSpot?.id || '', 'audio');
            if (audioFile) {
                return audioFile;
            }
            // Fallback to metro audio if mapping fails
            return '/bangalore/metro/metro-audio.wav';
        }

        // For other cities, use the original logic (cycle through different audio files)
        const hourMatch = tfId.match(/-(\d{2})$/);
        if (hourMatch) {
            const hour = parseInt(hourMatch[1]);
            const audioIndex = hour % audioFiles.length;
            return `/audios/${audioFiles[audioIndex]}`;
        }
        // Fallback: use first audio file
        return `/audios/${audioFiles[0]}`;
    };

    // Handle audio playback for a timeframe
    const handlePlayAudio = (e: React.MouseEvent, tfId: string) => {
        e.stopPropagation();
        e.preventDefault();
        
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

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    if (!cityData) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-zinc-950 text-white">
                <AlertTriangle size={48} className="text-amber-500" />
                <h1 className="text-xl font-bold">Region Data Unavailable</h1>
                <button onClick={() => router.push('/cities')} className="text-blue-400 hover:underline">Return to Portal</button>
            </div>
        )
    }

    // Handlers
    const handleSectorSelect = (sector: any) => {
        setPath([sector]);
    };

    const handlePlaceSelect = (place: any) => {
        setPath([selectedSector, place]);
    };

    const handleSpotSelect = (spot: any) => {
        setPath([selectedSector, selectedPlace, spot]);
    };

    const handleTimeframeSelect = (tf: any) => {
        setPath([selectedSector, selectedPlace, selectedSpot, tf]);
        setIsAnalysisOpen(true);
    };

    return (
        <div className="h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/30">
            {/* Top Bar / Breadcrumb */}
            <div className="flex-none h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-2 overflow-hidden">
                    <button
                        onClick={() => router.push('/cities')}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                    >
                        <Home size={18} />
                    </button>
                    <ChevronRight size={16} className="text-zinc-300" />

                    <h1 className="text-lg font-bold uppercase tracking-wide truncate">{cityData.name}</h1>

                    {path.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                            <ChevronRight size={16} className="text-zinc-300" />
                            <span className="text-sm font-medium whitespace-nowrap">{item.name || item.title}</span>
                        </div>
                    ))}
                </div>

            </div>

            {/* Main Finder Area */}
            <div className="flex-1 w-full overflow-hidden relative">
                <ExplorerView>
                    {/* LEFT MOST: SECTORS */}
                    <Column
                        depth={0}
                        title="Sectors"
                        selectedId={selectedSector?.id || null}
                        onSelect={(item) => handleSectorSelect(item.data)}
                        items={(cityData.sectors || []).map(s => ({
                            id: s.id,
                            name: s.title,
                            icon: getIcon(s.icon),
                            data: s
                        }))}
                    />

                    {/* LEVEL 2: PLACES */}
                    <AnimatePresence>
                        {selectedSector && (
                            <Column
                                depth={1}
                                title={`${selectedSector.title} - Places`}
                                selectedId={selectedPlace?.id || null}
                                onSelect={(item) => handlePlaceSelect(item.data)}
                                items={(selectedSector.places || []).map(p => ({
                                    id: p.id,
                                    name: p.name,
                                    status: p.status,
                                    icon: Building2,
                                    data: p,
                                    imageUrl: getPlaceImage(p) // Add image URL for Bangalore places
                                }))}
                            />
                        )}
                    </AnimatePresence>

                    {/* LEVEL 3: SPOTS */}
                    <AnimatePresence>
                        {selectedPlace && (
                            <Column
                                depth={2}
                                title={`${selectedPlace.name} - Unit`}
                                selectedId={selectedSpot?.id || null}
                                onSelect={(item) => handleSpotSelect(item.data)}
                                items={(selectedPlace.spots || []).map(s => ({
                                    id: s.id,
                                    name: s.name,
                                    status: s.status,
                                    icon: Store,
                                    data: s
                                }))}
                            />
                        )}
                    </AnimatePresence>

                    {/* LEVEL 4: TIMEFRAMES */}
                    <AnimatePresence>
                        {selectedSpot && (
                            <Column
                                depth={3}
                                title="Data Streams"
                                selectedId={selectedTimeframe?.id || null}
                                onSelect={(item) => handleTimeframeSelect(item.data)}
                                playingTimeframe={playingTimeframe}
                                onPlayAudio={handlePlayAudio}
                                items={(selectedSpot.timeframes || []).map(t => ({
                                    id: t.id,
                                    name: t.name,
                                    status: t.status,
                                    icon: Clock,
                                    data: t
                                }))}
                            />
                        )}
                    </AnimatePresence>
                </ExplorerView>
            </div>

            {/* Analysis Overlay */}
            <AnimatePresence>
                {isAnalysisOpen && selectedSpot && (
                    <AnalysisView
                        timeframe={selectedTimeframe?.name || "Live"}
                        unitName={selectedSpot.name}
                        onClose={() => {
                            setIsAnalysisOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>

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

        </div>
    );
}
