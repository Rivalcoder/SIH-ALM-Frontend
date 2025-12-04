"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { History, UploadCloud, Loader, BotMessageSquare, PenSquare, Smile } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";
import { ChatMessage } from "@/lib/analyzeTypes";

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
  onFileProcessed: (file: File, result: DatasetSample, welcomeMessage: ChatMessage) => void;
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateAnalysisResult = (fileName: string): DatasetSample => {
    const audioId = `audio_${String(Date.now()).slice(-6)}`;
    const languages = ["hindi", "english", "tamil", "hinglish"];
    const audioEvents = ["dog_bark", "car_horn", "rain", "station_announcement", "crowd_noise"];
    const language = languages[Math.floor(Math.random() * languages.length)];
    const audioEvent = audioEvents[Math.floor(Math.random() * audioEvents.length)];
    const duration = 3 + Math.random() * 7;
    
    const transcriptions: Record<string, string> = {
      hindi: "इस मामले में कोर्ट द्वारा निर्देश दिया गया है",
      english: "The traffic signal at MG Road has been temporarily diverted.",
      tamil: "இன்று இரவு மழை பெய்யும் என்று வானிலை மையம் கூறியுள்ளது.",
      hinglish: "Railway station pe announcement thodi der ke liye delay ho gaya hai.",
    };

    const diarization = [
      { speaker: "spk_0", start: 0, end: duration / 2 },
      { speaker: "spk_1", start: duration / 2, end: duration },
    ];

    const questionAnswerPair = [
      {
        question: "What type of domain is the utterance talking about?",
        answer: language === "hindi" ? "Legal / court proceedings" : "Public announcement",
      },
      {
        question: "What is the primary language?",
        answer: language.charAt(0).toUpperCase() + language.slice(1),
      },
    ];

    const emotions = ["neutral", "happy", "sad", "angry", "excited", "calm"];
    const dominantEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const emotionScores = {
      neutral: Math.random() * 0.3 + 0.1,
      happy: Math.random() * 0.4 + 0.2,
      sad: Math.random() * 0.3 + 0.1,
      angry: Math.random() * 0.2 + 0.05,
      excited: Math.random() * 0.3 + 0.15,
      calm: Math.random() * 0.4 + 0.2,
    };
    const total = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    Object.keys(emotionScores).forEach(key => {
      emotionScores[key as keyof typeof emotionScores] /= total;
    });
    emotionScores[dominantEmotion as keyof typeof emotionScores] = Math.max(0.4, emotionScores[dominantEmotion as keyof typeof emotionScores]);

    const paralinguistics = {
      pitch: {
        mean: Math.random() * 100 + 150,
        std: Math.random() * 20 + 10,
        min: Math.random() * 50 + 100,
        max: Math.random() * 100 + 200,
      },
      emotions: emotionScores,
      dominant_emotion: dominantEmotion,
      speaking_rate: Math.random() * 0.5 + 2.0,
      energy: Math.random() * 0.4 + 0.3,
      spectral_centroid: Math.random() * 2000 + 1000,
    };

    return {
      audio_id: audioId,
      language: language,
      duration: parseFloat(duration.toFixed(2)),
      transcription: transcriptions[language] || transcriptions.english,
      diarization: diarization,
      audio_event: audioEvent,
      paralinguistics: paralinguistics,
      source: `openslr_${language}+esc50`,
      speech_source: {
        type: `openslr_${language}`,
        original_file: fileName,
        utterance_id: fileName.replace(/\.[^/.]+$/, ""),
      },
      nonspeech_source: {
        audio_event: audioEvent,
        source: "esc50",
        original_file: `nonspeech-${audioEvent}.wav`,
      },
      mixing_ratios: {
        speech: 0.7,
        nonspeech: 0.3,
      },
      question_answer_pair: questionAnswerPair,
    };
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("audio/")) {
      return;
    }

    setIsUploading(true);
    setIsAnalyzing(true);
    setFileName(file.name);
    setProgress(0);

    try {
      setProgress(10);
      setProgressMessage("Uploading audio...");
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(30);
      setProgressMessage("Transcribing audio...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(60);
      setProgressMessage("Analyzing content and emotions...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(90);
      setProgressMessage("Finalizing analysis...");
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setProgressMessage("Analysis complete!");

      const result = generateAnalysisResult(file.name);
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `I've analyzed your audio file "${file.name}". The analysis shows ${result.diarization.length} speakers, ${result.question_answer_pair.length} Q&A pairs, and detected "${result.audio_event}" as the audio event. How can I help you understand these results better?`,
        timestamp: new Date(),
      };
      
      onFileProcessed(file, result, welcomeMessage);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
      setProgress(0);
      setProgressMessage("");
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
                  className={`border-2 border-dashed rounded-2xl p-8 lg:p-12 relative overflow-hidden group cursor-pointer transition-all duration-300 ${
                    isDragOver 
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
                        <div className="relative">
                          <Loader className="h-16 w-16 animate-spin text-primary" />
                          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
                        </div>
                        <div className="space-y-4 text-center w-full">
                          <p className="text-xl font-bold font-headline">Analyzing {fileName}...</p>
                          <p className="text-sm text-foreground/70">{progressMessage}</p>
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

