"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Send, Loader2, ShieldCheck, FileSearch } from "lucide-react";
import { ChatMessage } from "@/lib/analyzeTypes";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    if (messagesContainerRef.current && messages.length > 0) {
      const chatContainer = messagesContainerRef.current;
      if (chatContainer) {
        const isNearBottom =
          chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 200;

        if (isNearBottom || messages.length === 1) {
          isAutoScrollingRef.current = true;
          setTimeout(() => {
            chatContainer.scrollTo({
              top: chatContainer.scrollHeight,
              behavior: "smooth"
            });
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
      if (isAutoScrollingRef.current) {
        lastScrollTop = chatContainer.scrollTop;
        return;
      }

      const currentScrollTop = chatContainer.scrollTop;
      const isAtAbsoluteTop = currentScrollTop <= 2;
      const isScrollingUp = currentScrollTop < lastScrollTop;

      if (isAtAbsoluteTop && isScrollingUp && isUserScrollingUp) {
        scrollAttemptsAtTop++;
        if (scrollAttemptsAtTop >= 3 && !isScrolling) {
          setIsScrolling(true);
          onScrollChange?.(true);
        }
      } else {
        if (!isAtAbsoluteTop || !isScrollingUp) {
          scrollAttemptsAtTop = 0;
        }
      }

      lastScrollTop = currentScrollTop;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingUp = false;
        scrollAttemptsAtTop = 0;
        setIsScrolling(false);
        onScrollChange?.(false);
      }, 1200);
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) {
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
    <div className="w-full h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 group font-sans">

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950"
        style={{
          scrollBehavior: 'smooth',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center min-h-[50vh] text-center"
              >
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-sm border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md w-full">
                  <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-sm flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                      <ShieldCheck className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 uppercase tracking-wide">
                    Analysis Assistant
                  </h3>

                  <div className="h-px w-16 bg-blue-600 mx-auto mb-4" />

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                    This secure channel allows for queries regarding the processed audio data. All interactions are logged for audit purposes.
                  </p>

                  <div className="grid gap-2 text-left">
                    {[
                      "Summarize key findings",
                      "List detected speakers",
                      "Identify potential security risks"
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInput(suggestion);
                          // Optional: auto-submit or let user review
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors w-full group/btn"
                      >
                        <FileSearch className="h-4 w-4 text-zinc-400 group-hover/btn:text-blue-600" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 items-start max-w-3xl",
                    message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "h-8 w-8 shrink-0 flex items-center justify-center rounded-sm border shadow-sm",
                    message.role === "user"
                      ? "bg-blue-900 border-blue-800 text-white"
                      : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                  )}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={cn(
                    "flex flex-col gap-1 min-w-[200px]",
                    message.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-6 py-5 shadow-sm text-base leading-7 border",
                      message.role === "user"
                        ? "bg-blue-600 text-white border-blue-700 rounded-xl rounded-tr-none"
                        : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 rounded-xl rounded-tl-none"
                    )}>
                      {message.role === "assistant" ? (
                        <div className="prose prose-lg max-w-none prose-headings:mt-5 prose-headings:mb-3 prose-p:my-4 prose-p:leading-8 prose-li:my-2 prose-li:leading-7 prose-ol:list-decimal prose-ul:list-disc prose-ul:my-3 prose-ol:my-3 prose-pre:bg-zinc-950 prose-pre:text-zinc-100 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 dark:prose-invert">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({node, ...props}) => (
                                <a {...props} rel="noreferrer" target="_blank" />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
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
              className="flex gap-4 items-start mr-auto max-w-3xl"
            >
              <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-lg rounded-tl-none shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Processing Request...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 p-4 sm:p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto relative flex gap-3">
          <div className="flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your query here..."
              className="min-h-[50px] max-h-[150px] rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 resize-none text-sm shadow-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-[50px] w-[50px] rounded-md bg-blue-700 hover:bg-blue-800 text-white shadow-sm border border-blue-800 transition-colors shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        <div className="max-w-4xl mx-auto mt-2 flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
          <span>Secure Channel Encrypted (AES-256)</span>
          <span>System V.2.4.0</span>
        </div>
      </div>
    </div>
  );
}
