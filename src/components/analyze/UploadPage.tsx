"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { History, UploadCloud, Loader, BotMessageSquare, PenSquare, Smile } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";
import { ChatMessage } from "@/lib/analyzeTypes";
import { processAudio } from "@/lib/api/client";
import { mapApiResponseToDatasetSample } from "@/lib/api/mapper";
import { generateDummyAudioResponse } from "@/lib/api/dummyData";
import { useToast } from "@/hooks/use-toast";
import { ProcessingTimeline, ProcessingStep } from "@/components/analyze/ProcessingTimeline";

const features = [
  {
    icon: Smile,
    title: 'Emotional Tone Detection',
    description: "Leverage GenAI to analyze and detect nuanced emotional tones in every speaker's voice.",
  },
  {
    icon: BotMessageSquare,
    title: 'Generative AI Chat',
    description: 'Ask complex questions about your audio analysis results and get instant, intelligent answers from our AI.',
  },
  {
    icon: PenSquare,
    title: 'Clear Result Visualization',
    description: 'View all findings—speaker count, background sounds, emotional tones—in a beautifully clear and interactive format.',
  },
];

interface UploadPageProps {
  onFileProcessed: (file: File, result: DatasetSample, welcomeMessage: ChatMessage, sessionId: string) => void;
  showSidebar: boolean;
  onShowSidebar: () => void;
}

export function UploadPage({ onFileProcessed, showSidebar, onShowSidebar }: UploadPageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>("processing_audio");
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);


  const processFile = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an audio file.",
      });
      return;
    }

    setIsUploading(true);
    setIsAnalyzing(true);
    setFileName(file.name);
    setProgress(0);
    setCurrentStep("processing_audio");

    try {
      setProgress(10);
      setProgressMessage("Processing audio file...");
      setCurrentStep("processing_audio");

      // Call the real API
      const apiResponse = await processAudio(file);

      setProgress(30);
      setProgressMessage("Processing transcription...");
      setCurrentStep("transcription");

      setProgress(60);
      setProgressMessage("Detecting emotions...");
      setCurrentStep("emotion_detection");

      setProgress(90);
      setProgressMessage("Final reasoning...");
      setCurrentStep("final_reasoning");

      // Map API response to DatasetSample format
      const result = mapApiResponseToDatasetSample(apiResponse, file.name);

      setProgress(100);
      setProgressMessage("Analysis complete!");
      setCurrentStep("complete");

      // Count unique speakers
      const uniqueSpeakers = new Set(
        result.diarization.map(seg => seg.speaker).filter(Boolean)
      );
      const speakerCount = uniqueSpeakers.size || result.diarization.length;

      // Get language name (dynamic import to avoid circular dependencies)
      const languageUtils = await import("@/lib/languageUtils");
      const languageName = languageUtils.getLanguageName(result.language);

      // Create welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `I've analyzed your audio file "${file.name}". The analysis shows ${speakerCount} speaker${speakerCount !== 1 ? "s" : ""}, detected language "${languageName}", and identified "${result.audio_event.replace(/_/g, " ")}" as the audio event. How can I help you understand these results better?`,
        timestamp: new Date(),
      };

      // Pass session_id along with the result
      onFileProcessed(file, result, welcomeMessage, apiResponse.session_id);
    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorString = String(error);
      
      // Check if all API endpoints failed (check for various forms of the error message)
      // Network errors, fetch failures, or API endpoint failures should trigger dummy data
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
      
      console.log("Error details:", { error, errorMessage, errorString, isApiFailure });
      
      // Always load dummy data for any error (since API is down)
      // This ensures the app continues to work even with API failures
      console.log("Loading dummy data due to API failure...");
      setProgress(10);
      setProgressMessage("Processing audio file...");
      setCurrentStep("processing_audio");

      try {
        // Generate dummy API response
        const dummyApiResponse = generateDummyAudioResponse(file.name);

        setProgress(30);
        setProgressMessage("Processing transcription...");
        setCurrentStep("transcription");

        setProgress(60);
        setProgressMessage("Detecting emotions...");
        setCurrentStep("emotion_detection");

        setProgress(90);
        setProgressMessage("Final reasoning...");
        setCurrentStep("final_reasoning");

        // Map dummy API response to DatasetSample format
        const result = mapApiResponseToDatasetSample(dummyApiResponse, file.name);

        setProgress(100);
        setProgressMessage("Analysis complete!");
        setCurrentStep("complete");

        // Count unique speakers
        const uniqueSpeakers = new Set(
          result.diarization.map(seg => seg.speaker).filter(Boolean)
        );
        const speakerCount = uniqueSpeakers.size || result.diarization.length;

        // Get language name (dynamic import to avoid circular dependencies)
        const languageUtils = await import("@/lib/languageUtils");
        const languageName = languageUtils.getLanguageName(result.language);

        // Create welcome message
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `[Offline mode] The API is unavailable, so I generated placeholder analysis for "${file.name}". The analysis shows ${speakerCount} speaker${speakerCount !== 1 ? "s" : ""}, detected language "${languageName}", and identified "${result.audio_event.replace(/_/g, " ")}" as the audio event. Replace with live results once connectivity is restored.`,
          timestamp: new Date(),
        };

        // Pass session_id along with the result
        onFileProcessed(file, result, welcomeMessage, dummyApiResponse.session_id);

        toast({
          variant: "default",
          title: "Offline placeholder loaded",
          description: "API unavailable. Showing placeholder analysis so you can continue.",
        });
      } catch (dummyDataError) {
        // If dummy data loading also fails, show error
        console.error("Failed to load dummy data:", dummyDataError);
        toast({
          variant: "destructive",
          title: "Analysis failed",
          description: errorMessage || "Failed to process audio file and load dummy data.",
        });
      }
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      setProgress(0);
      setProgressMessage("");
      setCurrentStep("processing_audio");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleUploadAreaClick = () => {
    if (!isUploading && !isAnalyzing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-gradient-shift"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float-reverse"></div>

        <div className="container mx-auto p-4 md:p-6 lg:p-8 relative z-10">
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Header */}
            <div className="relative mb-8">
              {!showSidebar && (
                <Button
                  variant="outline"
                  onClick={onShowSidebar}
                  className="gap-2 absolute top-0 right-0 z-10"
                >
                  <History className="h-4 w-4" />
                  History
                </Button>
              )}
            </div>

            {/* Enhanced header section */}
            <div className="text-center space-y-6 animate-fade-in-up">
              <div className="inline-block bg-primary/10 text-primary px-6 py-3 rounded-full font-semibold text-sm mb-4 animate-fade-in-up">
                🎵 Audio Analysis Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                Upload Your <span className="text-gradient-animate">Audio</span>
              </h1>
              <p className="text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Select an audio file for analysis and get instant insights powered by advanced AI technology.
              </p>
              <div
                className="h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto"
                style={{
                  animationDelay: '300ms',
                  animation: 'underline-grow 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                  width: '0px'
                }}
              ></div>
            </div>

            {/* Upload Section */}
            <Card className="text-center shadow-2xl hover:shadow-primary/20 transition-all duration-500 border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <CardContent className="p-8 lg:p-12">
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 lg:p-12 relative overflow-hidden group cursor-pointer transition-all duration-300 ${isDragOver
                      ? 'border-primary bg-primary/10 scale-105'
                      : isUploading || isAnalyzing
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadAreaClick}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="flex flex-col items-center justify-center space-y-6 relative z-10">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading || isAnalyzing}
                    />
                    {isUploading || isAnalyzing ? (
                      <>
                        <div className="relative mb-6">
                          <Loader className="h-16 w-16 animate-spin text-primary" />
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
                        </div>
                        <div className="space-y-6 text-center w-full">
                          <div>
                            <p className="text-xl font-bold font-headline mb-2">Analyzing {fileName}...</p>
                            <p className="text-sm text-foreground/70">{progressMessage}</p>
                          </div>
                          
                          {/* Processing Timeline */}
                          <div className="w-full py-4">
                            <ProcessingTimeline currentStep={currentStep} />
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full max-w-2xl mx-auto">
                            <Progress value={progress} className="w-full h-3" />
                            <div className="flex justify-between text-xs text-foreground/60 mt-2">
                              <span>0%</span>
                              <span className="font-semibold text-primary">{progress}%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
                          <div className="relative w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30">
                            <UploadCloud className="h-10 w-10 text-primary animate-bounce-gentle" />
                          </div>

                          {/* Floating particles around icon */}
                          <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary/60 rounded-full animate-float-particle-1"></div>
                          <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-accent/60 rounded-full animate-float-particle-2"></div>
                          <div className="absolute -top-4 -left-4 w-2.5 h-2.5 bg-primary/50 rounded-full animate-float-particle-1" style={{ animationDelay: '1s' }}></div>
                        </div>

                        <div className="space-y-4 text-center">
                          <h3 className="text-2xl font-bold font-headline">
                            {isDragOver ? 'Drop your audio file here' : 'Click anywhere to upload or drag and drop'}
                          </h3>
                          <p className="text-lg text-foreground/70">
                            Supports MP3, WAV, M4A, FLAC, and more audio formats
                          </p>
                          {isDragOver && (
                            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold animate-fade-in-up">
                              <UploadCloud className="h-4 w-4" />
                              Release to upload
                            </div>
                          )}
                        </div>

                        <div className="relative inline-block">
                          <div className="relative bg-gradient-to-r from-primary to-accent dark:from-accent dark:to-accent/80 text-primary-foreground dark:text-accent-foreground font-bold px-8 py-4 rounded-xl hover:from-primary/90 hover:to-accent/90 dark:hover:from-accent/90 dark:hover:to-accent/70 transition-all duration-300 hover:scale-105 text-lg shadow-lg dark:shadow-accent/20 hover:shadow-xl dark:hover:shadow-accent/30 inline-block group border border-primary/30 dark:border-accent/40">
                            <span className="flex items-center gap-2">
                              <UploadCloud className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                              Browse File
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced features section */}
            <section id="features-mini" className="w-full py-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4 animate-fade-in-up">What You&apos;ll Get</h2>
                <p className="text-lg text-foreground/70 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                  Advanced AI-powered analysis with comprehensive insights
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="group bg-card/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 ease-out border border-transparent hover:border-primary/30 animate-fade-in-up feature-card relative overflow-hidden" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Enhanced icon container */}
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <feature.icon className="w-8 h-8 relative z-10 group-hover:animate-bounce-gentle" />

                      {/* Floating particles around icon */}
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary/40 rounded-full animate-float-particle-1"></div>
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-accent/40 rounded-full animate-float-particle-2"></div>
                    </div>

                    <h3 className="text-xl font-bold font-headline mb-3 group-hover:text-primary transition-colors duration-300 relative z-10">
                      {feature.title}
                    </h3>
                    <p className="text-card-foreground/80 leading-relaxed group-hover:text-card-foreground transition-colors duration-300 relative z-10">
                      {feature.description}
                    </p>

                    {/* Animated border effect */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all duration-500"></div>

                    {/* Hover shine effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

