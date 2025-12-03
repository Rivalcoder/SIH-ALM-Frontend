"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatasetSample } from "@/lib/datasetSamples";
import { ChatMessage, AnalysisHistory } from "@/lib/analyzeTypes";
import { UploadPage } from "@/components/analyze/UploadPage";
import { ResultsPage } from "@/components/analyze/ResultsPage";
import {
  History,
  X,
  FileAudio,
  ChevronRight,
} from "lucide-react";

export default function Analyze() {
  const [hasResults, setHasResults] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<AnalysisHistory | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<DatasetSample | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("analysisHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const history = parsed.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
          chatMessages: h.chatMessages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }));
        setAnalysisHistory(history);
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (analysisHistory.length > 0) {
      localStorage.setItem("analysisHistory", JSON.stringify(analysisHistory));
    }
  }, [analysisHistory]);

  const handleFileProcessed = (file: File, result: DatasetSample, welcomeMessage: ChatMessage) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setCurrentAnalysis(result);
    setChatMessages([welcomeMessage]);
    setHasResults(true);
  };

  const loadFromHistory = (history: AnalysisHistory) => {
    setSelectedHistory(history);
    setHasResults(true);
    setCurrentAnalysis(history.result);
    setChatMessages(history.chatMessages);
    setSelectedFile(new File([], history.fileName));
    setShowSidebar(false);
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

  const startNewAnalysis = () => {
    setSelectedFile(null);
    setAudioUrl(null);
    setHasResults(false);
    setCurrentAnalysis(null);
    setChatMessages([]);
    setSelectedHistory(null);
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
                onClick={() => setShowSidebar(false)}
                className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileAudio className="h-4 w-4 text-accent shrink-0" />
                                <p className="font-medium text-sm truncate">{history.fileName}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
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
        {!hasResults ? (
          <UploadPage
            onFileProcessed={handleFileProcessed}
            showSidebar={showSidebar}
            onShowSidebar={() => setShowSidebar(true)}
          />
        ) : (
          <ResultsPage
            selectedFile={selectedFile}
            audioUrl={audioUrl}
            currentAnalysis={currentAnalysis}
            chatMessages={chatMessages}
            onNewAnalysis={startNewAnalysis}
            onSaveToHistory={saveToHistory}
            showSidebar={showSidebar}
            onShowSidebar={() => setShowSidebar(true)}
          />
        )}
      </div>
    </div>
  );
}
