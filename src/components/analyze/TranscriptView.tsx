"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader, Text, Languages } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";

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

  const segments = analysis.diarization.map((seg, idx) => {
    const speakerLabel = seg.speaker || `Speaker ${idx + 1}`;
    return `${speakerLabel}: ${analysis.transcription}`;
  });

  return segments.join("\n\n");
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
      <Card className="border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Text className="h-6 w-6 text-accent" />
              </motion.div>
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
                    <SelectItem value="Original">Original ({analysis.language})</SelectItem>
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
              <div className="relative bg-muted/30 backdrop-blur-sm p-6 rounded-xl border border-border/50">
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

