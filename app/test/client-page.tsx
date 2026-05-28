'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/layout/container'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store/auth-store'
import Link from 'next/link'
import { useTestStore } from '@/lib/store/test-store'

type Question = {
  id: number
  questionText: string
  sortOrder: number
  options: {
    id: number
    optionText: string
    sortOrder: number
    scores: { pattern: string; score: number }[]
  }[]
}

export function TestPageContent({ testIdProp }: { testIdProp?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = testIdProp || searchParams.get('testId') || '1'
  const questionRef = useRef<HTMLDivElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [testName, setTestName] = useState<string>('')
  const [userData, setUserData] = useState<{
    id?: number | string
    name?: string | null
    email?: string | null
    phone?: string | null
  } | null>(null)

  const { user } = useAuthStore()
  const { currentStep, answers, setCurrentStep, addAnswer, setResult, resetTest } = useTestStore()

  useEffect(() => {
    resetTest()
  }, [resetTest, testId])

  const submitResults = useCallback(
    async (finalUserData: typeof userData) => {
      if (isSubmitting) return

      try {
        setIsSubmitting(true)
        const currentAnswers = useTestStore.getState().answers
        const currentQuestionIds = questions.map((q) => q.id)
        const filteredAnswers = currentAnswers.filter((a) =>
          currentQuestionIds.includes(a.questionId)
        )

        const response = await fetch('/api/test/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: filteredAnswers,
            userId: finalUserData?.id || user?.id || 0,
            testId,
            guestData: {
              name: finalUserData?.name || user?.name || 'زائر',
              emailOrPhone:
                finalUserData?.email ||
                finalUserData?.phone ||
                user?.email ||
                user?.phone ||
                '',
            },
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
            testId,
            userData: finalUserData,
            answers: filteredAnswers,
          }),
        }).catch(console.error)

        toast.success('تم إكمال الاختبار بنجاح!')
        setTimeout(() => router.push(`/results?attemptId=${resultData.attemptId}`), 1200)
      } catch {
        toast.error('حدث خطأ أثناء حفظ النتائج')
        setIsSubmitting(false)
      }
    },
    [isSubmitting, questions, testId, user, setResult, router]
  )

  useEffect(() => {
    if (user) setUserData(user)
  }, [user])

  const { data: questionsData } = useSWR<Question[]>(
    testId ? `/api/questions?testId=${testId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  const { data: testInfoData } = useSWR<{ name: string }>(
    testId ? `/api/test/info?testId=${testId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    if (questionsData) {
      setQuestions(questionsData)
      setIsLoading(false)
    }
  }, [questionsData])

  useEffect(() => {
    if (testInfoData?.name) setTestName(testInfoData.name)
  }, [testInfoData])

  useEffect(() => {
    questionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [currentStep])

  if (!user) {
    return (
      <main
        className="min-h-screen flex flex-col bg-background items-center justify-center p-6 text-center"
        dir="rtl"
      >
        <div className="max-w-md space-y-8">
          <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-lg">
            <img src="/Logo.png" alt="7Types" className="w-10 h-10 object-contain" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">سجّل دخولك لبدء الاختبار</h2>
            <p className="text-muted-foreground font-bold leading-relaxed">
              أنشئ حساباً أو سجّل دخولك لحفظ نتائجك والوصول لتقريرك.
            </p>
          </div>
          <Link
            href={`/auth/login?callbackUrl=${encodeURIComponent(`/test?testId=${testId}`)}`}
            className="btn-gold w-full inline-flex justify-center"
          >
            تسجيل الدخول
          </Link>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-muted-foreground font-bold">جاري تحميل الأسئلة...</p>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[var(--brand-dark)] to-[#5a3d15] text-white"
        dir="rtl"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="w-24 h-24 rounded-full bg-[var(--brand-green)] flex items-center justify-center shadow-xl mb-8"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-black text-center px-6">
          جاري صياغة تقرير شخصيتك...
        </h2>
        <p className="text-[#eadbc5] font-bold mt-3">لحظات قليلة</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background" dir="rtl">
        <p className="text-muted-foreground font-bold">لا توجد أسئلة متاحة لهذا الاختبار.</p>
      </main>
    )
  }

  const currentQuestion = questions[currentStep]
  if (!currentQuestion) return null

  const selectedAnswer = answers.find((a) => a.questionId === currentQuestion.id)
  const isLast = currentStep === questions.length - 1

  const goNext = () => {
    if (!selectedAnswer) {
      toast.error('اختر إجابة للمتابعة')
      return
    }
    if (isLast) submitResults(userData)
    else setCurrentStep(currentStep + 1)
  }

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleAnswerSelect = (answerId: number) => {
    addAnswer(currentQuestion.id, answerId)
  }

  const inModal = Boolean(testIdProp)

  return (
    <main
      className={cn(
        'flex flex-col bg-background',
        inModal ? 'h-full min-h-0 overflow-hidden' : 'min-h-screen'
      )}
      dir="rtl"
    >
      {/* شريط التقدّم الثابت */}
      <div
        className={cn(
          'shrink-0 border-b border-border bg-[rgba(255,250,243,0.95)] backdrop-blur-md z-20',
          inModal ? 'px-4 py-4' : 'sticky top-16 px-4 py-5'
        )}
      >
        <Container size="md">
          <div className="max-w-2xl mx-auto space-y-4">
            {testName && (
              <h1 className="text-lg md:text-xl font-black text-foreground text-center line-clamp-2">
                {testName}
              </h1>
            )}
            <ProgressBar value={currentStep + 1} max={questions.length} />
            {/* مؤشر الأسئلة */}
            <div className="flex flex-wrap justify-center gap-1.5 max-h-16 overflow-y-auto py-1">
              {questions.map((q, i) => {
                const answered = answers.some((a) => a.questionId === q.id)
                const isCurrent = i === currentStep
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      if (i <= currentStep || answered) setCurrentStep(i)
                    }}
                    className={cn(
                      'w-8 h-8 rounded-lg text-xs font-black transition-all shrink-0',
                      isCurrent && 'ring-2 ring-primary ring-offset-2',
                      answered
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground',
                      i > currentStep && !answered && 'opacity-40 cursor-not-allowed'
                    )}
                    aria-label={`السؤال ${i + 1}`}
                    disabled={i > currentStep && !answered}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </Container>
      </div>

      <div
        className={cn(
          'flex-1 overflow-y-auto',
          inModal ? 'px-4 py-6' : 'px-4 py-8 md:py-12'
        )}
      >
        <Container size="md">
          <div ref={questionRef} className="max-w-2xl mx-auto space-y-8">
            <p className="text-center text-sm font-bold text-muted-foreground">
              اختر العبارة الأقرب لطريقتك في التعامل
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[var(--brand-shadow)]">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-foreground leading-relaxed text-center">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                <ul className="space-y-3 md:space-y-4" role="listbox" aria-label="خيارات الإجابة">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer?.answerId === option.id
                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleAnswerSelect(option.id)}
                          className={cn(
                            'w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 text-right transition-all',
                            'min-h-[56px] md:min-h-[64px]',
                            isSelected
                              ? 'border-primary bg-[#fff4df] shadow-md shadow-primary/10'
                              : 'border-border bg-card hover:border-primary/50 hover:bg-[#fffaf3]'
                          )}
                        >
                          <span
                            className={cn(
                              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm',
                              isSelected
                                ? 'bg-primary text-[#1b1207]'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {index + 1}
                          </span>
                          <span
                            className={cn(
                              'flex-1 text-base md:text-lg font-bold leading-snug',
                              isSelected ? 'text-foreground' : 'text-foreground/90'
                            )}
                          >
                            {option.optionText}
                          </span>
                          <span
                            className={cn(
                              'w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                              isSelected ? 'border-primary bg-primary' : 'border-border'
                            )}
                          >
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#1b1207]" />
                            )}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="h-14 flex-1 rounded-2xl font-black border-border text-base"
              >
                <ChevronRight className="w-5 h-5 ml-2" />
                السابق
              </Button>
              <Button
                type="button"
                onClick={goNext}
                className="h-14 flex-1 rounded-2xl font-black text-base btn-gold border-none shadow-lg"
              >
                {isLast ? 'إنهاء الاختبار' : 'التالي'}
                <ChevronLeft className="w-5 h-5 mr-2" />
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </main>
  )
}

export default function ClientTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <TestPageContent />
    </Suspense>
  )
}
