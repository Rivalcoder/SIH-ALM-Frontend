"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  selectedFile: File | null;
  audioUrl: string | null;
  duration: number;
}

export function AudioPlayer({ selectedFile, audioUrl, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!selectedFile || !audioUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Play Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-16 w-16 rounded-2xl bg-green-100 dark:bg-green-900/30 border-2 border-green-500 shadow-lg"
              >
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Pause className="h-6 w-6 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0, rotate: 90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Play className="h-6 w-6 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400 ml-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            <audio ref={audioRef} src={audioUrl} className="hidden" />

            {/* File Info & Progress */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {duration.toFixed(2)}s
                  </p>
                </div>
                <Volume2 className="h-4 w-4 text-muted-foreground ml-4" />
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-gray-200 dark:bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg border-2 border-purple-500"
                  style={{ left: `${progress}%`, marginLeft: '-8px' }}
                  animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                />
              </div>

              {/* Time Display */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Visualizer */}
            <div className="hidden md:flex items-center gap-1 h-12 px-3 bg-gray-100 dark:bg-muted/30 rounded-xl">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  animate={{
                    height: isPlaying
                      ? `${20 + Math.sin((i * 0.5) + Date.now() / 100) * 40 + Math.random() * 20}%`
                      : "30%",
                  }}
                  transition={{
                    duration: 0.3,
                    delay: i * 0.02,
                    repeat: isPlaying ? Infinity : 0,
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

