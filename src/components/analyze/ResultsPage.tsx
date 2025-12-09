"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Waves } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";
import { ChatMessage } from "@/lib/analyzeTypes";
import { useToast } from "@/hooks/use-toast";
import { chatAboutAudio, chatAboutAudioStream } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { translateText as aiTranslateText } from "@/lib/aiUtils";
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
  sessionId: string | null;
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

  // Check if we have access to diarization_with_text from the API response
  // This is stored in paralinguistics
  const paralinguistics = analysis.paralinguistics as {
    diarization_with_text?: Array<{
      speaker: string;
      start: number;
      end: number;
      text: string;
    }>;
  } | undefined;

  // If we have segment-level text, use it (this is the proper way)
  if (paralinguistics?.diarization_with_text && paralinguistics.diarization_with_text.length > 0) {
    return paralinguistics.diarization_with_text
      .map((seg) => {
        const speakerLabel = seg.speaker || "Unknown Speaker";
        return `${speakerLabel}: ${seg.text}`;
      })
      .join("\n\n");
  }

  // Fallback: If no segment-level text, just show the transcript once with the first speaker
  // Don't repeat it for each segment
  const firstSpeaker = analysis.diarization[0]?.speaker || "Speaker";
  return `${firstSpeaker}: ${analysis.transcription}`;
};

export function ResultsPage({
  selectedFile,
  audioUrl,
  currentAnalysis,
  chatMessages: initialChatMessages,
  sessionId,
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
  const lastScrollYRef = useRef(0);
  const [isChatScrolling, setIsChatScrolling] = useState(false);
  const { toast } = useToast();
  const isPlaceholder = Boolean(
    currentAnalysis?.is_placeholder ||
    currentAnalysis?.transcription?.toLowerCase?.().includes("api is offline") ||
    currentAnalysis?.audio_id?.startsWith("dummy_session_")
  );

  useEffect(() => {
    setChatMessages(initialChatMessages);
  }, [initialChatMessages]);

  const availableTabs = [
    "overview",
    "transcript",
    "insights",
    "visualizations",
    "chat",
  ].filter((tab) => {
    if (!isPlaceholder) return true;
    return tab === "chat"; // Hide other tabs for placeholder data
  });

  useEffect(() => {
    if (!availableTabs.includes(activeTab) && availableTabs.length > 0) {
      setActiveTab(availableTabs[0]);
    }
  }, [activeTab, availableTabs]);

  // Handle scroll for content area only (not window scroll)
  const contentRef = useRef<HTMLDivElement>(null);
  const headerNavRef = useRef<HTMLDivElement>(null);
  const [headerNavHeight, setHeaderNavHeight] = useState(320);

  // Measure header+nav height
  useEffect(() => {
    const updateHeight = () => {
      if (headerNavRef.current) {
        const height = headerNavRef.current.offsetHeight;
        setHeaderNavHeight(height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isHeaderVisible, isNavVisible]);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    let rafId: number | null = null;
    let lastHeaderState = { header: true, nav: true };

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        const currentScrollY = contentElement.scrollTop;

        // Only update state if it actually changed to avoid unnecessary re-renders
        let newHeaderState = { header: false, nav: false };

        // Show header and nav only when at the very top (within 10px threshold)
        if (currentScrollY <= 10) {
          newHeaderState = { header: true, nav: true };
        }

        // Only update state if changed
        if (newHeaderState.header !== lastHeaderState.header ||
          newHeaderState.nav !== lastHeaderState.nav) {
          setIsHeaderVisible(newHeaderState.header);
          setIsNavVisible(newHeaderState.nav);
          lastHeaderState = newHeaderState;
        }

        lastScrollYRef.current = currentScrollY;
        rafId = null;
      });
    };

    contentElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      contentElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Show header and nav when tab changes
  useEffect(() => {
    // Show header and nav when switching tabs
    setIsHeaderVisible(true);
    setIsNavVisible(true);
  }, [activeTab]);

  // Lightweight scroll forwarding for nav area to ensure scroll works
  useEffect(() => {
    const headerNavElement = headerNavRef.current;
    const contentElement = contentRef.current;

    if (!headerNavElement || !contentElement) return;

    let rafId: number | null = null;
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;

      // Only forward if not over a button (buttons handle their own events)
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        return;
      }

      // Cancel any pending scroll update
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Use requestAnimationFrame for smooth scrolling
      rafId = requestAnimationFrame(() => {
        const currentScroll = contentElement.scrollTop;
        const newScroll = currentScroll + e.deltaY;
        contentElement.scrollTop = newScroll;
        rafId = null;
      });

      e.preventDefault();
    };

    headerNavElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      headerNavElement.removeEventListener('wheel', handleWheel);
    };
  }, []);

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
      const translated = await aiTranslateText(transcriptToTranslate, lang);
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

  const handleChatSubmit = async (message: string) => {
    if (!message.trim() || isChatLoading || !currentAnalysis || !sessionId) {
      if (!sessionId) {
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "No active session. Please upload a new audio file.",
        });
      }
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      // Placeholder assistant message for streaming updates
      const assistantId = `${Date.now() + 1}`;
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, assistantMessage]);

      // Stream from API
      const chatResponse = await chatAboutAudioStream(sessionId, message, (chunk) => {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: (m.content || "") + chunk } : m
          )
        );
      }).catch(async (streamErr) => {
        // Fallback to non-streaming if streaming fails
        console.warn("Streaming failed, falling back to standard chat:", streamErr);
        const fallback = await chatAboutAudio(sessionId, message);
        return fallback;
      });

      if (chatResponse.error) {
        throw new Error(chatResponse.error);
      }

      // Ensure final content is set (covers fallback or stream completion)
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: chatResponse.answer || m.content } : m
        )
      );
    } catch (error) {
      console.error("Chat request failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get AI response";

      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, errorResponse]);

      toast({
        variant: "destructive",
        title: "Chat Error",
        description: errorMessage,
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!currentAnalysis) return null;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col" style={{ minHeight: 0, overflow: 'hidden' }}>
      {/* Premium Animated Background - Matching landing page style */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 animated-gradient"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        />

        {/* Simplified static gradient orbs - Performance optimized */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top left orb - Static with reduced blur */}
          <div
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-2xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25), transparent)',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />

          {/* Bottom right orb - Static with reduced blur */}
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-2xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25), transparent)',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />
        </div>

        {/* Subtle grid pattern overlay */}
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

      {/* Premium Header Section - Glass morphism with smooth animations */}
      <div
        ref={headerNavRef}
        className="absolute top-0 left-0 right-0 z-[45]"
        style={{ pointerEvents: 'none' }}
      >
        {/* Header Section */}
        <motion.div
          className="relative w-full shadow-lg"
          animate={{
            y: isHeaderVisible ? 0 : "-100%",
            opacity: isHeaderVisible ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            backgroundColor: "hsl(var(--background) / 0.98)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderBottom: "none",
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform, opacity',
            pointerEvents: 'auto',
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="text-center space-y-5">
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 border border-accent/20 backdrop-blur-sm">
                  <Waves className="h-4 w-4 text-accent animate-pulse" />
                  <span className="text-xs font-semibold text-accent tracking-wide">AUDIO INTELLIGENCE</span>
                </div>
              </motion.div>

              {/* Main Title with Gradient */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="gradient-text">Analysis Report</span>
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto"
                >
                  Comprehensive insights from your audio analysis
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Section - Premium design */}
        <motion.div
          animate={{
            y: isNavVisible ? 0 : "-100%",
            opacity: isNavVisible ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            border: 'none',
            boxShadow: 'none',
            willChange: 'transform, opacity',
            pointerEvents: 'auto',
          }}
        >
          <ResultsNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showSidebar={showSidebar}
            onShowSidebar={onShowSidebar}
            hiddenTabs={isPlaceholder ? ["overview", "transcript", "insights", "visualizations"] : []}
          />
        </motion.div>
      </div>

      {/* Main Content Area - Scrollable container */}
      <main
        ref={contentRef}
        className={cn(
          "relative w-full flex-1",
          activeTab === "chat" && isChatScrolling ? "overflow-hidden" : "overflow-y-auto"
        )}
        style={{
          paddingTop: activeTab === "chat" && isChatScrolling ? '0' : `${headerNavHeight}px`,
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          height: '100%',
          minHeight: 0,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        <div className={cn(
          "w-full mx-auto",
          activeTab === "chat" ? "px-0" : "pt-6 pb-32 max-w-7xl px-4 sm:px-6 lg:px-8"
        )}>
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
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
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              >
                {selectedFile && audioUrl && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <AudioPlayer
                      selectedFile={selectedFile}
                      audioUrl={audioUrl}
                      duration={currentAnalysis.duration}
                    />
                  </motion.div>
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
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
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
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
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
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "w-full flex flex-col px-4 sm:px-6 lg:px-8 transition-all duration-300",
                  isChatScrolling ? "h-full py-0" : "h-auto py-6"
                )}
                style={{
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  height: isChatScrolling ? 'calc(100vh - 4rem)' : 'auto',
                  minHeight: isChatScrolling ? 'calc(100vh - 4rem)' : 'auto',
                  marginTop: isChatScrolling ? `-${headerNavHeight}px` : '0',
                }}
              >
                <ChatInterface
                  messages={chatMessages}
                  isLoading={isChatLoading}
                  onSubmit={handleChatSubmit}
                  onScrollChange={setIsChatScrolling}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
