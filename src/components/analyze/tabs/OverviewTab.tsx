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
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Speakers Detected"
          value={analysis.diarization.length}
          icon={Users}
          description="Distinct voices identified"
          index={0}
          gradient="from-blue-500/30 via-cyan-500/20 to-transparent"
        />
        <StatCard
          title="Language"
          value={analysis.language.charAt(0).toUpperCase() + analysis.language.slice(1)}
          icon={Globe}
          description="Primary language spoken"
          index={1}
          gradient="from-purple-500/30 via-pink-500/20 to-transparent"
        />
        <StatCard
          title="Audio Event"
          value={analysis.audio_event.replace(/_/g, " ")}
          icon={Wind}
          description="Detected background event"
          index={2}
          gradient="from-emerald-500/30 via-green-500/20 to-transparent"
        />
        <StatCard
          title="Duration"
          value={`${analysis.duration.toFixed(1)}s`}
          icon={Gauge}
          description="Total audio length"
          index={3}
          gradient="from-amber-500/30 via-orange-500/20 to-transparent"
        />
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative z-10">
            <CardHeader>
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Info className="h-6 w-6 text-accent" />
                </motion.div>
                <CardTitle className="text-2xl font-bold">Analysis Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-base text-foreground/80 leading-relaxed"
              >
                This audio contains {analysis.diarization.length} speaker{analysis.diarization.length !== 1 ? "s" : ""} speaking in{" "}
                {analysis.language}. The audio includes a {analysis.audio_event.replace(/_/g, " ")} event mixed at{" "}
                {(analysis.mixing_ratios.nonspeech * 100).toFixed(0)}% non-speech content. The analysis generated{" "}
                {analysis.question_answer_pair.length} question-answer pairs from the content.
              </motion.p>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

