'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { fadeInUp } from '@/lib/animations'

export interface Answer {
  id: string
  text_ar: string
  text_en: string
  type_scores: Record<string, number>
}

export interface Question {
  id: string
  question_ar: string
  question_en: string
  description_ar?: string
  description_en?: string
  answers: Answer[]
  order: number
}

interface QuestionCardProps {
  question: Question
  selectedAnswerId?: string
  onAnswerSelect: (answerId: string) => void
  isLoading?: boolean
}

export function QuestionCard({
  question,
  selectedAnswerId,
  onAnswerSelect,
  isLoading = false,
}: QuestionCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* Question */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
          {question.question_ar}
        </h2>
        {question.description_ar && (
          <p className="text-muted-foreground">
            {question.description_ar}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {question.answers.map((answer, index) => (
          <motion.button
            key={answer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onAnswerSelect(answer.id)}
            disabled={isLoading}
            className={`w-full p-5 text-right rounded-2xl border-2 transition-all duration-200 ${
              selectedAnswerId === answer.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 bg-card hover:bg-accent'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className={`font-bold text-lg transition-colors ${selectedAnswerId === answer.id ? 'text-primary' : 'text-foreground'}`}>
              {answer.text_ar}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
