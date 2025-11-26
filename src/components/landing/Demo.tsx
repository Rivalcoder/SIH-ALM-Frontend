"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Demo() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleDemo = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => setIsDone(false), 3000);
    }, 2000);
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Experience the <span className="gradient-text">Power</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload any audio and watch ALM-Asia decode its meaning
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Audio waveform visualization */}
          <Card className="glass p-8">
            <div className="flex items-center justify-center h-32 space-x-1">
              {[...Array(60)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-accent/50 rounded-full transition-all duration-300"
                  style={{
                    height: isProcessing
                      ? `${Math.random() * 100}%`
                      : "20%",
                    animationDelay: `${i * 0.02}s`,
                  }}
                />
              ))}
            </div>
          </Card>

          {/* Upload button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleDemo}
              disabled={isProcessing}
              className="bg-accent hover:bg-accent/90 text-accent-foreground hover-glow px-12 group"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Audio...
                </>
              ) : isDone ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Analysis Complete!
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Upload Audio
                </>
              )}
            </Button>
          </div>

          {/* Demo output */}
          {isDone && (
            <Card className="glass p-8 fade-in-up">
              <h3 className="text-xl font-semibold mb-4 text-accent">AI Analysis Output</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
                  <p className="text-foreground">
                    "Hello, I need assistance with my flight booking..."
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Detected Emotions:</p>
                  <div className="flex gap-2 flex-wrap">
                    {["Concerned", "Polite", "Urgent"].map((emotion) => (
                      <span
                        key={emotion}
                        className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Context:</p>
                  <p className="text-foreground">
                    Customer service interaction, airport environment, multiple speakers detected
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
