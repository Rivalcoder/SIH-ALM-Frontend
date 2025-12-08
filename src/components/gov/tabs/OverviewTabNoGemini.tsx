"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/analyze/StatCard";
import { Users, Globe, HeartPulse, Gauge, Info, Wind, User, Mic2, Zap, Pause } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";
import { getLanguageName } from "@/lib/languageUtils";

interface OverviewTabNoGeminiProps {
  analysis: DatasetSample;
  safeData?: any; // Raw API data for Quick Stats
}

export function OverviewTabNoGemini({ analysis, safeData }: OverviewTabNoGeminiProps) {
  // Extract emotion data from paralinguistics
  const paralinguistics = analysis.paralinguistics as {
    emotions?: Record<string, number>;
    dominant_emotion?: string;
  } | undefined;
  
  const dominantEmotion = paralinguistics?.dominant_emotion || "neutral";
  
  // Count unique speakers (not segments)
  const uniqueSpeakers = new Set(
    analysis.diarization.map(seg => seg.speaker).filter(Boolean)
  );
  const speakerCount = uniqueSpeakers.size || analysis.diarization.length;
  
  // Format emotion name for display
  const formatEmotion = (emotion: string) => {
    return emotion.charAt(0).toUpperCase() + emotion.slice(1);
  };

  return (
    <div className="w-full space-y-8">
      {/* Combined Stats Grid - All 8 stats together */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Speakers Detected"
          value={speakerCount}
          icon={Users}
          description="Distinct voices identified"
          index={0}
        />
        <StatCard
          title="Language"
          value={getLanguageName(analysis.language)}
          icon={Globe}
          description="Primary language spoken"
          index={1}
        />
        <StatCard
          title="Audio Emotion"
          value={formatEmotion(dominantEmotion)}
          icon={HeartPulse}
          description="Detected audio emotion"
          index={2}
        />
        <StatCard
          title="Duration"
          value={`${analysis.duration.toFixed(1)}s`}
          icon={Gauge}
          description="Total audio length"
          index={3}
        />
        {/* Quick Stats as StatCards */}
        {safeData && (
          <>
            <StatCard
              title="Gender"
              value={`${(safeData.paralinguistics?.gender?.gender || 'Unknown').charAt(0).toUpperCase() + (safeData.paralinguistics?.gender?.gender || 'Unknown').slice(1)}`}
              icon={User}
              description="Detected gender"
              index={4}
            />
            <StatCard
              title="Speakers"
              value={safeData.diarization?.num_speakers || 0}
              icon={Mic2}
              description="Number of speakers"
              index={5}
            />
            <StatCard
              title="Energy"
              value={`${safeData.paralinguistics?.energy?.energy_db || '0'} dB`}
              icon={Zap}
              description="Audio energy level"
              index={6}
            />
            <StatCard
              title="Pauses"
              value={safeData.paralinguistics?.pauses?.num_pauses || '0'}
              icon={Pause}
              description="Number of pauses"
              index={7}
            />
          </>
        )}
      </div>

      {/* Background Events */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <Card className="border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-500">
                  <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold">Background Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-medium text-sm backdrop-blur-sm">
                  {analysis.audio_event.replace(/_/g, " ").split(" ").map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(" ")}
                </span>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* Summary Card - Clean design with consistent colors */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <Card className="border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-500">
                  <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold">Analysis Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                This audio contains <span className="font-semibold text-foreground">{speakerCount}</span> speaker{speakerCount !== 1 ? "s" : ""} speaking in{" "}
                <span className="font-semibold text-foreground">{getLanguageName(analysis.language)}</span>. The audio includes a{" "}
                <span className="font-semibold text-foreground">{analysis.audio_event.replace(/_/g, " ")}</span> event mixed at{" "}
                <span className="font-semibold text-foreground">{(analysis.mixing_ratios.nonspeech * 100).toFixed(0)}%</span> non-speech content. The analysis generated{" "}
                <span className="font-semibold text-foreground">{analysis.question_answer_pair.length}</span> question-answer pair{analysis.question_answer_pair.length !== 1 ? "s" : ""} from the content.
              </p>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

