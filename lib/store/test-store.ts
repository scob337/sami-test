import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface TestAnswer {
  questionId: number // Changed to number to match Prisma schema
  answerId: number   // Changed to number to match Prisma schema
}

interface TestStore {
  currentStep: number
  answers: TestAnswer[]
  result: {
    attemptId: number
    primaryPattern: string
    secondaryPattern: string
    scores: Record<string, number>
    summary_ar: string
    summary_en: string
    reportText?: string // Added report text
    hasPaid?: boolean // Added payment status
  } | null
  setCurrentStep: (step: number) => void
  addAnswer: (questionId: number, answerId: number) => void
  removeAnswer: (questionId: number) => void
  setResult: (result: TestStore['result']) => void
  resetTest: () => void
  getProgress: (totalQuestions: number) => number
}

export const useTestStore = create<TestStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      answers: [],
      result: null,
      setCurrentStep: (step) => set({ currentStep: step }),
      addAnswer: (questionId, answerId) => {
        const { answers } = get()
        const existingIndex = answers.findIndex((a) => a.questionId === questionId)
        
        if (existingIndex >= 0) {
          const newAnswers = [...answers]
          newAnswers[existingIndex] = { questionId, answerId }
          set({ answers: newAnswers })
        } else {
          set({ answers: [...answers, { questionId, answerId }] })
        }
      },
      removeAnswer: (questionId) => {
        const { answers } = get()
        set({ answers: answers.filter((a) => a.questionId !== questionId) })
      },
      setResult: (result) => set({ result }),
      resetTest: () => set({ currentStep: 0, answers: [], result: null }),
      getProgress: (totalQuestions: number) => {
        const { answers } = get()
        if (totalQuestions === 0) return 0
        return Math.min(Math.round((answers.length / totalQuestions) * 100), 100)
      },
    }),
    {
      name: 'mindmatch-test-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
