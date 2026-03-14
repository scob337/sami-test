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
      toast.info('يرجى التسجيل لحفظ نتائجك')
      return
    }

    await submitResults(userData)
  }

  if (isCompleted && !isRegistered) {
    return (
      <main className="min-h-screen flex flex-col pt-32">
        <Header />

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full space-y-8">

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                انتهيت من الاختبار
              </h2>

              <p className="text-muted-foreground">
                سجل بياناتك لعرض النتائج
              </p>
            </div>

            <PreTestForm onComplete={handleRegistrationComplete} />

          </div>
        </div>

        <Footer />
      </main>
    )
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

            <AnimatePresence mode="wait">
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                selectedAnswerId={selectedAnswer?.answerId}
                onAnswerSelect={handleAnswerSelect}
              />
            </AnimatePresence>

            <div className="flex justify-between items-center gap-6">

              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="h-14 px-8 rounded-2xl border-2 border-border bg-card/40 backdrop-blur-md text-foreground font-bold hover:bg-secondary hover:border-primary/50 hover:text-primary transition-all active:scale-95 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5 ml-2" />
                السابق
              </Button>

              <Button 
                onClick={handleNext}
                className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
              >
                {currentStep === questions.length - 1
                  ? 'إنهاء الاختبار'
                  : 'التالي'}

                <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              </Button>

            </div>

            <div className="flex justify-center gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i === currentStep
                      ? "bg-primary w-6"
                      : "bg-border"
                  )}
                />
              ))}
            </div>

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