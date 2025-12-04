"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BotMessageSquare, User, Send, Loader, Sparkles } from "lucide-react";
import { ChatMessage } from "@/lib/analyzeTypes";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSubmit: (message: string) => void;
}

export function ChatInterface({ messages, isLoading, onSubmit }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only auto-scroll to bottom on new messages, but don't interrupt user scrolling
    if (chatEndRef.current && messages.length > 0) {
      const chatContainer = chatEndRef.current.closest('.overflow-y-auto') as HTMLElement;
      if (chatContainer) {
        const isNearBottom = 
          chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 150;
        
        // Only auto-scroll if user is already near bottom (not scrolled up)
        if (isNearBottom || messages.length === 1) {
          setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
          }, 50);
        }
      }
    }
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <Card className="border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl max-h-[calc(100vh-280px)] min-h-[500px] flex flex-col w-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/50 bg-fuchsia-100 dark:bg-fuchsia-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 border border-fuchsia-500">
              <BotMessageSquare className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask questions about your analysis</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-background to-muted/20">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
                    <BotMessageSquare className="relative h-16 w-16 text-accent" />
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Start a Conversation
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask me anything about your audio analysis results!
                </p>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex gap-4 items-start ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <motion.div
                      className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 flex items-center justify-center shrink-0 border border-accent/20 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <BotMessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                  )}
                  <motion.div
                    className={`max-w-[75%] rounded-2xl p-4 shadow-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                        : "bg-white dark:bg-card border border-gray-200 dark:border-border/50 backdrop-blur-sm"
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.role === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </motion.div>
                  {message.role === "user" && (
                    <motion.div
                      className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/20 flex items-center justify-center shrink-0 border border-accent/20"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                    >
                      <User className="h-5 w-5 text-accent" />
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 items-start"
            >
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 flex items-center justify-center shrink-0">
                <BotMessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="bg-white dark:bg-card border border-gray-200 dark:border-border/50 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your analysis..."
                className="min-h-[80px] rounded-xl border-border/50 bg-background/50 backdrop-blur-sm resize-none pr-12 focus-visible:ring-2 focus-visible:ring-accent/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[80px] w-[80px] rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}

