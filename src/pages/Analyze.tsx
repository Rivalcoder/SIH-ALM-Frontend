"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Play, Pause } from "lucide-react";

export default function Analyze() {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setHasResults(true);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-5xl mx-auto fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Analyze Any Sound</h1>
          <p className="text-muted-foreground mb-8">
            Upload audio to extract transcript, emotions, events, and reasoning
          </p>

          {/* Waveform Viewer */}
          <Card className="glass p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Audio Waveform</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded-full hover:bg-accent/10"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-center h-40 space-x-1 bg-background/50 rounded-lg p-4">
              {[...Array(80)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-accent/50 rounded-full transition-all duration-300"
                  style={{
                    height: isAnalyzing
                      ? `${Math.random() * 100}%`
                      : hasResults
                      ? `${40 + Math.random() * 60}%`
                      : "20%",
                    animationDelay: `${i * 0.01}s`,
                  }}
                />
              ))}
            </div>
          </Card>

          {/* Upload Component */}
          {!hasResults && (
            <Card className="glass p-8 mb-8">
              <div
                className="border-2 border-dashed border-border rounded-lg p-16 text-center hover:border-accent transition-all cursor-pointer group"
                onClick={handleUpload}
              >
                {isUploading || isAnalyzing ? (
                  <div className="space-y-4">
                    <Loader2 className="h-12 w-12 mx-auto text-accent animate-spin" />
                    <p className="text-lg">
                      {isUploading ? "Uploading..." : "Analyzing audio..."}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground group-hover:text-accent transition-colors group-hover:scale-110 duration-300" />
                    <p className="text-lg mb-2">Drop your audio file here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports MP3, WAV, M4A, and more
                    </p>
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground hover-glow">
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Analysis Results */}
          {hasResults && (
            <div className="space-y-6 stagger-children">
              {/* Transcript */}
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-3 text-accent">
                  Transcript
                </h3>
                <p className="text-foreground leading-relaxed">
                  &quot;Hello, this is a customer service call regarding flight booking. 
                  I need to change my departure date from March 15th to March 20th. 
                  My booking reference is ABC123. Could you please help me with this change?&quot;
                </p>
              </Card>

              {/* Emotions */}
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-3 text-accent">
                  Detected Emotions
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "Polite", confidence: "95%" },
                    { label: "Urgent", confidence: "78%" },
                    { label: "Concerned", confidence: "82%" },
                    { label: "Professional", confidence: "90%" },
                  ].map((emotion) => (
                    <div
                      key={emotion.label}
                      className="px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium hover:bg-accent/30 transition-all cursor-pointer"
                    >
                      {emotion.label} ({emotion.confidence})
                    </div>
                  ))}
                </div>
              </Card>

              {/* Events */}
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-3 text-accent">
                  Detected Events
                </h3>
                <ul className="space-y-2">
                  {[
                    "Customer initiated call",
                    "Booking modification request",
                    "Reference number provided",
                    "Assistance requested",
                  ].map((event, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <span>{event}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Reasoning Steps */}
              <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-3 text-accent">
                  Chain-of-Thought Reasoning
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      step: 1,
                      thought: "Customer greeting detected with polite tone",
                    },
                    {
                      step: 2,
                      thought: "Request identified: Flight date modification",
                    },
                    {
                      step: 3,
                      thought: "Context established: Business travel scenario",
                    },
                    {
                      step: 4,
                      thought: "Action required: Booking system access needed",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex space-x-3">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold flex-shrink-0">
                        {item.step}
                      </div>
                      <p className="text-muted-foreground pt-0.5">{item.thought}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
