import { DatasetSample } from "@/lib/datasetSamples";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AnalysisHistory {
  id: string;
  fileName: string;
  timestamp: Date;
  result: DatasetSample;
  chatMessages: ChatMessage[];
}

