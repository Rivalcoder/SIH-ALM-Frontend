"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DatasetSample, DiarizationSegment, QuestionAnswer } from "@/lib/datasetSamples";
import {
  Upload,
  Loader2,
  Play,
  Pause,
  FileAudio,
  MessageSquare,
  History,
  X,
  Send,
  Bot,
  User,
  FileText,
  Sparkles,
  Users,
  Volume2,
  Clock,
  ChevronRight,
  AudioWaveform,
  Radio,
  Globe,
  Mic,
  Check,
  Copy,
  Layers,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AnalysisHistory {
  id: string;
  fileName: string;
  timestamp: Date;
  result: DatasetSample;
  chatMessages: ChatMessage[];
}

export default function Analyze() {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<AnalysisHistory | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<DatasetSample | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate a sample analysis result in the correct format
  const generateAnalysisResult = (fileName: string): DatasetSample => {
    const audioId = `audio_${String(Date.now()).slice(-6)}`;
    const languages = ["hindi", "english", "tamil", "hinglish"];
    const audioEvents = ["dog_bark", "car_horn", "rain", "station_announcement", "crowd_noise"];
    const language = languages[Math.floor(Math.random() * languages.length)];
    const audioEvent = audioEvents[Math.floor(Math.random() * audioEvents.length)];
    const duration = 3 + Math.random() * 7; // 3-10 seconds
    
    const transcriptions: Record<string, string> = {
      hindi: "इस मामले में कोर्ट द्वारा निर्देश दिया गया है",
      english: "The traffic signal at MG Road has been temporarily diverted.",
      tamil: "இன்று இரவு மழை பெய்யும் என்று வானிலை மையம் கூறியுள்ளது.",
      hinglish: "Railway station pe announcement thodi der ke liye delay ho gaya hai.",
    };

    const diarization: DiarizationSegment[] = [
      { speaker: "spk_0", start: 0, end: duration / 2 },
      { speaker: "spk_1", start: duration / 2, end: duration },
    ];

    const questionAnswerPair: QuestionAnswer[] = [
      {
        question: "What type of domain is the utterance talking about?",
        answer: language === "hindi" ? "Legal / court proceedings" : "Public announcement",
      },
      {
        question: "What is the primary language?",
        answer: language.charAt(0).toUpperCase() + language.slice(1),
      },
    ];

    // Generate paralinguistics data (pitch, emotions, etc.)
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
    // Normalize emotion scores
    const total = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    Object.keys(emotionScores).forEach(key => {
      emotionScores[key as keyof typeof emotionScores] /= total;
    });
    // Set dominant emotion higher
    emotionScores[dominantEmotion as keyof typeof emotionScores] = Math.max(0.4, emotionScores[dominantEmotion as keyof typeof emotionScores]);

    const paralinguistics = {
      pitch: {
        mean: Math.random() * 100 + 150, // Hz
        std: Math.random() * 20 + 10,
        min: Math.random() * 50 + 100,
        max: Math.random() * 100 + 200,
      },
      emotions: emotionScores,
      dominant_emotion: dominantEmotion,
      speaking_rate: Math.random() * 0.5 + 2.0, // words per second
      energy: Math.random() * 0.4 + 0.3, // normalized 0-1
      spectral_centroid: Math.random() * 2000 + 1000, // Hz
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

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      handleUpload(file);
    }
  };

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        const result = generateAnalysisResult(fileToUpload.name);
        setCurrentAnalysis(result);
        setHasResults(true);
        
        // Add initial welcome message
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: `I've analyzed your audio file "${fileToUpload.name}". The analysis shows ${result.diarization.length} speakers, ${result.question_answer_pair.length} Q&A pairs, and detected "${result.audio_event}" as the audio event. How can I help you understand these results better?`,
          timestamp: new Date(),
        };
        setChatMessages([welcomeMessage]);
      }, 2000);
    }, 1000);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading || !currentAnalysis) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(chatInput, currentAnalysis),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
      setIsChatLoading(false);
    }, 1500);
  };

  const generateAIResponse = (query: string, analysis: DatasetSample): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("diarization") || lowerQuery.includes("speaker")) {
      return `The analysis identified ${analysis.diarization.length} speakers: ${analysis.diarization.map(d => d.speaker).join(", ")}. Speaker ${analysis.diarization[0].speaker} spoke from ${analysis.diarization[0].start}s to ${analysis.diarization[0].end}s, and ${analysis.diarization[1]?.speaker || 'another speaker'} from ${analysis.diarization[1]?.start || 0}s to ${analysis.diarization[1]?.end || analysis.duration}s.`;
    }
    
    if (lowerQuery.includes("event") || lowerQuery.includes("audio event")) {
      return `The detected audio event is "${analysis.audio_event.replace(/_/g, " ")}". This non-speech event was mixed with the speech at a ratio of ${(analysis.mixing_ratios.nonspeech * 100).toFixed(0)}% non-speech to ${(analysis.mixing_ratios.speech * 100).toFixed(0)}% speech.`;
    }
    
    if (lowerQuery.includes("transcript") || lowerQuery.includes("said") || lowerQuery.includes("speech")) {
      return `The transcription in ${analysis.language} is: "${analysis.transcription}". The audio duration is ${analysis.duration} seconds.`;
    }
    
    if (lowerQuery.includes("question") || lowerQuery.includes("qa") || lowerQuery.includes("answer")) {
      return `The analysis generated ${analysis.question_answer_pair.length} Q&A pairs: ${analysis.question_answer_pair.map(qa => `"${qa.question}" → "${qa.answer}"`).join("; ")}.`;
    }
    
    if (lowerQuery.includes("language")) {
      return `The primary language detected is ${analysis.language.charAt(0).toUpperCase() + analysis.language.slice(1)}. The source is ${analysis.source}.`;
    }
    
    return `I can help you understand the analysis results. The audio has been processed and shows ${analysis.diarization.length} speakers, ${analysis.question_answer_pair.length} Q&A pairs, and a "${analysis.audio_event.replace(/_/g, " ")}" audio event. What specific aspect would you like to explore?`;
  };

  const saveToHistory = () => {
    if (!selectedFile || !hasResults || !currentAnalysis) return;

    const historyItem: AnalysisHistory = {
      id: Date.now().toString(),
      fileName: selectedFile.name,
      timestamp: new Date(),
      result: currentAnalysis,
      chatMessages: chatMessages,
    };

    setAnalysisHistory((prev) => [historyItem, ...prev]);
  };

  const loadFromHistory = (history: AnalysisHistory) => {
    setSelectedHistory(history);
    setHasResults(true);
    setCurrentAnalysis(history.result);
    setChatMessages(history.chatMessages);
    setSelectedFile(new File([], history.fileName));
  };

  const startNewAnalysis = () => {
    setSelectedFile(null);
    setAudioUrl(null);
    setHasResults(false);
    setCurrentAnalysis(null);
    setChatMessages([]);
    setSelectedHistory(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleCopy = () => {
    if (!currentAnalysis) return;
    const json = JSON.stringify(currentAnalysis, null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex relative pt-16">
        {/* Sidebar - Merged with Navbar */}
        <AnimatePresence>
          {showSidebar && (
            <>
              {/* Mobile overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                onClick={() => setShowSidebar(false)}
              />
              <motion.aside
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 max-w-[85vw] bg-card border-r border-border z-30 overflow-hidden shrink-0 lg:relative lg:top-0 lg:z-auto lg:max-w-none"
              >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-accent" />
                    <h2 className="font-semibold">Analysis History</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSidebar(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
            
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {analysisHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No previous analyses</p>
                        <p className="text-xs mt-1">Your analysis history will appear here</p>
                      </div>
                    ) : (
                      analysisHistory.map((history) => (
                        <Card
                          key={history.id}
                          className="p-3 cursor-pointer hover:bg-accent/5 transition-colors"
                          onClick={() => loadFromHistory(history)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <FileAudio className="h-4 w-4 text-accent shrink-0" />
                                <p className="font-medium text-sm truncate">{history.fileName}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {history.timestamp.toLocaleDateString()} {history.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-[10px]">
                                  {history.result.language}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px]">
                                  {history.result.diarization.length} speakers
                                </Badge>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </Card>
                      ))
                    )}
                </div>
              </ScrollArea>
            </div>
          </motion.aside>
          </>
        )}
      </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Audio Analysis Demo</h1>
                  <p className="text-muted-foreground">
                    Upload audio to extract transcript, emotions, events, and reasoning
                  </p>
                </div>
                {!showSidebar && (
                  <Button
                    variant="outline"
                    onClick={() => setShowSidebar(true)}
                    className="gap-2"
                  >
                    <History className="h-4 w-4" />
                    History
                  </Button>
                )}
              </div>

              {/* Upload Section - Only shown when no results */}
          {!hasResults && (
                <Card className="p-8">
              <div
                className="border-2 border-dashed border-border rounded-lg p-16 text-center hover:border-accent transition-all cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
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
                        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            </Card>
          )}

              {/* Tabs for Results and Chat - Only shown when results available */}
              {hasResults && (
                <Tabs defaultValue="analysis" className="w-full">
                  <div className="mb-6 border-b border-border">
                    <TabsList className="w-full max-w-md bg-transparent h-auto p-0 gap-1">
                      <TabsTrigger
                        value="analysis"
                        className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent py-3 px-4 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">Analysis Results</span>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger
                        value="chat"
                        className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent py-3 px-4 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">Chat</span>
                        </div>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Analysis Results Tab */}
                  <TabsContent value="analysis" className="mt-0 space-y-6">

                    {/* Audio Player */}
                    {selectedFile && (
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <FileAudio className="h-5 w-5 text-accent" />
                            <div>
                              <p className="font-medium">{selectedFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (audioRef.current) {
                                if (isPlaying) {
                                  audioRef.current.pause();
                                } else {
                                  audioRef.current.play();
                                }
                                setIsPlaying(!isPlaying);
                              }
                            }}
                          >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </Button>
                    </div>
                        {audioUrl && (
                          <audio ref={audioRef} src={audioUrl} className="hidden" />
                        )}
                        {isAnalyzing ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                          >
                            {/* Enhanced Processing Header */}
                            <div className="flex flex-col items-center justify-center gap-3">
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="relative"
                              >
                                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative p-4 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/40">
                                  <Loader2 className="h-8 w-8 text-accent animate-spin" />
                                </div>
                              </motion.div>
                              <div className="text-center">
                                <motion.p 
                                  className="text-lg font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent"
                                  animate={{ opacity: [0.7, 1, 0.7] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  Processing Audio...
                                </motion.p>
                                <p className="text-xs text-muted-foreground mt-1">Analyzing your audio file</p>
                              </div>
                            </div>

                            {/* Enhanced Audio Waveform Visualization */}
                            <div className="relative flex items-center justify-center h-48 space-x-0.5 bg-gradient-to-br from-accent/10 via-accent/5 to-background rounded-xl p-8 border-2 border-accent/30 shadow-2xl overflow-hidden">
                              {/* Animated background gradient */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5"
                                animate={{
                                  x: ['-100%', '100%'],
                                }}
                                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                              />
                              {[...Array(120)].map((_, i) => {
                                const delay = i * 0.01;
                                const baseHeight = 20;
                                const variation = 70;
                                return (
                                  <motion.div
                                    key={i}
                                    className="w-2 bg-gradient-to-t from-accent via-accent/90 to-accent/60 rounded-full shadow-lg"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{
                                      height: [
                                        `${baseHeight + Math.sin(i * 0.15) * variation}%`,
                                        `${baseHeight + Math.sin(i * 0.15 + Math.PI) * variation}%`,
                                        `${baseHeight + Math.sin(i * 0.15) * variation}%`,
                                      ],
                                      opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                      duration: 0.8 + Math.random() * 0.4,
                                      delay: delay,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }}
                                    style={{
                                      filter: `hue-rotate(${i * 3}deg)`,
                                    }}
                                  />
                                );
                              })}
                            </div>

                            {/* Enhanced Processing Steps */}
                            <div className="grid grid-cols-3 gap-4">
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
                              >
                                <motion.div
                                  animate={{ 
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0]
                                  }}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: Infinity,
                                    delay: 0
                                  }}
                                  className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
                                >
                                  <AudioWaveform className="h-5 w-5 text-blue-500" />
                                </motion.div>
                                <motion.p
                                  className="text-xs font-medium text-center"
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    delay: 0
                                  }}
                                >
                                  Analyzing Waveform
                                </motion.p>
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
                              >
                                <motion.div
                                  animate={{ 
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0]
                                  }}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: Infinity,
                                    delay: 0.3
                                  }}
                                  className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20"
                                >
                                  <Mic className="h-5 w-5 text-purple-500" />
                                </motion.div>
                                <motion.p
                                  className="text-xs font-medium text-center"
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    delay: 0.2
                                  }}
                                >
                                  Detecting Speakers
                                </motion.p>
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50"
                              >
                                <motion.div
                                  animate={{ 
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 10, -10, 0]
                                  }}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: Infinity,
                                    delay: 0.6
                                  }}
                                  className="p-2 rounded-lg bg-green-500/10 border border-green-500/20"
                                >
                                  <MessageSquare className="h-5 w-5 text-green-500" />
                                </motion.div>
                                <motion.p
                                  className="text-xs font-medium text-center"
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    delay: 0.4
                                  }}
                                >
                                  Transcribing
                                </motion.p>
                              </motion.div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex items-center justify-center h-32 space-x-1 bg-muted rounded-lg p-4">
                            {[...Array(80)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-accent/50 rounded-full"
                                animate={{
                                  height: hasResults
                                    ? `${40 + Math.random() * 60}%`
                                    : "20%",
                                }}
                                transition={{
                                  duration: 0.3,
                                  delay: i * 0.01,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </Card>
                    )}

                    {/* Analysis Results - Dataset Format */}
                    {currentAnalysis && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-semibold">Analysis Results</h2>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                              {copied ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  Copy JSON
                                </>
                              )}
                            </Button>
                            <Button variant="outline" size="sm" onClick={saveToHistory}>
                              Save to History
                            </Button>
                            <Button variant="outline" size="sm" onClick={startNewAnalysis}>
                              New Analysis
                            </Button>
                          </div>
                        </div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Card className="flex flex-col border-2 border-accent/30 bg-gradient-to-br from-background via-background to-accent/10 shadow-xl overflow-hidden">
                          {/* Enhanced Header with Gradient */}
                          <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative flex items-center justify-between border-b bg-gradient-to-r from-accent/20 via-accent/10 to-transparent px-6 py-5 shrink-0 overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-transparent" />
                            <div className="relative z-10 space-y-2 flex-1">
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-3"
                              >
                                <motion.div
                                  animate={{ rotate: [0, 5, -5, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                  className="p-2 rounded-lg bg-accent/20 backdrop-blur-sm"
                                >
                                  <AudioWaveform className="h-6 w-6 text-accent" />
                                </motion.div>
                                <div>
                                  <p className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    {currentAnalysis.audio_id}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">Audio Analysis Result</p>
                                </div>
                              </motion.div>
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-3 flex-wrap"
                              >
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-background/50 backdrop-blur-sm border-accent/30">
                                  <Globe className="h-3 w-3 mr-1" />
                                  {currentAnalysis.language.charAt(0).toUpperCase() + currentAnalysis.language.slice(1)}
                                </Badge>
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-background/50 backdrop-blur-sm border-accent/30">
                                  <Radio className="h-3 w-3 mr-1" />
                                  {currentAnalysis.audio_event.replace(/_/g, " ")}
                                </Badge>
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-background/50 backdrop-blur-sm border-accent/30">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {currentAnalysis.duration.toFixed(2)}s
                                </Badge>
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-background/50 backdrop-blur-sm border-accent/30">
                                  <Users className="h-3 w-3 mr-1" />
                                  {currentAnalysis.diarization.length} speakers
                                </Badge>
                              </motion.div>
                            </div>
                          </motion.div>

                          {/* Content */}
                          <div className="flex-1 overflow-auto">
                            <ScrollArea className="h-full w-full">
                              <div className="p-6 space-y-6">
                                {/* Transcription Section - Enhanced */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                                >
                                  <motion.div 
                                    className="flex items-center gap-3 mb-4"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <motion.div
                                      animate={{ scale: [1, 1.1, 1] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                      className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
                                    >
                                      <FileText className="h-5 w-5 text-blue-500" />
                                    </motion.div>
                                    <h3 className="text-base font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                                      Transcription
                                    </h3>
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    <Card className="p-5 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-2 border-blue-500/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                      <p className="text-base leading-relaxed font-medium text-foreground/90">
                                        {currentAnalysis.transcription}
                                      </p>
                                    </Card>
                                  </motion.div>
                                </motion.div>

                                {/* Metadata Grid - Enhanced */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
                                >
                                  <motion.div 
                                    className="flex items-center gap-3 mb-4"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <motion.div
                                      animate={{ rotate: [0, 5, -5, 0] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                      className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20"
                                    >
                                      <Layers className="h-5 w-5 text-purple-500" />
                                    </motion.div>
                                    <h3 className="text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                      Metadata
                                    </h3>
                                  </motion.div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <motion.div
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.3 }}
                                      whileHover={{ scale: 1.05, y: -2 }}
                                    >
                                      <Card className="p-4 bg-gradient-to-br from-purple-500/15 via-purple-500/10 to-transparent border-2 border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-center gap-2 mb-2">
                                          <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                          >
                                            <Globe className="h-4 w-4 text-purple-500" />
                                          </motion.div>
                                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</span>
                                        </div>
                                        <p className="text-sm font-bold text-foreground">{currentAnalysis.source}</p>
                                      </Card>
                                    </motion.div>
                                    <motion.div
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.35 }}
                                      whileHover={{ scale: 1.05, y: -2 }}
                                    >
                                      <Card className="p-4 bg-gradient-to-br from-green-500/15 via-green-500/10 to-transparent border-2 border-green-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-center gap-2 mb-2">
                                          <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                          >
                                            <Volume2 className="h-4 w-4 text-green-500" />
                                          </motion.div>
                                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Audio Event</span>
                                        </div>
                                        <p className="text-sm font-bold text-foreground capitalize">{currentAnalysis.audio_event.replace(/_/g, " ")}</p>
                                      </Card>
                                    </motion.div>
                                  </div>
                                </motion.div>

                                {/* Mixing Ratios - Enhanced */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                                >
                                  <motion.div 
                                    className="flex items-center gap-3 mb-4"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <motion.div
                                      animate={{ rotate: [0, 180, 360] }}
                                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                      className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
                                    >
                                      <Sparkles className="h-5 w-5 text-amber-500" />
                                    </motion.div>
                                    <h3 className="text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                      Mixing Ratios
                                    </h3>
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                  >
                                    <Card className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/30 shadow-lg">
                                      <div className="space-y-4">
                                        <div>
                                          <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                              <span className="text-sm font-semibold text-foreground">Speech</span>
                                            </div>
                                            <motion.span 
                                              className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              transition={{ delay: 0.5, type: "spring" }}
                                            >
                                              {(currentAnalysis.mixing_ratios.speech * 100).toFixed(0)}%
                                            </motion.span>
                                          </div>
                                          <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${currentAnalysis.mixing_ratios.speech * 100}%` }}
                                              transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 100 }}
                                              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-cyan-500 rounded-full shadow-lg"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                              <span className="text-sm font-semibold text-foreground">Non-Speech</span>
                                            </div>
                                            <motion.span 
                                              className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              transition={{ delay: 0.6, type: "spring" }}
                                            >
                                              {(currentAnalysis.mixing_ratios.nonspeech * 100).toFixed(0)}%
                                            </motion.span>
                                          </div>
                                          <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${currentAnalysis.mixing_ratios.nonspeech * 100}%` }}
                                              transition={{ duration: 1, delay: 0.6, type: "spring", stiffness: 100 }}
                                              className="h-full bg-gradient-to-r from-purple-500 via-pink-400 to-pink-500 rounded-full shadow-lg"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  </motion.div>
                                </motion.div>

                                {/* Paralinguistics - Pitch & Emotions - Enhanced */}
                                {currentAnalysis.paralinguistics && typeof currentAnalysis.paralinguistics === 'object' && 'pitch' in currentAnalysis.paralinguistics && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35, type: "spring", stiffness: 100 }}
                                  >
                                    <motion.div 
                                      className="flex items-center gap-3 mb-4"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                        className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20"
                                      >
                                        <AudioWaveform className="h-5 w-5 text-rose-500" />
                                      </motion.div>
                                      <h3 className="text-base font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                                        Paralinguistics Analysis
                                      </h3>
                                    </motion.div>
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.98 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.4 }}
                                    >
                                      <Card className="p-5 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-2 border-rose-500/30 shadow-lg space-y-5">
                                    {/* Pitch Analysis */}
                                    {'pitch' in currentAnalysis.paralinguistics && (
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-medium text-muted-foreground">Pitch Analysis</span>
                                          <span className="text-xs text-muted-foreground">
                                            Mean: {typeof currentAnalysis.paralinguistics.pitch === 'object' && 'mean' in currentAnalysis.paralinguistics.pitch 
                                              ? (currentAnalysis.paralinguistics.pitch as { mean: number }).mean.toFixed(0) 
                                              : 'N/A'} Hz
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 mb-3">
                                          {typeof currentAnalysis.paralinguistics.pitch === 'object' && (
                                            <>
                                              <div className="text-center">
                                                <p className="text-xs text-muted-foreground mb-1">Min</p>
                                                <p className="text-sm font-semibold">
                                                  {'min' in currentAnalysis.paralinguistics.pitch 
                                                    ? (currentAnalysis.paralinguistics.pitch as { min: number }).min.toFixed(0) 
                                                    : 'N/A'} Hz
                                                </p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-xs text-muted-foreground mb-1">Mean</p>
                                                <p className="text-sm font-semibold">
                                                  {'mean' in currentAnalysis.paralinguistics.pitch 
                                                    ? (currentAnalysis.paralinguistics.pitch as { mean: number }).mean.toFixed(0) 
                                                    : 'N/A'} Hz
                                                </p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-xs text-muted-foreground mb-1">Max</p>
                                                <p className="text-sm font-semibold">
                                                  {'max' in currentAnalysis.paralinguistics.pitch 
                                                    ? (currentAnalysis.paralinguistics.pitch as { max: number }).max.toFixed(0) 
                                                    : 'N/A'} Hz
                                                </p>
                                              </div>
                                              <div className="text-center">
                                                <p className="text-xs text-muted-foreground mb-1">Std Dev</p>
                                                <p className="text-sm font-semibold">
                                                  {'std' in currentAnalysis.paralinguistics.pitch 
                                                    ? (currentAnalysis.paralinguistics.pitch as { std: number }).std.toFixed(1) 
                                                    : 'N/A'} Hz
                                                </p>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        {/* Enhanced Pitch Graph Bars */}
                                        {typeof currentAnalysis.paralinguistics.pitch === 'object' && 'min' in currentAnalysis.paralinguistics.pitch && 'max' in currentAnalysis.paralinguistics.pitch && (
                                          <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="h-32 bg-gradient-to-br from-muted/80 via-muted/50 to-muted/30 rounded-xl p-4 flex items-end justify-center gap-1.5 border border-rose-500/20 shadow-inner"
                                          >
                                            {[...Array(30)].map((_, i) => {
                                              const pitch = currentAnalysis.paralinguistics.pitch as { min: number; mean: number; max: number; std: number };
                                              const range = pitch.max - pitch.min;
                                              const value = pitch.min + (range * (i / 29));
                                              const height = Math.abs(value - pitch.mean) < pitch.std 
                                                ? 85 
                                                : Math.max(25, 100 - Math.abs(value - pitch.mean) / pitch.std * 50);
                                              const isNearMean = Math.abs(value - pitch.mean) < pitch.std * 0.5;
                                              return (
                                                <motion.div
                                                  key={i}
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: `${height}%`, opacity: 1 }}
                                                  transition={{ 
                                                    duration: 0.6, 
                                                    delay: 0.5 + i * 0.015,
                                                    type: "spring",
                                                    stiffness: 100
                                                  }}
                                                  whileHover={{ scale: 1.2, zIndex: 10 }}
                                                  className="flex-1 bg-gradient-to-t from-rose-600 via-rose-400 to-rose-300 rounded-t-md shadow-lg hover:shadow-xl transition-shadow"
                                                  style={{ 
                                                    minHeight: '8px',
                                                    filter: isNearMean ? 'brightness(1.2)' : 'brightness(1)'
                                                  }}
                                                />
                                              );
                                            })}
                                          </motion.div>
                                        )}
                                      </div>
                                    )}

                                    {/* Emotions Analysis */}
                                    {'emotions' in currentAnalysis.paralinguistics && (
                                      <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-medium text-muted-foreground">Emotion Analysis</span>
                                          {'dominant_emotion' in currentAnalysis.paralinguistics && (
                                            <Badge variant="secondary" className="text-xs capitalize">
                                              {String(currentAnalysis.paralinguistics.dominant_emotion)}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="space-y-3">
                                          {typeof currentAnalysis.paralinguistics.emotions === 'object' && Object.entries(currentAnalysis.paralinguistics.emotions as Record<string, number>).map(([emotion, score], idx) => (
                                            <motion.div
                                              key={emotion}
                                              initial={{ opacity: 0, x: -20 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: 0.6 + idx * 0.1 }}
                                              whileHover={{ scale: 1.02 }}
                                            >
                                              <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                  <div className={`w-2 h-2 rounded-full ${
                                                    emotion === 'happy' || emotion === 'excited' 
                                                      ? 'bg-yellow-500 animate-pulse'
                                                      : emotion === 'sad' || emotion === 'angry'
                                                      ? 'bg-blue-500 animate-pulse'
                                                      : 'bg-gray-500 animate-pulse'
                                                  }`} />
                                                  <span className="text-sm font-semibold text-foreground capitalize">{emotion}</span>
                                                </div>
                                                <motion.span 
                                                  className="text-base font-bold"
                                                  initial={{ scale: 0 }}
                                                  animate={{ scale: 1 }}
                                                  transition={{ delay: 0.7 + idx * 0.1, type: "spring" }}
                                                >
                                                  {(score * 100).toFixed(1)}%
                                                </motion.span>
                                              </div>
                                              <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                                                <motion.div
                                                  initial={{ width: 0 }}
                                                  animate={{ width: `${score * 100}%` }}
                                                  transition={{ duration: 1, delay: 0.7 + idx * 0.1, type: "spring", stiffness: 100 }}
                                                  className={`h-full rounded-full shadow-lg ${
                                                    emotion === 'happy' || emotion === 'excited' 
                                                      ? 'bg-gradient-to-r from-yellow-500 via-orange-400 to-orange-500'
                                                      : emotion === 'sad' || emotion === 'angry'
                                                      ? 'bg-gradient-to-r from-blue-500 via-indigo-400 to-indigo-500'
                                                      : 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
                                                  }`}
                                                />
                                              </div>
                                            </motion.div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Additional Metrics */}
                                    {('speaking_rate' in currentAnalysis.paralinguistics || 'energy' in currentAnalysis.paralinguistics) && (
                                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-rose-500/20">
                                        {'speaking_rate' in currentAnalysis.paralinguistics && (
                                          <div>
                                            <p className="text-xs text-muted-foreground mb-1">Speaking Rate</p>
                                            <p className="text-sm font-semibold">
                                              {typeof currentAnalysis.paralinguistics.speaking_rate === 'number' 
                                                ? currentAnalysis.paralinguistics.speaking_rate.toFixed(2) 
                                                : 'N/A'} words/sec
                                            </p>
                                          </div>
                                        )}
                                        {'energy' in currentAnalysis.paralinguistics && (
                                          <div>
                                            <p className="text-xs text-muted-foreground mb-1">Energy Level</p>
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <motion.div
                                                  initial={{ width: 0 }}
                                                  animate={{ width: `${(typeof currentAnalysis.paralinguistics.energy === 'number' ? currentAnalysis.paralinguistics.energy : 0) * 100}%` }}
                                                  transition={{ duration: 0.8, delay: 0.5 }}
                                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                                />
                                              </div>
                                              <span className="text-xs font-medium">
                                                {typeof currentAnalysis.paralinguistics.energy === 'number' 
                                                  ? (currentAnalysis.paralinguistics.energy * 100).toFixed(0) 
                                                  : '0'}%
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                      </Card>
                                    </motion.div>
                                  </motion.div>
                                )}

                                {/* Diarization - Enhanced */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                                >
                                  <motion.div 
                                    className="flex items-center gap-3 mb-4"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <motion.div
                                      animate={{ scale: [1, 1.1, 1] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                      className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
                                    >
                                      <Users className="h-5 w-5 text-indigo-500" />
                                    </motion.div>
                                    <h3 className="text-base font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                      Speaker Diarization ({currentAnalysis.diarization.length} segments)
                                    </h3>
                                  </motion.div>
                                  <div className="space-y-3">
                                    {currentAnalysis.diarization.map((segment, idx) => (
                                      <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        transition={{ delay: 0.5 + idx * 0.08, type: "spring", stiffness: 100 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                      >
                                        <Card className="p-4 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-2 border-indigo-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                              <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                                className="p-1.5 rounded-lg bg-indigo-500/20"
                                              >
                                                <Mic className="h-4 w-4 text-indigo-500" />
                                              </motion.div>
                                              <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold bg-indigo-500/20 border-indigo-500/30">
                                                {segment.speaker}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                              <span className="px-2 py-1 rounded bg-muted/50">{segment.start.toFixed(2)}s</span>
                                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                              <span className="px-2 py-1 rounded bg-muted/50">{segment.end.toFixed(2)}s</span>
                                              <span className="ml-2 text-xs text-muted-foreground">
                                                ({(segment.end - segment.start).toFixed(2)}s)
                                              </span>
                                            </div>
                                          </div>
                                          {/* Enhanced Timeline visualization */}
                                          <div className="mt-3 h-4 bg-muted/50 rounded-full overflow-hidden relative shadow-inner">
                                            <motion.div
                                              initial={{ width: 0, x: `${(segment.start / currentAnalysis.duration) * 100}%` }}
                                              animate={{ width: `${((segment.end - segment.start) / currentAnalysis.duration) * 100}%` }}
                                              transition={{ duration: 0.8, delay: 0.6 + idx * 0.08, type: "spring", stiffness: 100 }}
                                              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                                            />
                                          </div>
                                        </Card>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>

                                {/* Question-Answer Pairs - Enhanced */}
                                {currentAnalysis.question_answer_pair.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45, type: "spring", stiffness: 100 }}
                                  >
                                    <motion.div 
                                      className="flex items-center gap-3 mb-4"
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                        className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                                      >
                                        <MessageSquare className="h-5 w-5 text-emerald-500" />
                                      </motion.div>
                                      <h3 className="text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                        Q&A Pairs ({currentAnalysis.question_answer_pair.length})
                                      </h3>
                                    </motion.div>
                                    <div className="space-y-4">
                                      {currentAnalysis.question_answer_pair.map((qa, idx) => (
                                        <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          transition={{ delay: 0.5 + idx * 0.1, type: "spring", stiffness: 100 }}
                                          whileHover={{ scale: 1.02, y: -2 }}
                                        >
                                          <Card className="p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 shadow-lg hover:shadow-xl transition-all duration-300 space-y-4">
                                            <div className="flex items-start gap-3">
                                              <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                                className="mt-0.5 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30"
                                              >
                                                <MessageSquare className="h-4 w-4 text-emerald-500" />
                                              </motion.div>
                                              <div className="flex-1 space-y-2">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Question</p>
                                                <p className="text-base font-semibold text-foreground leading-relaxed">{qa.question}</p>
                                              </div>
                                            </div>
                                            <Separator className="bg-emerald-500/30" />
                                            <div className="flex items-start gap-3">
                                              <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                                className="mt-0.5 p-2 rounded-lg bg-emerald-500/30 border border-emerald-500/40"
                                              >
                                                <Check className="h-4 w-4 text-emerald-600" />
                                              </motion.div>
                                              <div className="flex-1 space-y-2">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Answer</p>
                                                <p className="text-base font-bold text-foreground leading-relaxed bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{qa.answer}</p>
                                              </div>
                                            </div>
                                          </Card>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}

                                {/* Source Information - Enhanced */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                                >
                                  <Separator className="my-6" />
                                  <motion.div 
                                    className="flex items-center gap-3 mb-4"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <motion.div
                                      animate={{ rotate: [0, 5, -5, 0] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                      className="p-2 rounded-lg bg-slate-500/10 border border-slate-500/20"
                                    >
                                      <Layers className="h-5 w-5 text-slate-500" />
                                    </motion.div>
                                    <h3 className="text-base font-bold bg-gradient-to-r from-slate-600 to-slate-400 bg-clip-text text-transparent">
                                      Source Information
                                    </h3>
                                  </motion.div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <motion.div
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.55 }}
                                      whileHover={{ scale: 1.03, y: -2 }}
                                    >
                                      <Card className="p-4 bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border-2 border-slate-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-center gap-2 mb-3">
                                          <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                            className="p-1.5 rounded-lg bg-slate-500/20"
                                          >
                                            <FileAudio className="h-4 w-4 text-slate-500" />
                                          </motion.div>
                                          <span className="text-sm font-bold text-foreground">Speech Source</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">Type</span>
                                            <span className="font-bold">{currentAnalysis.speech_source.type}</span>
                                          </div>
                                          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">File</span>
                                            <span className="font-bold text-xs truncate max-w-[200px]">{currentAnalysis.speech_source.original_file}</span>
                                          </div>
                                          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">ID</span>
                                            <span className="font-bold">{currentAnalysis.speech_source.utterance_id}</span>
                                          </div>
                                        </div>
                                      </Card>
                                    </motion.div>
                                    <motion.div
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.6 }}
                                      whileHover={{ scale: 1.03, y: -2 }}
                                    >
                                      <Card className="p-4 bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border-2 border-slate-500/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-center gap-2 mb-3">
                                          <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                                            className="p-1.5 rounded-lg bg-slate-500/20"
                                          >
                                            <Radio className="h-4 w-4 text-slate-500" />
                                          </motion.div>
                                          <span className="text-sm font-bold text-foreground">Non-Speech Source</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">Event</span>
                                            <span className="font-bold capitalize">{currentAnalysis.nonspeech_source.audio_event.replace(/_/g, " ")}</span>
                                          </div>
                                          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">Source</span>
                                            <span className="font-bold">{currentAnalysis.nonspeech_source.source}</span>
                                          </div>
                                          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">File</span>
                                            <span className="font-bold text-xs truncate max-w-[200px]">{currentAnalysis.nonspeech_source.original_file}</span>
                                          </div>
                                        </div>
                                      </Card>
                                    </motion.div>
                                  </div>
                                </motion.div>
                              </div>
                            </ScrollArea>
                          </div>
                        </Card>
                      </motion.div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Chat Tab - Enhanced */}
                  <TabsContent value="chat" className="mt-0">
                    <Card className="h-[calc(100vh-12rem)] min-h-[600px] flex flex-col border-2 border-accent/30 bg-gradient-to-br from-background via-background to-accent/10 shadow-xl">
                      <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-accent/10 to-transparent">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                              className="p-2 rounded-lg bg-accent/20 border border-accent/30"
                            >
                              <MessageSquare className="h-5 w-5 text-accent" />
                            </motion.div>
                            <div>
                              <h3 className="text-base font-bold">Chat Assistant</h3>
                              <p className="text-xs text-muted-foreground">Ask questions about your audio analysis</p>
                            </div>
                          </div>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                          <div className="space-y-5">
                            {chatMessages.length === 0 ? (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-16 text-center"
                              >
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                                  className="relative mb-6"
                                >
                                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                                  <div className="relative p-6 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/40">
                                    <Bot className="h-12 w-12 text-accent" />
                                  </div>
                                </motion.div>
                                <motion.h3
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                  className="text-lg font-bold mb-2 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent"
                                >
                                  Start a Conversation
                                </motion.h3>
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                  className="text-sm text-muted-foreground max-w-sm"
                                >
                                  Ask me anything about your audio analysis results, transcription, speakers, or emotions!
                                </motion.p>
                              </motion.div>
                            ) : (
                              chatMessages.map((message, idx) => (
                                <motion.div
                                  key={message.id}
                                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                                  className={`flex gap-4 items-start ${
                                    message.role === "user" ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  {message.role === "assistant" && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: "spring", delay: idx * 0.05 }}
                                      className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center shrink-0 border-2 border-blue-500/40 shadow-lg"
                                    >
                                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </motion.div>
                                  )}
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, x: message.role === "user" ? 20 : -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05, type: "spring" }}
                                    className={`max-w-[75%] rounded-2xl shadow-lg ${
                                      message.role === "user"
                                        ? "bg-gradient-to-br from-accent to-accent/90 text-accent-foreground rounded-br-sm"
                                        : "bg-gradient-to-br from-muted/90 to-muted/70 backdrop-blur-sm border border-border/60 rounded-bl-sm"
                                    }`}
                                  >
                                    <div className="p-4">
                                      <p className={`leading-relaxed ${
                                        message.role === "user" ? "text-sm font-medium" : "text-sm"
                                      }`}>
                                        {message.content}
                                      </p>
                                      <div className="flex items-center gap-1 mt-3">
                                        <Clock className={`h-3 w-3 ${
                                          message.role === "user" ? "text-accent-foreground/70" : "text-muted-foreground"
                                        }`} />
                                        <p className={`text-xs ${
                                          message.role === "user" ? "text-accent-foreground/70" : "text-muted-foreground"
                                        }`}>
                                          {message.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  </motion.div>
                                  {message.role === "user" && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: 180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: "spring", delay: idx * 0.05 }}
                                      className="h-10 w-10 rounded-full bg-gradient-to-br from-accent/30 to-accent/20 flex items-center justify-center shrink-0 border-2 border-accent/40 shadow-lg"
                                    >
                                      <User className="h-5 w-5 text-accent" />
                                    </motion.div>
                                  )}
                                </motion.div>
                              ))
                            )}
                            {isChatLoading && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 items-start justify-start"
                              >
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center shrink-0 border-2 border-blue-500/40 shadow-lg">
                                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <motion.div
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="bg-gradient-to-br from-muted/90 to-muted/70 backdrop-blur-sm border border-border/60 rounded-2xl rounded-bl-sm shadow-lg p-4"
                                >
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                  </div>
                                </motion.div>
                              </motion.div>
                            )}
                            <div ref={chatEndRef} />
                          </div>
                        </ScrollArea>

                        {/* Enhanced Input Form */}
                        <form onSubmit={handleChatSubmit} className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
                          <div className="flex gap-3 items-end">
                            <div className="flex-1 relative">
                              <Textarea
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type your question about the analysis..."
                                className="min-h-[70px] max-h-[150px] resize-none bg-background border-2 border-border/60 focus:border-accent/50 rounded-xl p-4 pr-12 text-sm shadow-sm"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleChatSubmit(e);
                                  }
                                }}
                              />
                              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                                Press Enter to send
                              </div>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                type="submit"
                                disabled={!chatInput.trim() || isChatLoading}
                                className="h-[70px] w-[70px] shrink-0 bg-gradient-to-br from-accent to-accent/90 hover:from-accent/90 hover:to-accent text-accent-foreground shadow-lg rounded-xl"
                                size="icon"
                              >
                                {isChatLoading ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Send className="h-5 w-5" />
                                )}
                              </Button>
                            </motion.div>
                          </div>
                        </form>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
