"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DatasetSample } from "@/lib/datasetSamples";
import { ChatMessage } from "@/lib/analyzeTypes";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Play,
  Pause,
  FileAudio,
  MessageSquare,
  History,
  FileText,
  Users,
  Globe,
  Wind,
  Download,
  Loader,
  Target,
  ListTodo,
  Hand,
  Info,
  Gauge,
  Text,
  BotMessageSquare,
  Sparkles,
  Send,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsPageProps {
  selectedFile: File | null;
  audioUrl: string | null;
  currentAnalysis: DatasetSample | null;
  chatMessages: ChatMessage[];
  onNewAnalysis: () => void;
  onSaveToHistory: () => void;
  showSidebar: boolean;
  onShowSidebar: () => void;
}

// Helper function to build diarized transcript from DatasetSample
const buildDiarizedTranscript = (analysis: DatasetSample): string => {
  if (!analysis.diarization || analysis.diarization.length === 0) {
    return analysis.transcription;
  }

  const segments = analysis.diarization.map((seg, idx) => {
    const speakerLabel = seg.speaker || `Speaker ${idx + 1}`;
    return `${speakerLabel}: ${analysis.transcription}`;
  });

  return segments.join("\n\n");
};

// Simple translation function (placeholder - can be enhanced with actual API)
const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (targetLanguage === "Original") {
        resolve(text);
      } else {
        resolve(`[Translated to ${targetLanguage}]\n${text}`);
      }
    }, 1000);
  });
};

const ChartCard = ({
  title,
  description,
  children,
  className,
  index,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay: (index || 0) * 0.1 }}
    className={className}
  >
    <Card className="glass-strong border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </motion.div>
);

const InsightCard = ({
  title,
  icon: Icon,
  data,
  emptyText,
  index,
  gradient,
}: {
  title: string;
  icon: React.ElementType;
  data: string[];
  emptyText: string;
  index?: number;
  gradient?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay: (index || 0) * 0.1 }}
    whileHover={{ scale: 1.02, y: -5 }}
    className="h-full"
  >
    <Card className="glass-strong border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg bg-gradient-to-br", gradient || "from-accent/20 to-accent/10")}>
            <Icon className="h-5 w-5 text-accent" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <ul className="space-y-2 list-disc pl-5 text-foreground/80">
            {data.map((item, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index || 0) * 0.1 + idx * 0.05 }}
              >
                {item}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-foreground/60">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  index,
  gradient,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  index?: number;
  gradient?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay: (index || 0) * 0.1, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="h-full"
  >
    <Card className="glass-strong border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent/20 h-full relative overflow-hidden group">
      {/* Animated gradient background */}
      <motion.div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl",
          gradient || "bg-gradient-to-br from-accent/30 via-accent/20 to-transparent"
        )}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
          <Icon className="h-5 w-5 text-accent" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <motion.div
          className="text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (index || 0) * 0.1 + 0.2 }}
        >
          {value}
        </motion.div>
        <p className="text-xs text-foreground/60">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export function ResultsPage({
  selectedFile,
  audioUrl,
  currentAnalysis,
  chatMessages: initialChatMessages,
  onNewAnalysis,
  onSaveToHistory,
  showSidebar,
  onShowSidebar,
}: ResultsPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [translatedTranscript, setTranslatedTranscript] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>("Original");
  const [showDiarization, setShowDiarization] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { toast } = useToast();

  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  useEffect(() => {
    setChatMessages(initialChatMessages);
  }, [initialChatMessages]);

  const handleLanguageChange = async (lang: string) => {
    setTargetLanguage(lang);
    if (lang === "Original" || !currentAnalysis?.transcription) {
      setTranslatedTranscript(null);
      return;
    }
    setIsTranslating(true);
    try {
      const transcriptToTranslate = showDiarization
        ? buildDiarizedTranscript(currentAnalysis)
        : currentAnalysis.transcription;
      const translated = await translateText(transcriptToTranslate, lang);
      setTranslatedTranscript(translated);
    } catch (error) {
      console.error("Translation failed", error);
      toast({
        variant: "destructive",
        title: "Translation Error",
        description: `Failed to translate to ${lang}.`,
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExport = () => {
    if (!currentAnalysis || !selectedFile) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(currentAnalysis, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${selectedFile.name.split(".")[0]}_analysis.json`;
    link.click();
    toast({
      title: "Exported!",
      description: "The analysis report has been downloaded.",
    });
  };

  const generateAIResponse = (query: string, analysis: DatasetSample): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("diarization") || lowerQuery.includes("speaker")) {
      return `The analysis identified ${analysis.diarization.length} speakers: ${analysis.diarization
        .map((d) => d.speaker)
        .join(", ")}. Speaker ${analysis.diarization[0].speaker} spoke from ${analysis.diarization[0].start}s to ${analysis.diarization[0].end}s${
        analysis.diarization[1]
          ? `, and ${analysis.diarization[1].speaker} from ${analysis.diarization[1].start}s to ${analysis.diarization[1].end}s`
          : ""
      }.`;
    }

    if (lowerQuery.includes("event") || lowerQuery.includes("audio event")) {
      return `The detected audio event is "${analysis.audio_event.replace(/_/g, " ")}". This non-speech event was mixed with the speech at a ratio of ${(
        analysis.mixing_ratios.nonspeech * 100
      ).toFixed(0)}% non-speech to ${(analysis.mixing_ratios.speech * 100).toFixed(0)}% speech.`;
    }

    if (lowerQuery.includes("transcript") || lowerQuery.includes("said") || lowerQuery.includes("speech")) {
      return `The transcription in ${analysis.language} is: "${analysis.transcription}". The audio duration is ${analysis.duration} seconds.`;
    }

    if (lowerQuery.includes("question") || lowerQuery.includes("qa") || lowerQuery.includes("answer")) {
      return `The analysis generated ${analysis.question_answer_pair.length} Q&A pairs: ${analysis.question_answer_pair
        .map((qa) => `"${qa.question}" -> "${qa.answer}"`)
        .join("; ")}.`;
    }

    if (lowerQuery.includes("language")) {
      return `The primary language detected is ${analysis.language.charAt(0).toUpperCase() + analysis.language.slice(1)}. The source is ${analysis.source}.`;
    }

    return `I can help you understand the analysis results. The audio has been processed and shows ${analysis.diarization.length} speakers, ${analysis.question_answer_pair.length} Q&A pairs, and a "${analysis.audio_event.replace(/_/g, " ")}" audio event. What specific aspect would you like to explore?`;
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

  // Extract insights from Q&A pairs
  const topics = useMemo(() => {
    if (!currentAnalysis) return [];
    return currentAnalysis.question_answer_pair.map((qa) => qa.question);
  }, [currentAnalysis]);

  const actionItems = useMemo(() => {
    if (!currentAnalysis) return [];
    return currentAnalysis.question_answer_pair
      .filter((qa) => qa.answer.toLowerCase().includes("action") || qa.answer.toLowerCase().includes("task"))
      .map((qa) => qa.answer);
  }, [currentAnalysis]);

  const keyDecisions = useMemo(() => {
    if (!currentAnalysis) return [];
    return currentAnalysis.question_answer_pair
      .filter((qa) => qa.answer.toLowerCase().includes("decision") || qa.answer.toLowerCase().includes("decided"))
      .map((qa) => qa.answer);
  }, [currentAnalysis]);

  // Audio metrics for visualization
  const audioMetrics = useMemo(() => {
    if (!currentAnalysis) return [];
    return [
      { name: "Duration", value: currentAnalysis.duration, unit: "s" },
      { name: "Speech Ratio", value: currentAnalysis.mixing_ratios.speech * 100, unit: "%" },
      { name: "Non-Speech Ratio", value: currentAnalysis.mixing_ratios.nonspeech * 100, unit: "%" },
    ];
  }, [currentAnalysis]);

  // Speaker distribution chart data
  const speakerData = useMemo(() => {
    if (!currentAnalysis) return [];
    const speakerMap = new Map<string, number>();
    currentAnalysis.diarization.forEach((seg) => {
      const duration = seg.end - seg.start;
      speakerMap.set(seg.speaker, (speakerMap.get(seg.speaker) || 0) + duration);
    });
    return Array.from(speakerMap.entries()).map(([speaker, duration]) => ({
      name: speaker,
      duration: Math.round(duration),
    }));
  }, [currentAnalysis]);

  if (!currentAnalysis) return null;

  const transcriptContent =
    translatedTranscript || (showDiarization ? buildDiarizedTranscript(currentAnalysis) : currentAnalysis.transcription);

  return (
    <div className="flex-1 min-w-0">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Custom Navbar for Results Page */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-6 w-6 text-accent" />
              </motion.div>
              <h1 className="text-xl md:text-2xl font-bold font-headline bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Audio Analysis Report
              </h1>
            </div>

            {/* Center: Tabs */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "rounded-full transition-all",
                  activeTab === "overview"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Overview
              </Button>
              <Button
                variant={activeTab === "transcript" ? "default" : "ghost"}
                onClick={() => setActiveTab("transcript")}
                className={cn(
                  "rounded-full transition-all",
                  activeTab === "transcript"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Transcript
              </Button>
              <Button
                variant={activeTab === "insights" ? "default" : "ghost"}
                onClick={() => setActiveTab("insights")}
                className={cn(
                  "rounded-full transition-all",
                  activeTab === "insights"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Insights
              </Button>
              <Button
                variant={activeTab === "visualizations" ? "default" : "ghost"}
                onClick={() => setActiveTab("visualizations")}
                className={cn(
                  "rounded-full transition-all",
                  activeTab === "visualizations"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Charts
              </Button>
              <Button
                variant={activeTab === "chat" ? "default" : "ghost"}
                onClick={() => setActiveTab("chat")}
                className={cn(
                  "rounded-full transition-all",
                  activeTab === "chat"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Chat
              </Button>
            </div>

            {/* Right: History Button */}
            <div className="flex items-center gap-2">
              {!showSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onShowSidebar}
                  className="h-10 w-10 rounded-full hover:bg-accent/10"
                >
                  <History className="h-5 w-5 text-accent" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden pb-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "rounded-full transition-all whitespace-nowrap",
                  activeTab === "overview"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Overview
              </Button>
              <Button
                variant={activeTab === "transcript" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("transcript")}
                className={cn(
                  "rounded-full transition-all whitespace-nowrap",
                  activeTab === "transcript"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Transcript
              </Button>
              <Button
                variant={activeTab === "insights" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("insights")}
                className={cn(
                  "rounded-full transition-all whitespace-nowrap",
                  activeTab === "insights"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Insights
              </Button>
              <Button
                variant={activeTab === "visualizations" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("visualizations")}
                className={cn(
                  "rounded-full transition-all whitespace-nowrap",
                  activeTab === "visualizations"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Charts
              </Button>
              <Button
                variant={activeTab === "chat" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("chat")}
                className={cn(
                  "rounded-full transition-all whitespace-nowrap",
                  activeTab === "chat"
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "hover:bg-accent/10"
                )}
              >
                Chat
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="relative pb-12 min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-6">
          <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Speakers Detected"
                    value={currentAnalysis.diarization.length}
                    icon={Users}
                    description="Distinct voices identified"
                    index={0}
                    gradient="from-blue-500/30 via-cyan-500/20 to-transparent"
                  />
                  <StatCard
                    title="Language"
                    value={currentAnalysis.language.charAt(0).toUpperCase() + currentAnalysis.language.slice(1)}
                    icon={Globe}
                    description="Primary language spoken"
                    index={1}
                    gradient="from-purple-500/30 via-pink-500/20 to-transparent"
                  />
                  <StatCard
                    title="Audio Event"
                    value={currentAnalysis.audio_event.replace(/_/g, " ")}
                    icon={Wind}
                    description="Detected background event"
                    index={2}
                    gradient="from-emerald-500/30 via-green-500/20 to-transparent"
                  />
                  <StatCard
                    title="Duration"
                    value={`${currentAnalysis.duration.toFixed(1)}s`}
                    icon={Gauge}
                    description="Total audio length"
                    index={3}
                    gradient="from-amber-500/30 via-orange-500/20 to-transparent"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="glass-strong border-accent/20 hover:border-accent/40 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                          <Info className="h-6 w-6 text-accent" />
                        </div>
                        <CardTitle>Audio Analysis Summary</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base text-foreground/80 leading-relaxed">
                        This audio contains {currentAnalysis.diarization.length} speaker{currentAnalysis.diarization.length !== 1 ? "s" : ""} speaking in{" "}
                        {currentAnalysis.language}. The audio includes a {currentAnalysis.audio_event.replace(/_/g, " ")} event mixed at{" "}
                        {(currentAnalysis.mixing_ratios.nonspeech * 100).toFixed(0)}% non-speech content. The analysis generated{" "}
                        {currentAnalysis.question_answer_pair.length} question-answer pairs from the content.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="transcript" className="mt-0 space-y-4">
                {/* Compact Audio Player */}
                {selectedFile && audioUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="glass-strong border-accent/20 hover:border-accent/40 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
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
                            className="h-10 w-10 rounded-full bg-accent/10 hover:bg-accent/20 transition-all shrink-0"
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4 text-accent" />
                            ) : (
                              <Play className="h-4 w-4 text-accent" />
                            )}
                          </Button>
                          <audio ref={audioRef} src={audioUrl} className="hidden" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {currentAnalysis.duration.toFixed(2)}s
                            </p>
                          </div>
                          <div className="flex items-center gap-1 h-8 px-2 bg-muted/30 rounded-lg shrink-0">
                            {[...Array(20)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-0.5 bg-accent/50 rounded-full"
                                animate={{
                                  height: isPlaying ? `${20 + Math.random() * 60}%` : "30%",
                                }}
                                transition={{
                                  duration: 0.3,
                                  delay: i * 0.02,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="glass-strong border-accent/20">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex-1 space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            <Text size={22} /> Transcript
                          </CardTitle>
                          <CardDescription>The transcribed text from your audio file.</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="diarization-mode"
                              checked={showDiarization}
                              onCheckedChange={setShowDiarization}
                            />
                            <Label htmlFor="diarization-mode">Show Speakers</Label>
                          </div>
                          <div className="w-full md:w-48">
                            <Select onValueChange={handleLanguageChange} value={targetLanguage}>
                              <SelectTrigger className="glass-strong">
                                <SelectValue placeholder="Translate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Original">Original ({currentAnalysis.language})</SelectItem>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Tamil">Tamil</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Telugu">Telugu</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isTranslating ? (
                        <div className="flex items-center justify-center p-8 space-x-2 text-foreground/70">
                          <Loader className="animate-spin" /> <span>Translating...</span>
                        </div>
                      ) : (
                        <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                          {transcriptContent}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="insights" className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InsightCard
                  title="Key Topics"
                  icon={Target}
                  data={topics}
                  emptyText="No key topics were identified."
                  index={0}
                  gradient="from-blue-500/20 to-cyan-500/10"
                />
                <InsightCard
                  title="Action Items"
                  icon={ListTodo}
                  data={actionItems}
                  emptyText="No action items were mentioned."
                  index={1}
                  gradient="from-purple-500/20 to-pink-500/10"
                />
                <InsightCard
                  title="Key Decisions"
                  icon={Hand}
                  data={keyDecisions}
                  emptyText="No key decisions were identified."
                  index={2}
                  gradient="from-emerald-500/20 to-green-500/10"
                />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="md:col-span-2 lg:col-span-3"
                >
                  <Card className="glass-strong border-accent/20 hover:border-accent/40 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                          <BotMessageSquare className="h-5 w-5 text-accent" />
                        </div>
                        Question & Answer Pairs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentAnalysis.question_answer_pair.length > 0 ? (
                        <div className="space-y-4">
                          {currentAnalysis.question_answer_pair.map((qa, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="border-l-4 border-accent pl-4 py-3 rounded-r-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                            >
                              <p className="font-semibold text-sm mb-1">Q: {qa.question}</p>
                              <p className="text-sm text-foreground/80">A: {qa.answer}</p>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-foreground/60">No Q&A pairs were generated.</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="visualizations" className="mt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Audio Metrics"
                  description="Duration and mixing ratios analysis."
                  index={0}
                >
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={audioMetrics} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
                <ChartCard
                  title="Speaker Duration Distribution"
                  description="Time each speaker was active."
                  index={1}
                >
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={speakerData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                          }}
                        />
                        <Bar dataKey="duration" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </TabsContent>

              <TabsContent value="chat" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="glass-strong border-accent/20 h-[calc(100vh-20rem)] min-h-[600px] flex flex-col">
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="px-6 py-4 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                            <BotMessageSquare className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-bold">Chat Assistant</h3>
                            <p className="text-xs text-muted-foreground">Ask questions about your audio analysis</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-5">
                          <AnimatePresence>
                            {chatMessages.length === 0 ? (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-16 text-center"
                              >
                                <motion.div
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                  <BotMessageSquare className="h-12 w-12 text-accent mb-4" />
                                </motion.div>
                                <h3 className="text-lg font-bold mb-2">Start a Conversation</h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                  Ask me anything about your audio analysis results!
                                </p>
                              </motion.div>
                            ) : (
                              chatMessages.map((message) => (
                                <motion.div
                                  key={message.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className={`flex gap-4 items-start ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                  {message.role === "assistant" && (
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center shrink-0">
                                      <BotMessageSquare className="h-5 w-5 text-blue-600" />
                                    </div>
                                  )}
                                  <div
                                    className={`max-w-[75%] rounded-2xl p-4 ${
                                      message.role === "user"
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {message.timestamp.toLocaleTimeString()}
                                    </p>
                                  </div>
                                  {message.role === "user" && (
                                    <div className="h-10 w-10 rounded-full bg-accent/30 flex items-center justify-center shrink-0">
                                      <User className="h-5 w-5 text-accent" />
                                    </div>
                                  )}
                                </motion.div>
                              ))
                            )}
                          </AnimatePresence>
                          {isChatLoading && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex gap-4 items-start"
                            >
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                                <BotMessageSquare className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="bg-muted rounded-2xl p-4">
                                <div className="flex items-center gap-2">
                                  <Loader className="h-4 w-4 animate-spin" />
                                  <span className="text-sm">Thinking...</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          <div ref={chatEndRef} />
                        </div>
                      </div>

                      <form onSubmit={handleChatSubmit} className="p-4 border-t border-border/50">
                        <div className="flex gap-3 items-end">
                          <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type your question..."
                            className="flex-1 min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleChatSubmit(e);
                              }
                            }}
                          />
                          <Button
                            type="submit"
                            disabled={!chatInput.trim() || isChatLoading}
                            size="icon"
                            className="h-[70px] w-[70px] rounded-full bg-accent/10 hover:bg-accent/20"
                          >
                            {isChatLoading ? (
                              <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
