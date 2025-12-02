"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DATASET_SAMPLES, DatasetSample } from "@/lib/datasetSamples";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AudioWaveform,
  FileText,
  Users,
  MessageSquare,
  Volume2,
  Clock,
  Globe,
  FileAudio,
  Copy,
  Check,
  Sparkles,
  Mic,
  Radio,
  Layers,
  Code,
  Layout,
} from "lucide-react";

export function DatasetExplorer() {
  const [selected, setSelected] = useState<DatasetSample | null>(
    DATASET_SAMPLES[0] ?? null
  );
  const [copied, setCopied] = useState(false);
  const [showJsonView, setShowJsonView] = useState(false);

  const handleCopy = () => {
    if (!selected) return;
    const json = JSON.stringify(selected, null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(json).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  return (
    <section className="w-full py-10 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-semibold tracking-tight">Dataset Explorer</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Browse curated examples from the ALM-Asia audio corpus. Select a row to
          inspect how speech, non-speech events and metadata are combined into a
          single training-ready JSON object.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
        <div className="space-y-3">
          {DATASET_SAMPLES.map((sample, index) => {
            const isActive = selected?.audio_id === sample.audio_id;
            return (
              <motion.div
                key={sample.audio_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer border transition-all duration-300 hover:border-accent/80 hover:shadow-md ${
                    isActive ? "border-accent bg-accent/5 shadow-lg scale-[1.02]" : "border-border"
                }`}
                onClick={() => setSelected(sample)}
              >
                <div className="flex flex-col gap-1 p-4 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium truncate">
                      {sample.audio_id}
                    </span>
                      <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-[0.16em]">
                      {sample.language}
                      </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span>Event: {sample.audio_event}</span>
                    <span>Source: {sample.source}</span>
                    <span>Duration: {sample.duration.toFixed(2)}s</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    <span>
                      QA: {sample.question_answer_pair.length}
                    </span>
                    <span>
                      Speakers: {new Set(sample.diarization.map((d) => d.speaker)).size}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {sample.transcription}
                  </p>
                </div>
              </Card>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.audio_id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="flex flex-col border-2 border-accent/20 bg-gradient-to-br from-background via-background to-accent/5 h-[800px] max-h-[800px]">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-muted/30 px-6 py-4 shrink-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AudioWaveform className="h-5 w-5 text-accent-foreground" />
                      <p className="text-base font-semibold">
                        {selected.audio_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {selected.language}
                      </Badge>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Radio className="h-3 w-3" />
                        {selected.audio_event}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                  {selected.duration.toFixed(2)}s
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="json-view-toggle"
                        checked={showJsonView}
                        onCheckedChange={(checked) => setShowJsonView(checked === true)}
                      />
                      <Label
                        htmlFor="json-view-toggle"
                        className="text-sm cursor-pointer flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showJsonView ? (
                          <>
                            <Code className="h-3.5 w-3.5" />
                            Show JSON
                          </>
                        ) : (
                          <>
                            <Layout className="h-3.5 w-3.5" />
                            Show UI
                          </>
                        )}
                      </Label>
                    </div>
            <Button
              size="sm"
              variant="outline"
              type="button"
                      onClick={handleCopy}
                      className="gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  {showJsonView ? (
                    <ScrollArea className="h-full w-full">
                      <div className="flex-1 overflow-auto bg-muted p-4">
                        <pre className="text-xs leading-relaxed font-mono text-foreground">
                          {JSON.stringify(selected, null, 2)}
                        </pre>
                      </div>
                    </ScrollArea>
                  ) : (
                    <ScrollArea className="h-full w-full">
                      <div className="p-6 space-y-6">
                        {/* Transcription Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <h3 className="text-sm font-semibold">Transcription</h3>
                    </div>
                    <Card className="p-4 bg-blue-500/5 border-blue-500/20">
                      <p className="text-sm leading-relaxed">{selected.transcription}</p>
                    </Card>
                  </motion.div>

                  {/* Metadata Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="h-4 w-4 text-purple-500" />
                      <h3 className="text-sm font-semibold">Metadata</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-xs font-medium text-muted-foreground">Source</span>
                        </div>
                        <p className="text-sm font-semibold">{selected.source}</p>
                      </Card>
                      <Card className="p-3 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Volume2 className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-xs font-medium text-muted-foreground">Audio Event</span>
                        </div>
                        <p className="text-sm font-semibold capitalize">{selected.audio_event.replace(/_/g, " ")}</p>
                      </Card>
                    </div>
                  </motion.div>

                  {/* Mixing Ratios */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-semibold">Mixing Ratios</h3>
                    </div>
                    <Card className="p-4 bg-amber-500/5 border-amber-500/20">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Speech</span>
                            <span className="font-medium">{(selected.mixing_ratios.speech * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${selected.mixing_ratios.speech * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Non-Speech</span>
                            <span className="font-medium">{(selected.mixing_ratios.nonspeech * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${selected.mixing_ratios.nonspeech * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  {/* Diarization */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <h3 className="text-sm font-semibold">
                        Diarization ({selected.diarization.length} segments)
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {selected.diarization.map((segment, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                        >
                          <Card className="p-3 bg-indigo-500/5 border-indigo-500/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Mic className="h-3.5 w-3.5 text-indigo-500" />
                                <Badge variant="secondary" className="text-xs">
                                  {segment.speaker}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{segment.start.toFixed(2)}s</span>
                                <span>→</span>
                                <span>{segment.end.toFixed(2)}s</span>
                                <span className="ml-2 font-medium">
                                  ({(segment.end - segment.start).toFixed(2)}s)
                                </span>
                              </div>
                            </div>
                            {/* Timeline visualization */}
                            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${((segment.end - segment.start) / selected.duration) * 100}%` }}
                                transition={{ duration: 0.6, delay: 0.4 + idx * 0.05 }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                style={{
                                  marginLeft: `${(segment.start / selected.duration) * 100}%`,
                                }}
                              />
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Question-Answer Pairs */}
                  {selected.question_answer_pair.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-sm font-semibold">
                          Q&A Pairs ({selected.question_answer_pair.length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {selected.question_answer_pair.map((qa, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 + idx * 0.1 }}
                          >
                            <Card className="p-4 bg-emerald-500/5 border-emerald-500/20 space-y-2">
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5 p-1 rounded bg-emerald-500/10">
                                  <MessageSquare className="h-3 w-3 text-emerald-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">Question</p>
                                  <p className="text-sm">{qa.question}</p>
                                </div>
                              </div>
                              <Separator className="bg-emerald-500/20" />
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5 p-1 rounded bg-emerald-500/20">
                                  <Check className="h-3 w-3 text-emerald-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">Answer</p>
                                  <p className="text-sm font-medium">{qa.answer}</p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Source Information */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Separator />
                    <div className="grid grid-cols-1 gap-3 pt-4">
                      <Card className="p-3 bg-slate-500/5 border-slate-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <FileAudio className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-xs font-semibold">Speech Source</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p><span className="text-muted-foreground">Type:</span> {selected.speech_source.type}</p>
                          <p><span className="text-muted-foreground">File:</span> {selected.speech_source.original_file}</p>
                          <p><span className="text-muted-foreground">ID:</span> {selected.speech_source.utterance_id}</p>
                        </div>
                      </Card>
                      <Card className="p-3 bg-slate-500/5 border-slate-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Radio className="h-3.5 w-3.5 text-slate-500" />
                          <span className="text-xs font-semibold">Non-Speech Source</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p><span className="text-muted-foreground">Event:</span> {selected.nonspeech_source.audio_event}</p>
                          <p><span className="text-muted-foreground">Source:</span> {selected.nonspeech_source.source}</p>
                          <p><span className="text-muted-foreground">File:</span> {selected.nonspeech_source.original_file}</p>
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="flex flex-col items-center justify-center h-full min-h-[400px] border-dashed">
                <div className="text-center space-y-3 p-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <AudioWaveform className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Select a sample</p>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Click on a sample from the left to view its detailed breakdown
                  </p>
          </div>
        </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
