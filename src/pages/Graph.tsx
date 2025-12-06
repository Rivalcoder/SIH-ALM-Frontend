"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Wind } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";

const nodes = [
  { id: 1, label: "Speaker A", x: 30, y: 20, type: "person" },
  { id: 2, label: "Emotion: Happy", x: 60, y: 30, type: "emotion" },
  { id: 3, label: "Location: Airport", x: 40, y: 60, type: "location" },
  { id: 4, label: "Event: Greeting", x: 20, y: 50, type: "event" },
  { id: 5, label: "Speaker B", x: 70, y: 60, type: "person" },
  { id: 6, label: "Topic: Travel", x: 50, y: 80, type: "topic" },
];

const connections = [
  { from: 1, to: 2 },
  { from: 1, to: 4 },
  { from: 1, to: 3 },
  { from: 2, to: 6 },
  { from: 3, to: 6 },
  { from: 5, to: 6 },
  { from: 4, to: 5 },
];

export default function Graph() {
  const [zoom, setZoom] = useState(100);
  const [latestAnalysis, setLatestAnalysis] = useState<DatasetSample | null>(null);

  const loadAnalysis = () => {
    // Load the latest analysis from localStorage
    // First, try to get the current analysis (most recent)
    const currentAnalysisStr = localStorage.getItem("currentAnalysis");
    if (currentAnalysisStr) {
      try {
        const currentAnalysis = JSON.parse(currentAnalysisStr);
        setLatestAnalysis(currentAnalysis);
        return;
      } catch (e) {
        console.error("Failed to load current analysis:", e);
      }
    }

    // If no current analysis, try to get from history
    const saved = localStorage.getItem("analysisHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // Get the most recent analysis (first item in the array)
          const latest = parsed[0];
          setLatestAnalysis(latest.result);
        }
      } catch (e) {
        console.error("Failed to load analysis:", e);
      }
    }
  };

  useEffect(() => {
    // Load analysis on mount
    loadAnalysis();

    // Listen for storage changes (when analysis is updated in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentAnalysis" || e.key === "analysisHistory") {
        loadAnalysis();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom storage events (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadAnalysis();
    };

    window.addEventListener("currentAnalysisUpdated", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("currentAnalysisUpdated", handleCustomStorageChange);
    };
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "person":
        return "bg-accent";
      case "emotion":
        return "bg-purple-500";
      case "location":
        return "bg-green-500";
      case "event":
        return "bg-orange-500";
      case "topic":
        return "bg-blue-500";
      default:
        return "bg-accent";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Audio Knowledge Graph</h1>
              <p className="text-muted-foreground">
                Visualize connections between speakers, emotions, and context
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="hover:bg-accent/10"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-16 text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="hover:bg-accent/10"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(100)}
                className="hover:bg-accent/10"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Graph Visualization */}
          <Card className="glass p-8">
            <div
              className="relative w-full h-[600px] bg-background/50 rounded-lg overflow-hidden"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
            >
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full">
                {connections.map((conn, i) => {
                  const fromNode = nodes.find((n) => n.id === conn.from);
                  const toNode = nodes.find((n) => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  return (
                    <line
                      key={i}
                      x1={`${fromNode.x}%`}
                      y1={`${fromNode.y}%`}
                      x2={`${toNode.x}%`}
                      y2={`${toNode.y}%`}
                      stroke="hsl(var(--accent))"
                      strokeWidth="2"
                      strokeOpacity="0.3"
                      className="transition-all duration-300 hover:stroke-opacity-60"
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div
                      className={`absolute inset-0 ${getNodeColor(
                        node.type
                      )} rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-all duration-300 pulse-glow`}
                    />
                    
                    {/* Node circle */}
                    <div
                      className={`relative w-16 h-16 ${getNodeColor(
                        node.type
                      )} rounded-full flex items-center justify-center text-white font-semibold shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {node.label.charAt(0)}
                    </div>
                    
                    {/* Label */}
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <div className="glass-strong px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {node.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Background Events */}
          {latestAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mt-6"
            >
              <Card className="border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-500">
                        <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-xl sm:text-2xl font-bold">Background Events</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">
                            {latestAnalysis.audio_event.replace(/_/g, " ").split(" ").map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(" ")}
                          </span>
                          <span className="text-muted-foreground">
                            {(latestAnalysis.mixing_ratios.nonspeech * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${latestAnalysis.mixing_ratios.nonspeech * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Legend */}
          <Card className="glass p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Legend</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { type: "person", label: "Person" },
                { type: "emotion", label: "Emotion" },
                { type: "location", label: "Location" },
                { type: "event", label: "Event" },
                { type: "topic", label: "Topic" },
              ].map((item) => (
                <div key={item.type} className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 ${getNodeColor(item.type)} rounded-full`}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
