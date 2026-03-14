'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { QuestionCard } from '@/components/test/question-card'
import { useTestStore } from '@/lib/store/test-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PreTestForm } from '@/components/test/pre-test-form'
import { useAuthStore } from '@/lib/store/auth-store'
import Link from 'next/link'

type Question = {
  id: number
  questionText: string
  sortOrder: number
  options: {
    id: number
    optionText: string
    sortOrder: number
    scores: {
      pattern: string
      score: number
    }[]
  }[]
}

function TestPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = searchParams.get('testId') || '1'

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isRegistered, setIsRegistered] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const { user } = useAuthStore()

  const {
    currentStep,
    answers,
    setCurrentStep,
    addAnswer,
    setResult,
    setIsFinished,
  } = useTestStore()

  const submitResults = async (finalUserData: any) => {
    try {
      setIsSubmitting(true)

      // Filter answers to only include those belonging to the current questions
      const currentQuestionIds = questions.map(q => q.id)
      const filteredAnswers = answers.filter(a => currentQuestionIds.includes(a.questionId))

      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: filteredAnswers,
          userId: finalUserData?.id || 1,
          testId: parseInt(testId)
        }),
      })

      if (!response.ok) throw new Error('Submission failed')

      const resultData = await response.json()
      setResult(resultData)

      fetch('/api/test/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: resultData.attemptId,
          testId: parseInt(testId),
          userData: finalUserData,
          answers
        })
      })

      toast.success('تم إكمال الاختبار بنجاح!')
      setTimeout(() => router.push('/results'), 1500)

    } catch (error) {
      toast.error('حدث خطأ أثناء معالجة النتائج')
      console.error(error)
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (user) {
      setIsRegistered(true)
      setUserData(user)
    }

    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/questions?testId=${testId}`)
        if (!res.ok) throw new Error()

        const data = await res.json()
        setQuestions(data)

      } catch (error) {
        toast.error('حدث خطأ أثناء تحميل الأسئلة')
        console.error(error)
      } finally {
        setTimeout(() => setIsLoading(false), 800)
      }
    }

    fetchQuestions()
  }, [user, testId])

  const handleRegistrationComplete = (data: any) => {
    setUserData(data)
    setIsRegistered(true)

    if (isCompleted) {
      submitResults(data)
    }
  }

  if (isLoading || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!questions.length) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <Section className="flex-1 flex items-center justify-center">
          <Container size="sm" className="text-center space-y-6">
            <Brain className="w-16 h-16 mx-auto text-destructive" />
            <h2 className="text-3xl font-bold">لا يوجد أسئلة لهذا الاختبار</h2>

            <Link href="/test-library">
              <Button size="lg">
                العودة للمكتبة
              </Button>
            </Link>
          </Container>
        </Section>
        <Footer />
      </main>
    )
  }

  const currentQuestion = questions[currentStep]

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const selectedAnswer = answers.find(
    (a) => a.questionId === currentQuestion.id
  )

  const handleAnswerSelect = (answerId: number) => {
    addAnswer(currentQuestion.id, answerId)

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 400)
    }
  }

  const handleNext = () => {
    if (!selectedAnswer) {
      toast.error('يرجى اختيار إجابة')
      return
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleCompleteTest()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCompleteTest = async () => {
    setIsCompleted(true)

    if (!isRegistered) {
      toast.info('يرجى تسجيل الدخول أو إنشاء حساب لحفظ وعرض نتائجك')
      setIsFinished(true)
      router.push('/auth/login')
      return
    }

    await submitResults(userData)
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 pt-32 pb-16">
        <Container size="lg">

          <div className="max-w-4xl mx-auto space-y-10">

            <ProgressBar
              value={currentStep + 1}
              max={questions.length}
            />

            <div className="flex items-center justify-between w-full max-w-4xl mx-auto mt-12 mb-4 text-slate-400 font-medium text-sm md:text-base">
              <button 
                onClick={handlePrevious} 
                disabled={currentStep === 0}
                className="hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </button>
              <span className="text-center hidden md:inline-block">اختر الدائرة الأقرب للعبارة التي تشبهك أكثر.</span>
              <button 
                onClick={handleNext} 
                className={cn("hover:text-slate-700 transition-colors flex items-center gap-1", !selectedAnswer && "opacity-50 hover:text-slate-400")}
              >
                {currentStep === questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'}
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center md:hidden mb-8 text-slate-400 font-medium text-sm">
               اختر الدائرة الأقرب للعبارة التي تشبهك أكثر.
            </div>

            <AnimatePresence mode="wait">
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                selectedAnswerId={selectedAnswer?.answerId}
                onAnswerSelect={handleAnswerSelect}
              />
            </AnimatePresence>

          </div>

        </Container>
      </div>

      <Footer />
    </main>
  )
}

export default function TestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <TestPageContent />
    </Suspense>
  )
}