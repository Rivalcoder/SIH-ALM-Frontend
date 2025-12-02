"use client";

import { useState } from "react";
import { DATASET_SAMPLES, DatasetSample } from "@/lib/datasetSamples";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DatasetExplorer() {
  const [selected, setSelected] = useState<DatasetSample | null>(
    DATASET_SAMPLES[0] ?? null
  );

  return (
    <section className="w-full py-10 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Dataset Explorer</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Browse curated examples from the ALM-Asia audio corpus. Select a row to
          inspect how speech, non-speech events and metadata are combined into a
          single training-ready JSON object.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
        <div className="space-y-3">
          {DATASET_SAMPLES.map((sample) => {
            const isActive = selected?.audio_id === sample.audio_id;
            return (
              <Card
                key={sample.audio_id}
                className={`cursor-pointer border transition-colors hover:border-accent/80 ${
                  isActive ? "border-accent bg-accent/5" : "border-border"
                }`}
                onClick={() => setSelected(sample)}
              >
                <div className="flex flex-col gap-1 p-4 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium truncate">
                      {sample.audio_id}
                    </span>
                    <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-accent-foreground">
                      {sample.language}
                    </span>
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
            );
          })}
        </div>

        <Card className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                {selected?.audio_id ?? "Select a sample"}
              </p>
              {selected && (
                <p className="text-xs text-muted-foreground">
                  {selected.language} • {selected.audio_event} •
                  {" "}
                  {selected.duration.toFixed(2)}s
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                if (!selected) return;
                const json = JSON.stringify(selected, null, 2);
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(json).catch(() => {
                    // swallow clipboard error silently
                  });
                }
              }}
            >
              Copy JSON
            </Button>
          </div>
          <pre className="flex-1 overflow-auto bg-muted p-4 text-xs leading-relaxed">
            {selected
              ? JSON.stringify(selected, null, 2)
              : "Click on a sample from the left to view its full JSON representation."}
          </pre>
        </Card>
      </div>
    </section>
  );
}
