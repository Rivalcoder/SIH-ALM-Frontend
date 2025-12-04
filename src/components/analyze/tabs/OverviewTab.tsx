"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { Users, Globe, Wind, Gauge, Info } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";

interface OverviewTabProps {
  analysis: DatasetSample;
}

export function OverviewTab({ analysis }: OverviewTabProps) {
  return (
    <div className="w-full space-y-8">
      {/* Stats Grid - Improved alignment and spacing */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Speakers Detected"
          value={analysis.diarization.length}
          icon={Users}
          description="Distinct voices identified"
          index={0}
        />
        <StatCard
          title="Language"
          value={analysis.language.charAt(0).toUpperCase() + analysis.language.slice(1)}
          icon={Globe}
          description="Primary language spoken"
          index={1}
        />
        <StatCard
          title="Audio Event"
          value={analysis.audio_event.replace(/_/g, " ")}
          icon={Wind}
          description="Detected background event"
          index={2}
        />
        <StatCard
          title="Duration"
          value={`${analysis.duration.toFixed(1)}s`}
          icon={Gauge}
          description="Total audio length"
          index={3}
        />
      </div>

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
                This audio contains <span className="font-semibold text-foreground">{analysis.diarization.length}</span> speaker{analysis.diarization.length !== 1 ? "s" : ""} speaking in{" "}
                <span className="font-semibold text-foreground">{analysis.language}</span>. The audio includes a{" "}
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

