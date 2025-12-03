"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";
import { ChatMessage } from "@/lib/analyzeTypes";
import { useToast } from "@/hooks/use-toast";
import { SplittingText } from "@/components/ui/splitting-text";
import { ResultsNavigation } from "./ResultsNavigation";
import { AudioPlayer } from "./AudioPlayer";
import { TranscriptView } from "./TranscriptView";
import { ChatInterface } from "./ChatInterface";
import { OverviewTab } from "./tabs/OverviewTab";
import { InsightsTab } from "./tabs/InsightsTab";
import { VisualizationsTab } from "./tabs/VisualizationsTab";

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
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [translatedTranscript, setTranslatedTranscript] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>("Original");
  const [showDiarization, setShowDiarization] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setChatMessages(initialChatMessages);
  }, [initialChatMessages]);

  // Hide header and navigation on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header and nav when at top (within 100px) or scrolling up
      if (currentScrollY < 100 || currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
        setIsNavVisible(true);
      } 
      // Hide header and nav when scrolling down past threshold
      else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsHeaderVisible(false);
        setIsNavVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Show header and nav when tab changes, but don't auto-scroll for chat tab
  useEffect(() => {
    // Show header and nav when switching tabs
    setIsHeaderVisible(true);
    setIsNavVisible(true);
    // Only scroll to top for non-chat tabs to show navigation
    if (activeTab !== "chat") {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  }, [activeTab]);

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

  const handleChatSubmit = async (message: string) => {
    if (!message.trim() || isChatLoading || !currentAnalysis) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(message, currentAnalysis),
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiResponse]);
      setIsChatLoading(false);
    }, 1500);
  };

  if (!currentAnalysis) return null;

  return (
    <div className="flex-1 min-w-0 relative flex flex-col w-full overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Header & Navigation - Fixed below main navbar at top-16 (64px) */}
      <div className="fixed top-16 left-0 right-0 z-[45] pointer-events-none">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 animated-gradient opacity-50 pointer-events-none" />
        
        {/* Header Section - Hides on scroll down */}
        <motion.div
          className="relative w-full bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg pointer-events-auto"
          animate={{
            y: isHeaderVisible ? 0 : "-100%",
            opacity: isHeaderVisible ? 1 : 0,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
            {/* Centered Title with SplittingText Animation */}
            <div className="text-center">
              <motion.div
                className="inline-block mb-2"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-full blur-xl" />
                  <Sparkles className="relative h-8 w-8 md:h-10 md:w-10 text-accent mx-auto" />
                </div>
              </motion.div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="gradient-text inline-block">
                  <SplittingText
                    text="Analysis Report"
                    type="words"
                    inView={true}
                    inViewOnce={false}
                    motionVariants={{
                      initial: { opacity: 0, y: 30, scale: 0.9 },
                      animate: { opacity: 1, y: 0, scale: 1 },
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                      stagger: 0.15
                    }}
                  />
                </span>
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Navigation Section - Hides on scroll down */}
        <motion.div
          className="pointer-events-auto"
          animate={{
            y: isNavVisible ? 0 : "-100%",
            opacity: isNavVisible ? 1 : 0,
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <ResultsNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showSidebar={showSidebar}
            onShowSidebar={onShowSidebar}
          />
        </motion.div>
      </div>

      {/* Spacer to prevent content from going under fixed header & navigation */}
      {/* Header: ~140-200px (when visible) + Navigation: 64px = ~204-264px total */}
      <div className="h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px]" />

      {/* Main Content */}
      <main className="relative pb-12 flex-1 w-full overflow-visible">
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-4">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <OverviewTab analysis={currentAnalysis} />
              </motion.div>
            )}

            {activeTab === "transcript" && (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {selectedFile && audioUrl && (
                  <AudioPlayer
                    selectedFile={selectedFile}
                    audioUrl={audioUrl}
                    duration={currentAnalysis.duration}
                  />
                )}
                <TranscriptView
                  analysis={currentAnalysis}
                  translatedTranscript={translatedTranscript}
                  isTranslating={isTranslating}
                  targetLanguage={targetLanguage}
                  showDiarization={showDiarization}
                  onLanguageChange={handleLanguageChange}
                  onDiarizationToggle={setShowDiarization}
                />
                  </motion.div>
                )}

            {activeTab === "insights" && (
                <motion.div
                key="insights"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <InsightsTab analysis={currentAnalysis} />
              </motion.div>
            )}

            {activeTab === "visualizations" && (
              <motion.div
                key="visualizations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <VisualizationsTab analysis={currentAnalysis} />
              </motion.div>
            )}

            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                <ChatInterface
                  messages={chatMessages}
                  isLoading={isChatLoading}
                  onSubmit={handleChatSubmit}
                />
              </motion.div>
            )}
                          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
