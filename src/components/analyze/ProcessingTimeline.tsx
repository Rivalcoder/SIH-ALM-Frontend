"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProcessingStep = 
  | "processing_audio"
  | "transcription"
  | "emotion_detection"
  | "final_reasoning"
  | "complete";

interface ProcessingTimelineProps {
  currentStep: ProcessingStep;
}

const steps: Array<{
  id: ProcessingStep;
  label: string;
  description: string;
}> = [
  {
    id: "processing_audio",
    label: "Processing Audio File",
    description: "Analyzing audio structure and format",
  },
  {
    id: "transcription",
    label: "Transcription",
    description: "Converting speech to text",
  },
  {
    id: "emotion_detection",
    label: "Emotion Detection",
    description: "Analyzing emotional tones",
  },
  {
    id: "final_reasoning",
    label: "Final Reasoning",
    description: "Generating comprehensive analysis",
  },
];

const stepOrder: ProcessingStep[] = [
  "processing_audio",
  "transcription",
  "emotion_detection",
  "final_reasoning",
  "complete",
];

export function ProcessingTimeline({ currentStep }: ProcessingTimelineProps) {
  const currentStepIndex = stepOrder.indexOf(currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border">
          <div
            className="absolute top-0 left-0 w-full bg-primary transition-all duration-500 ease-out"
            style={{
              height: currentStepIndex >= stepOrder.length - 1 
                ? "100%" 
                : `${(currentStepIndex / (stepOrder.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-8 relative">
          {steps.map((step, index) => {
            const stepIndex = stepOrder.indexOf(step.id);
            const isCompleted = stepIndex < currentStepIndex;
            const isActive = stepIndex === currentStepIndex;
            const isPending = stepIndex > currentStepIndex;

            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* Step indicator */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      isCompleted && "bg-primary border-primary text-primary-foreground",
                      isActive && "bg-primary border-primary text-primary-foreground animate-pulse",
                      isPending && "bg-background border-border text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : isActive ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  {/* Glow effect for active step */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pt-2">
                  <h3
                    className={cn(
                      "text-lg font-semibold mb-1 transition-colors duration-300",
                      isCompleted && "text-foreground",
                      isActive && "text-primary",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </h3>
                  <p
                    className={cn(
                      "text-sm transition-colors duration-300",
                      isCompleted && "text-foreground/70",
                      isActive && "text-foreground/80",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

