"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightCard } from "../InsightCard";
import { Target, ListTodo, Hand, BotMessageSquare, Loader } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";
import { extractActionItems, extractKeyDecisions, extractKeyTopics } from "@/lib/aiUtils";

interface InsightsTabProps {
  analysis: DatasetSample;
}

export function InsightsTab({ analysis }: InsightsTabProps) {
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [keyDecisions, setKeyDecisions] = useState<string[]>([]);
  const [keyTopics, setKeyTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback topics from Q&A questions
  const fallbackTopics = useMemo(() => {
    return analysis.question_answer_pair.map((qa) => qa.question);
  }, [analysis]);

  // Extract insights using AI
  useEffect(() => {
    const extractInsights = async () => {
      setIsLoading(true);
      try {
        const [actions, decisions, topics] = await Promise.all([
          extractActionItems(analysis),
          extractKeyDecisions(analysis),
          extractKeyTopics(analysis),
        ]);
        
        setActionItems(actions);
        setKeyDecisions(decisions);
        setKeyTopics(topics.length > 0 ? topics : fallbackTopics);
      } catch (error) {
        console.error('Failed to extract insights:', error);
        // Fallback to simple extraction
        setActionItems([]);
        setKeyDecisions([]);
        setKeyTopics(fallbackTopics);
      } finally {
        setIsLoading(false);
      }
    };

    extractInsights();
  }, [analysis, fallbackTopics]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        <div className="md:col-span-2 lg:col-span-3 flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader className="h-5 w-5 animate-spin" />
            <span>Analyzing insights...</span>
          </div>
        </div>
      ) : (
        <>
          <InsightCard
            title="Key Topics"
            icon={Target}
            data={keyTopics}
            emptyText="No key topics were identified."
            index={0}
            gradient="from-blue-500/20 via-cyan-500/20 to-teal-500/20"
          />
          <InsightCard
            title="Action Items"
            icon={ListTodo}
            data={actionItems}
            emptyText="No action items were mentioned."
            index={1}
            gradient="from-purple-500/20 via-pink-500/20 to-rose-500/20"
          />
          <InsightCard
            title="Key Decisions"
            icon={Hand}
            data={keyDecisions}
            emptyText="No key decisions were identified."
            index={2}
            gradient="from-emerald-500/20 via-green-500/20 to-teal-500/20"
          />
        </>
      )}

      {/* Q&A Pairs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="md:col-span-2 lg:col-span-3"
      >
        <Card className="border border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/30 border border-pink-500">
                  <BotMessageSquare className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <span className="text-xl font-bold">Question & Answer Pairs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.question_answer_pair.length > 0 ? (
                <div className="space-y-4">
                  {analysis.question_answer_pair.map((qa, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      className="relative p-5 rounded-xl bg-gray-50 dark:bg-muted/30 border-l-4 border-pink-500 backdrop-blur-sm"
                    >
                      <div className="relative">
                        <p className="font-bold text-sm mb-2 text-foreground">Q: {qa.question}</p>
                        <p className="text-sm text-foreground/80 leading-relaxed">A: {qa.answer}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No Q&A pairs were generated.</p>
              )}
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

