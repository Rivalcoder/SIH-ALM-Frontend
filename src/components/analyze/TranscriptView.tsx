"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader, Text, Languages } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";
import { getLanguageName } from "@/lib/languageUtils";

interface TranscriptViewProps {
  analysis: DatasetSample;
  translatedTranscript: string | null;
  isTranslating: boolean;
  targetLanguage: string;
  showDiarization: boolean;
  onLanguageChange: (lang: string) => void;
  onDiarizationToggle: (show: boolean) => void;
}

const buildDiarizedTranscript = (analysis: DatasetSample): string => {
  if (!analysis.diarization || analysis.diarization.length === 0) {
    return analysis.transcription;
  }

  // Check if we have access to diarization_with_text from the API response
  // This is stored in paralinguistics
  const paralinguistics = analysis.paralinguistics as {
    diarization_with_text?: Array<{
      speaker: string;
      start: number;
      end: number;
      text: string;
    }>;
  } | undefined;

  // If we have segment-level text, use it (this is the proper way)
  if (paralinguistics?.diarization_with_text && paralinguistics.diarization_with_text.length > 0) {
    return paralinguistics.diarization_with_text
      .map((seg) => {
        const speakerLabel = seg.speaker || "Unknown Speaker";
        return `${speakerLabel}: ${seg.text}`;
      })
      .join("\n\n");
  }

  // Fallback: If no segment-level text, just show the transcript once with the first speaker
  // Don't repeat it for each segment
  const firstSpeaker = analysis.diarization[0]?.speaker || "Speaker";
  return `${firstSpeaker}: ${analysis.transcription}`;
};

export function TranscriptView({
  analysis,
  translatedTranscript,
  isTranslating,
  targetLanguage,
  showDiarization,
  onLanguageChange,
  onDiarizationToggle,
}: TranscriptViewProps) {
  const transcriptContent =
    translatedTranscript || (showDiarization ? buildDiarizedTranscript(analysis) : analysis.transcription);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-sky-100 dark:bg-sky-900/30 border border-sky-500">
                <Text className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Transcript</CardTitle>
                <CardDescription className="mt-1">
                  Full transcription of your audio content
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-3 bg-muted/50 rounded-lg px-4 py-2">
                <Switch
                  id="diarization-mode"
                  checked={showDiarization}
                  onCheckedChange={onDiarizationToggle}
                />
                <Label htmlFor="diarization-mode" className="cursor-pointer text-sm font-medium">
                  Show Speakers
                </Label>
              </div>
              <div className="w-full md:w-56">
                <Select onValueChange={onLanguageChange} value={targetLanguage}>
                  <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50 h-11">
                    <Languages className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Original">Original ({getLanguageName(analysis.language)})</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Telugu">Telugu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isTranslating ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-16 space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader className="h-8 w-8 text-accent" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Translating transcript...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-xl blur-xl" />
              <div className="relative bg-gray-50 dark:bg-muted/30 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-border/50">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground/90 font-medium">
                  {transcriptContent}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

