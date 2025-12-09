"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { ChartCard } from "../ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DatasetSample } from "@/lib/datasetSamples";
import { HeartPulse } from "lucide-react";

interface VisualizationsTabProps {
  analysis: DatasetSample;
}

export function VisualizationsTab({ analysis }: VisualizationsTabProps) {
  const audioMetrics = useMemo(() => {
    return [
      { name: "Duration", value: analysis.duration, unit: "s" },
      { name: "Speech Ratio", value: analysis.mixing_ratios.speech * 100, unit: "%" },
      { name: "Non-Speech Ratio", value: analysis.mixing_ratios.nonspeech * 100, unit: "%" },
    ];
  }, [analysis]);

  const speakerData = useMemo(() => {
    const speakerMap = new Map<string, number>();
    analysis.diarization.forEach((seg) => {
      const duration = seg.end - seg.start;
      speakerMap.set(seg.speaker, (speakerMap.get(seg.speaker) || 0) + duration);
    });
    return Array.from(speakerMap.entries()).map(([speaker, duration]) => ({
      name: speaker,
      duration: Math.round(duration),
    }));
  }, [analysis]);

  // Extract emotion data from paralinguistics
  const paralinguistics = analysis.paralinguistics as {
    emotions?: Record<string, number>;
    dominant_emotion?: string;
  } | undefined;

  const dominantEmotion = paralinguistics?.dominant_emotion || "neutral";
  const emotionScores = paralinguistics?.emotions || {};

  // Format emotion name for display
  const formatEmotion = (emotion: string) => {
    return emotion.charAt(0).toUpperCase() + emotion.slice(1);
  };

  // Gender confidence scores (female/male) from paralinguistics
  const genderConfidence = useMemo(() => {
    const genderInfo = (analysis.paralinguistics as any)?.gender || {};
    const allScoresRaw = genderInfo.all_scores || {};
    // Normalize possible key shapes (lower/upper case, arrays)
    const femaleScore =
      typeof allScoresRaw === "object" && !Array.isArray(allScoresRaw)
        ? Number(
            allScoresRaw.female ??
            allScoresRaw.Female ??
            allScoresRaw.FEMALE ??
            allScoresRaw["f"] ??
            0
          )
        : Array.isArray(allScoresRaw)
        ? Number(allScoresRaw[0] ?? 0)
        : Number(allScoresRaw ?? 0);
    const maleScore =
      typeof allScoresRaw === "object" && !Array.isArray(allScoresRaw)
        ? Number(
            allScoresRaw.male ??
            allScoresRaw.Male ??
            allScoresRaw.MALE ??
            allScoresRaw["m"] ??
            0
          )
        : Array.isArray(allScoresRaw)
        ? Number(allScoresRaw[1] ?? 0)
        : 0;

    const safeFemale = Number.isFinite(femaleScore) ? femaleScore : 0;
    const safeMale = Number.isFinite(maleScore) ? maleScore : 0;

    return {
      label: genderInfo.gender || "unknown",
      confidencePct: (genderInfo.confidence ?? 0) * 100,
      scores: [
        { name: "Female", value: safeFemale * 100 },
        { name: "Male", value: safeMale * 100 },
      ],
    };
  }, [analysis]);

  // Extract all background events from paralinguistics (stored directly from API)
  const backgroundEvents = useMemo(() => {
    const paralinguistics = analysis.paralinguistics as {
      background_events?: Array<{ name: string; score: number }>;
    } | undefined;

    if (paralinguistics?.background_events && Array.isArray(paralinguistics.background_events)) {
      // Convert scores to percentages and return
      return paralinguistics.background_events.map(event => ({
        name: event.name,
        percentage: (event.score || 0) * 100
      }));
    }

    // Fallback: Try to parse from Q&A if background_events not available
    const eventsQnA = analysis.question_answer_pair.find(
      (qa) => qa.question === "What audio events were detected?"
    );

    if (!eventsQnA || !eventsQnA.answer) {
      return [];
    }

    // Parse the answer string like "Speech (99.2%), Inside, small room (0.2%), Narration, monologue (0.1%)"
    const speechKeywords = ['speech', 'speaker', 'voice', 'narration', 'monologue', 'synthesizer'];
    const events: Array<{ name: string; percentage: number }> = [];

    // Split by comma and parse each event
    const eventStrings = eventsQnA.answer.split(',').map(s => s.trim());

    for (const eventStr of eventStrings) {
      // Match pattern like "Event Name (percentage%)"
      const match = eventStr.match(/^(.+?)\s*\(([\d.]+)%\)$/);
      if (match) {
        const eventName = match[1].trim();
        const percentage = parseFloat(match[2]);

        // Skip speech-related events
        const isSpeechEvent = speechKeywords.some(keyword =>
          eventName.toLowerCase().includes(keyword)
        );

        if (!isSpeechEvent && eventName && !isNaN(percentage)) {
          events.push({ name: eventName, percentage });
        }
      }
    }

    // Sort by percentage descending
    return events.sort((a, b) => b.percentage - a.percentage);
  }, [analysis]);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        <ChartCard
          title="Audio Metrics"
          description="Duration and mixing ratios analysis"
          index={0}
        >
          <div className="h-64 w-full bg-transparent">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={audioMetrics} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 4px 24px hsl(0 0% 0% / 0.1)",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                >
                  {audioMetrics.map((entry, index) => {
                    const colors = ["#8b5cf6", "#ec4899", "#06b6d4"];
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Speaker Duration Distribution"
          description="Time each speaker was active"
          index={1}
        >
          <div className="h-64 w-full bg-transparent">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speakerData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 4px 24px hsl(0 0% 0% / 0.1)",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar
                  dataKey="duration"
                  radius={[8, 8, 0, 0]}
                >
                  {speakerData.map((entry, index) => {
                    const colors = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Gender Confidence"
          description={`Detected: ${genderConfidence.label} (${genderConfidence.confidencePct.toFixed(1)}% confidence)`}
          index={2}
        >
          <div className="h-64 w-full bg-transparent">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderConfidence.scores} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  fontSize={12}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--foreground))" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 4px 24px hsl(0 0% 0% / 0.1)",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(val: number) => `${val.toFixed(2)}%`}
                />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {genderConfidence.scores.map((entry, index) => {
                    const colors = ["#ec4899", "#3b82f6"];
                    return <Cell key={`gender-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Emotion and Background Events Summary */}
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
                <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-500">
                  <HeartPulse className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold">Emotion & Background Events</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Emotion Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Audio Emotions</h3>
                <div className="space-y-3">
                  {Object.entries(emotionScores).length > 0 ? (
                    Object.entries(emotionScores)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([emotion, score]) => {
                        const percentage = ((score as number) * 100).toFixed(1);
                        const isDominant = emotion === dominantEmotion;
                        return (
                          <div key={emotion} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className={`font-medium ${isDominant ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'}`}>
                                {formatEmotion(emotion)}
                                {isDominant && <span className="ml-2 text-xs">(Dominant)</span>}
                              </span>
                              <span className="text-muted-foreground">{percentage}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className={`h-full rounded-full ${isDominant
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                  }`}
                              />
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-sm text-muted-foreground">No emotion data available</p>
                  )}
                </div>
              </div>

              {/* Background Events */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Background Events</h3>
                <div className="flex flex-wrap gap-2">
                  {backgroundEvents.length > 0 ? (
                    backgroundEvents.slice(0, 3).map((event, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-gradient-to-r from-purple-500/90 to-pink-500/80 text-white shadow-sm"
                      >
                        {event.name
                          .split(", ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(", ")}
                      </span>
                    ))
                  ) : (
                    // Fallback to single event if parsing fails
                    <span className="px-3 py-1 text-xs sm:text-sm font-semibold rounded-full bg-gradient-to-r from-purple-500/90 to-pink-500/80 text-white shadow-sm">
                      {analysis.audio_event
                        .replace(/_/g, " ")
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

