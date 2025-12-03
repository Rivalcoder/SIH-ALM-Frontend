"use client";

import { useMemo } from "react";
import { ChartCard } from "../ChartCard";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DatasetSample } from "@/lib/datasetSamples";

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <ChartCard
        title="Audio Metrics"
        description="Duration and mixing ratios analysis"
        index={0}
      >
        <div className="h-64 w-full bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={audioMetrics} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="audioMetricsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                fill="url(#audioMetricsGradient)"
                radius={[8, 8, 0, 0]}
              />
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
              <defs>
                <linearGradient id="speakerDurationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                fill="url(#speakerDurationGradient)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

