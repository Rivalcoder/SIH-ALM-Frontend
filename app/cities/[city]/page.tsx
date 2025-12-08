"use client";

import { motion, AnimatePresence } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCity, getIcon, Sector, Place, Spot, Timeframe } from "@/lib/data";
import { Column, ExplorerView } from "@/components/ui/FinderColumn";
import AnalysisView from "@/components/gov/AnalysisView";
import { Home, ChevronRight, LayoutGrid, Clock, MapPin, Building2, Store, AlertTriangle } from "lucide-react";

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

                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    SECURE CONNECTION
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                                    data: p
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

        </div>
    );
}
