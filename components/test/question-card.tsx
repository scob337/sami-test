'use client'

import { motion } from 'framer-motion'
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
  const isEnglish = false // TODO: Get from i18n context

  if (!question.options || question.options.length < 2) return null;

  const firstOption = question.options[0];
  const lastOption = question.options[question.options.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-16 w-full max-w-4xl mx-auto"
    >
      {/* Question Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 leading-tight">
          {question.questionText}
        </h2>
      </div>

      {/* Answer Model (Horizontal Scale) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 w-full">

        {/* First Option Box (Right side in Arabic context, but we will render Left-to-Right layout visually and flex-row-reverse if needed, but let's just stick to default visual order) */}
        <div className={cn(
          "w-full md:flex-1 min-h-[100px] p-6 bg-white border border-slate-200 rounded text-center flex items-center justify-center transition-all duration-300",
          selectedAnswerId === firstOption.id ? "ring-2 ring-primary border-primary shadow-sm" : "hover:border-slate-300 shadow-sm"
        )}>
          <span className="text-lg md:text-xl font-medium text-slate-700">{firstOption.optionText}</span>
        </div>

        {/* The Scale */}
        <div className="relative flex flex-col md:flex-row items-center justify-between w-full max-w-xs md:max-w-[400px] px-2 py-8 gap-6 md:gap-0">
          {/* Connector Line (Horizontal for Desktop) */}
          <div className="hidden md:block absolute left-6 right-6 h-[2px] bg-slate-200 top-1/2 -translate-y-1/2 z-0"></div>

          {/* Connector Line (Vertical for Mobile) */}
          <div className="md:hidden absolute top-6 bottom-6 w-[2px] bg-slate-200 left-1/2 -translate-x-1/2 z-0"></div>

          {/* Circles */}
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswerId === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onAnswerSelect(option.id)}
                disabled={isLoading}
                className="relative z-20 group focus:outline-none flex flex-col items-center justify-center"
                aria-label={`Select option ${idx + 1}`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-xs md:text-sm md:font-medium rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none shadow-xl">
                  {option.optionText}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>

                <div className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 bg-white flex items-center justify-center transition-all duration-300",
                  isSelected
                    ? "border-accent scale-110 shadow-md"
                    : "border-slate-200 group-hover:border-slate-400 group-hover:scale-105"
                )}>
                  {isSelected && (
                    <motion.div
                      layoutId="selected-dot"
                      className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-accent "
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Last Option Box */}
        <div className={cn(
          "w-full md:flex-1 min-h-[100px] p-6 bg-white border border-slate-200 rounded text-center flex items-center justify-center transition-all duration-300",
          selectedAnswerId === lastOption.id ? "ring-2 ring-primary border-primary shadow-sm" : "hover:border-slate-300 shadow-sm"
        )}>
          <span className="text-lg md:text-xl font-medium text-slate-700">{lastOption.optionText}</span>
        </div>

      </div>
    </motion.div>
  )
}
