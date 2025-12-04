"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BotMessageSquare, User, Send, Loader } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "w-full flex flex-col transition-all duration-300 mx-auto",
        isScrolling ? "h-full max-w-full" : "h-auto max-w-[95%]"
      )}
      style={isScrolling ? { height: '100%', minHeight: '100%' } : { maxHeight: '600px' }}
    >
      <Card 
        className="border border-border bg-card shadow-lg flex flex-col w-full overflow-hidden transition-all duration-300" 
        style={isScrolling ? { 
          height: '100%', 
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column'
        } : { 
          height: '600px', 
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border bg-accent/10">
              <AvatarFallback className="bg-accent/10 text-accent">
                <BotMessageSquare className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base text-foreground">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask questions about your analysis</p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={messagesContainerRef}
          className="overflow-y-auto bg-background"
          style={{ 
            scrollBehavior: 'smooth',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            ...(isScrolling ? {
              flex: '1 1 0',
              minHeight: 0,
              height: '100%'
            } : {
              flex: '1 1 0',
              minHeight: 0,
              height: 'calc(600px - 92px - 112px)', // 600px - header (~92px) - input area (~112px)
              maxHeight: 'calc(600px - 92px - 112px)'
            })
          }}
        >
          <div className="w-full max-w-none px-6 py-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-6"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl" />
                      <div className="relative p-4 rounded-full bg-accent/10 border border-accent/20">
                        <BotMessageSquare className="h-12 w-12 text-accent" />
                      </div>
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    Start a Conversation
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Ask me anything about your audio analysis results. I&apos;m here to help you understand the insights.
                  </p>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex gap-4 items-start group",
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar */}
                    <Avatar className={cn(
                      "h-8 w-8 shrink-0 border",
                      message.role === "user" 
                        ? "bg-accent text-accent-foreground border-accent/20" 
                        : "bg-muted border-border"
                    )}>
                      <AvatarFallback className={cn(
                        message.role === "user" ? "bg-accent text-accent-foreground" : "bg-muted"
                      )}>
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <BotMessageSquare className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    {/* Message Bubble */}
                    <div className={cn(
                      "flex flex-col gap-1 max-w-[85%]",
                      message.role === "user" ? "items-end" : "items-start"
                    )}>
                      <motion.div
                        className={cn(
                          "rounded-2xl px-4 py-3 shadow-sm",
                          message.role === "user"
                            ? "bg-accent text-accent-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm border border-border/50"
                        )}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </motion.div>
                      <p className={cn(
                        "text-xs px-1",
                        message.role === "user" ? "text-muted-foreground" : "text-muted-foreground"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 items-start"
              >
                <Avatar className="h-8 w-8 shrink-0 border border-border bg-muted">
                  <AvatarFallback className="bg-muted">
                    <BotMessageSquare className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin text-accent" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur-sm shrink-0">
          <form onSubmit={handleSubmit} className="w-full px-6 py-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about your analysis..."
                  className="min-h-[60px] max-h-[200px] rounded-xl border-border bg-background resize-none pr-12 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent/50 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  rows={1}
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-[60px] w-[60px] rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </motion.div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 px-1">
              Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}

