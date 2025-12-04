"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightCard } from "../InsightCard";
import { Target, ListTodo, Hand, BotMessageSquare } from "lucide-react";
import { DatasetSample } from "@/lib/datasetSamples";

interface InsightsTabProps {
  analysis: DatasetSample;
}

export function InsightsTab({ analysis }: InsightsTabProps) {
  const topics = useMemo(() => {
    return analysis.question_answer_pair.map((qa) => qa.question);
  }, [analysis]);

  const actionItems = useMemo(() => {
    return analysis.question_answer_pair
      .filter((qa) => qa.answer.toLowerCase().includes("action") || qa.answer.toLowerCase().includes("task"))
      .map((qa) => qa.answer);
  }, [analysis]);

  const keyDecisions = useMemo(() => {
    return analysis.question_answer_pair
      .filter((qa) => qa.answer.toLowerCase().includes("decision") || qa.answer.toLowerCase().includes("decided"))
      .map((qa) => qa.answer);
  }, [analysis]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <InsightCard
        title="Key Topics"
        icon={Target}
        data={topics}
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

      {/* Q&A Pairs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="md:col-span-2 lg:col-span-3"
      >
        <Card className="border-2 border-gray-200 bg-white dark:border-border dark:bg-card backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative group">
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
              <CardTitle className="flex items-center gap-3">
                <motion.div
                  className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BotMessageSquare className="h-6 w-6 text-accent" />
                </motion.div>
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
                      className="relative p-5 rounded-xl bg-gray-50 dark:bg-muted/30 hover:bg-gray-100 dark:hover:bg-muted/50 transition-all border-l-4 border-accent/50 backdrop-blur-sm group/item"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/5 to-pink-500/0 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity" />
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

