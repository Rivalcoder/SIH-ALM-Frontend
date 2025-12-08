"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BotMessageSquare, User, Send, Loader, MessageSquare } from "lucide-react";
import { ChatMessage } from "@/lib/analyzeTypes";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSubmit: (message: string) => void;
  onScrollChange?: (isScrolling: boolean) => void;
}

export function ChatInterface({ messages, isLoading, onSubmit, onScrollChange }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoScrollingRef = useRef(false);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (messagesContainerRef.current && messages.length > 0) {
      const chatContainer = messagesContainerRef.current;
      if (chatContainer) {
        const isNearBottom = 
          chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 200;
        
        if (isNearBottom || messages.length === 1) {
          // Mark as auto-scrolling to prevent expansion
          isAutoScrollingRef.current = true;
          setTimeout(() => {
            // Use scrollTo instead of scrollIntoView to avoid triggering scroll events on parent
            chatContainer.scrollTo({
              top: chatContainer.scrollHeight,
              behavior: "smooth"
            });
            // Reset auto-scroll flag after scroll completes
            setTimeout(() => {
              isAutoScrollingRef.current = false;
            }, 600);
          }, 100);
        }
      }
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    const chatContainer = messagesContainerRef.current;
    if (!chatContainer) return;

    let lastScrollTop = chatContainer.scrollTop;
    let isUserScrollingUp = false;
    let scrollAttemptsAtTop = 0;

    const handleScroll = () => {
      // Ignore scroll events during auto-scroll (when messages are sent)
      if (isAutoScrollingRef.current) {
        lastScrollTop = chatContainer.scrollTop;
        return;
      }

      const currentScrollTop = chatContainer.scrollTop;
      
      // Only expand when:
      // 1. User is at absolute top (scrollTop === 0 or very close)
      // 2. User is actively scrolling UP (trying to scroll beyond top)
      // 3. Multiple scroll attempts at top (to avoid accidental triggers)
      const isAtAbsoluteTop = currentScrollTop <= 2;
      const isScrollingUp = currentScrollTop < lastScrollTop;
      
      if (isAtAbsoluteTop && isScrollingUp && isUserScrollingUp) {
        scrollAttemptsAtTop++;
        // Require 3+ scroll attempts at top before expanding
        if (scrollAttemptsAtTop >= 3 && !isScrolling) {
          setIsScrolling(true);
          onScrollChange?.(true);
        }
      } else {
        // Reset counter if not at top or scrolling down
        if (!isAtAbsoluteTop || !isScrollingUp) {
          scrollAttemptsAtTop = 0;
        }
      }
      
      lastScrollTop = currentScrollTop;
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set scrolling to false after scroll ends (1200ms of no scrolling)
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingUp = false;
        scrollAttemptsAtTop = 0;
        setIsScrolling(false);
        onScrollChange?.(false);
      }, 1200);
    };

    // Only mark as user scrolling up when wheel event indicates upward scroll
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) { // Scrolling up
        isUserScrollingUp = true;
      } else {
        isUserScrollingUp = false;
        scrollAttemptsAtTop = 0;
      }
    };

    chatContainer.addEventListener("scroll", handleScroll, { passive: true });
    chatContainer.addEventListener("wheel", handleWheel, { passive: true });
    
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll);
      chatContainer.removeEventListener("wheel", handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isScrolling, onScrollChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
        {/* Messages Container */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto bg-transparent"
          style={{ 
            scrollBehavior: 'smooth',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                >
                  {/* Animated AI Message Icon */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mb-8"
                  >
                    {/* Pulsing glow effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full blur-3xl"
                    />
                    {/* Icon container */}
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
                      transition={{ duration: 0.5 }}
                      className="relative p-6 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl border-4 border-white/20 dark:border-zinc-800/50"
                    >
                      <BotMessageSquare className="h-16 w-16 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Title with animation */}
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    AI Assistant
                  </motion.h3>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-6 font-medium"
                  >
                    Ask questions about your analysis
                  </motion.p>

                  {/* Description with fade in */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="max-w-2xl space-y-4"
                  >
                    <div className="bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-700/50 shadow-lg">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Ask me anything about your audio analysis results. I&apos;m here to help you understand the insights.
                      </p>
                    </div>
                  </motion.div>

                  {/* Animated suggestion chips */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-8 flex flex-wrap gap-3 justify-center max-w-2xl"
                  >
                    {[
                      "What are the key insights?",
                      "Explain the transcription",
                      "Analyze the speakers"
                    ].map((suggestion, idx) => (
                      <motion.button
                        key={suggestion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + idx * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setInput(suggestion);
                          setTimeout(() => {
                            handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                          }, 100);
                        }}
                        className="px-4 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm hover:shadow-md"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: message.role === "user" ? 20 : -20 }}
                    transition={{ 
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                      delay: index * 0.05
                    }}
                    className={cn(
                      "flex gap-4 items-start group",
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar with animation */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <Avatar className={cn(
                        "h-11 w-11 shrink-0 border-2 shadow-lg",
                        message.role === "user" 
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-800 shadow-blue-500/30" 
                          : "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-300 dark:border-indigo-700 shadow-indigo-500/20"
                      )}>
                        <AvatarFallback className={cn(
                          message.role === "user" 
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white" 
                            : "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40"
                        )}>
                          {message.role === "user" ? (
                            <User className="h-5 w-5" />
                          ) : (
                            <BotMessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>

                    {/* Message Bubble */}
                    <div className={cn(
                      "flex flex-col gap-2 max-w-[75%] sm:max-w-[80%]",
                      message.role === "user" ? "items-end" : "items-start"
                    )}>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                        className={cn(
                          "rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm",
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md shadow-blue-500/30"
                            : "bg-white/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 rounded-bl-md border-2 border-zinc-200/50 dark:border-zinc-700/50 shadow-zinc-500/10"
                        )}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: message.role === "user" 
                            ? "0 10px 25px -5px rgba(59, 130, 246, 0.4)" 
                            : "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className={cn(
                          "text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words",
                          message.role === "user" ? "text-white" : "text-zinc-800 dark:text-zinc-100"
                        )}>
                          {message.content}
                        </p>
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                        className={cn(
                          "text-xs px-2 font-medium",
                          message.role === "user" 
                            ? "text-zinc-500 dark:text-zinc-400" 
                            : "text-zinc-500 dark:text-zinc-400"
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </motion.p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Loading Indicator with Animation */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-4 items-start"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Avatar className="h-11 w-11 shrink-0 border-2 border-indigo-300 dark:border-indigo-700 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40">
                      <BotMessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/90 dark:bg-zinc-800/90 border-2 border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl rounded-bl-md px-5 py-4 shadow-lg backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </motion.div>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="text-sm text-zinc-700 dark:text-zinc-300 font-medium"
                    >
                      Thinking...
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area - Enhanced with Animations */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="border-t-2 border-zinc-200/50 dark:border-zinc-800/50 bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-800 backdrop-blur-sm shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        >
          <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your analysis..."
                    className="min-h-[70px] max-h-[200px] rounded-2xl border-2 border-zinc-300/50 dark:border-zinc-700/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm resize-none pr-14 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 dark:focus-visible:border-indigo-400 transition-all text-sm sm:text-base shadow-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    rows={1}
                  />
                  {input.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 bottom-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-[70px] w-[70px] rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:via-blue-700 hover:to-indigo-800 text-white shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all border-2 border-indigo-500/20"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ x: 2, y: -2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Send className="h-5 w-5" />
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 px-1 font-medium flex items-center gap-2"
            >
              <span className="hidden sm:inline">Press</span>
              <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-xs font-mono border border-zinc-300 dark:border-zinc-700">Enter</kbd>
              <span>to send,</span>
              <kbd className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded text-xs font-mono border border-zinc-300 dark:border-zinc-700">Shift+Enter</kbd>
              <span>for new line</span>
            </motion.p>
          </form>
        </motion.div>
    </div>
  );
}

