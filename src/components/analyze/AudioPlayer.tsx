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
  const [actualDuration, setActualDuration] = useState(duration);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Reset state when audio changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setActualDuration(duration);
  }, [audioUrl, duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const maxDuration = actualDuration || audio.duration || duration || 0;
      const time = Math.min(audio.currentTime, maxDuration);
      setCurrentTime(time);
    };

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      if (audioDuration && isFinite(audioDuration) && audioDuration > 0) {
        setActualDuration(audioDuration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      const maxDuration = actualDuration || audio.duration || duration || 0;
      setCurrentTime(maxDuration);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    // Try to get duration if already loaded
    if (audio.readyState >= 1 && audio.duration && isFinite(audio.duration)) {
      setActualDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, actualDuration, duration]);

  // Use actual duration from audio element, fallback to prop
  const effectiveDuration = actualDuration || duration || 0;
  const progress = effectiveDuration > 0 ? Math.min((currentTime / effectiveDuration) * 100, 100) : 0;

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

  // Calculate seek position from mouse event
  const calculateSeekPosition = (clientX: number) => {
    const progressBar = progressBarRef.current;
    if (!progressBar || !effectiveDuration) return null;

    const rect = progressBar.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    return percentage * effectiveDuration;
  };

  // Handle seeking when clicking or dragging on progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !effectiveDuration) return;

    const newTime = calculateSeekPosition(e.clientX);
    if (newTime !== null) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleSeek(e);
  };

  // Handle mouse move during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const audio = audioRef.current;
      const progressBar = progressBarRef.current;
      if (!audio || !progressBar || !effectiveDuration) return;

      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * effectiveDuration;

      audio.currentTime = newTime;
      setCurrentTime(newTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, effectiveDuration]);

  if (!selectedFile || !audioUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-border bg-card backdrop-blur-xl shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Play Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-16 w-16 rounded-2xl bg-accent/10 hover:bg-accent/20 border-2 border-accent/30 shadow-lg transition-colors"
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
                      <Pause className="h-6 w-6 text-accent fill-accent" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0, rotate: 90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Play className="h-6 w-6 text-accent fill-accent ml-1" />
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
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {formatTime(effectiveDuration)}
                  </p>
                </div>
                <Volume2 className="h-4 w-4 text-muted-foreground ml-4" />
              </div>

              {/* Progress Bar */}
              <div 
                ref={progressBarRef}
                className="relative h-2 bg-muted rounded-full overflow-hidden cursor-pointer group"
                onClick={handleSeek}
                onMouseDown={handleMouseDown}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-accent/80 to-accent/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-background rounded-full shadow-lg border-2 border-accent group-hover:scale-110 transition-transform"
                  style={{ left: `${progress}%`, marginLeft: '-8px' }}
                  animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
                />
              </div>

              {/* Time Display */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(effectiveDuration)}</span>
              </div>
            </div>

            {/* Visualizer */}
            <div className="hidden md:flex items-center gap-1 h-12 px-3 bg-muted/50 rounded-xl">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-accent via-accent/80 to-accent/60 rounded-full"
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

