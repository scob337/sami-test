'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeInUp } from '@/lib/animations'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export interface QuestionOption {
  id: number
  optionText: string
  sortOrder: number
  scores: {
    pattern: string
    score: number
  }[]
}

export interface Question {
  id: number
  questionText: string
  options: QuestionOption[]
  sortOrder: number
}

interface QuestionCardProps {
  question: Question
  selectedAnswerId?: number
  onAnswerSelect: (optionId: number) => void
  isLoading?: boolean
}

export function QuestionCard({
  question,
  selectedAnswerId,
  onAnswerSelect,
  isLoading = false,
}: QuestionCardProps) {
  const { theme } = useTheme()
  const isEnglish = false // TODO: Get from i18n context
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      {/* Question Header */}
      <div className={cn("space-y-6 text-center", isEnglish ? "lg:text-left" : "lg:text-right")}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-black uppercase tracking-widest"
        >
          {isEnglish ? `Question ${question.sortOrder || 1}` : `السؤال رقم ${question.sortOrder || 1}`}
        </motion.div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] text-foreground tracking-tight">
          {question.questionText}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(question.options || []).map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onAnswerSelect(option.id)}
            disabled={isLoading}
            className={cn(
              "group relative w-full p-8 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden",
              isEnglish ? "text-left" : "text-right",
              selectedAnswerId === option.id
                ? "border-primary bg-primary/10 shadow-2xl shadow-primary/20 scale-[1.02]"
                : "border-border/60 hover:border-primary/40 bg-card/40 backdrop-blur-xl hover:bg-card/80 hover:shadow-xl"
            )}
          >
            {/* Background Accent */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              selectedAnswerId === option.id && "opacity-100"
            )} />
            
            <div className={cn("relative flex items-center justify-between gap-6", isEnglish && "flex-row-reverse")}>
              <div className="flex-1 space-y-1">
                <span className={cn(
                  "block text-xl md:text-2xl font-black transition-all duration-300",
                  selectedAnswerId === option.id ? "text-primary translate-x-1" : "text-foreground"
                )}>
                  {option.optionText}
                </span>
              </div>
              
              {/* Radio-style indicator */}
              <div className={cn(
                "w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 shrink-0",
                selectedAnswerId === option.id 
                  ? "border-primary bg-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.4)] scale-110" 
                  : "border-border/80 bg-background/50 group-hover:border-primary/50 group-hover:scale-105"
              )}>
                <div className={cn(
                  "w-4 h-4 rounded-full transition-all duration-500",
                  selectedAnswerId === option.id 
                    ? "bg-primary scale-100 shadow-[0_0_10px_rgba(var(--primary),0.8)]" 
                    : "bg-transparent scale-0"
                )} />
              </div>
            </div>

            {/* Selection highlight bar */}
            {selectedAnswerId === option.id && (
              <motion.div 
                layoutId="answer-active-bar"
                className={cn("absolute top-0 bottom-0 w-2 bg-primary", isEnglish ? "left-0" : "right-0")}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
