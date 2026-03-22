'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { motion, AnimatePresence } from 'framer-motion'
import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { ProgressBar } from '@/components/ui/progress-bar'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react'
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
  const [testName, setTestName] = useState<string>('')
  const [userData, setUserData] = useState<any>(null)

  const { user } = useAuthStore()

  const {
    currentStep,
    answers,
    setCurrentStep,
    addAnswer,
    setResult,
    resetTest,
  } = useTestStore()

  useEffect(() => {
    resetTest()
  }, [resetTest])

  const submitResults = useCallback(async (finalUserData: any) => {
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      const currentAnswers = useTestStore.getState().answers
      const currentQuestionIds = questions.map(q => q.id)
      const filteredAnswers = currentAnswers.filter(a => currentQuestionIds.includes(a.questionId))

      const requestBody = {
        answers: filteredAnswers,
        userId: finalUserData?.id || 0,
        testId: testId,
        guestData: {
          name: finalUserData?.name || 'زائر',
          emailOrPhone: finalUserData?.emailOrPhone || ''
        }
      }

      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) throw new Error('Submission failed')

      const resultData = await response.json()
      setResult(resultData)

      fetch('/api/test/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: resultData.attemptId,
          testId: testId,
          userData: finalUserData,
          answers
        })
      }).catch(e => console.error(e))

      toast.success('تم إكمال الاختبار بنجاح!')
      setTimeout(() => router.push(`/results?attemptId=${resultData.attemptId}`), 1500)

    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ النتائج')
      setIsSubmitting(false)
    }
  }, [isSubmitting, questions, testId, answers, setResult, router])

  useEffect(() => {
    if (user) setUserData(user)
  }, [user])

  const { data: questionsData } = useSWR<Question[]>(
    testId ? `/api/questions?testId=${testId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  const { data: testInfoData } = useSWR<any>(
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
    if (testInfoData) setTestName(testInfoData.name)
  }, [testInfoData])

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col bg-[#0A1A3B] items-center justify-center p-6 text-center" dir="rtl">
        <div className="max-w-md space-y-8 relative z-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white">عذراً، يجب تسجيل الدخول أولاً</h2>
            <p className="text-slate-400 font-medium leading-relaxed">يرجى تسجيل الدخول أو إنشاء حساب جديد لتتمكن من إجراء الاختبار وحفظ نتائجك.</p>
          </div>
          <div className="flex flex-col gap-4">
            <Link href={`/auth/login?callbackUrl=${encodeURIComponent(`/test${testId ? `?testId=${testId}` : ''}`)}`} className="w-full">
              <Button className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                سجل دخولك الآن
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><LoadingSpinner size="lg" /></div>

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0A1A3B]" dir="rtl">
        <div className="relative z-10 flex flex-col items-center space-y-8 p-4">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="w-24 h-24 mb-6 rounded-full bg-[#10B981] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <Brain className="w-12 h-12 text-white" />
          </motion.div>
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black text-white">جاري صياغة تقرير شخصيتك...</h2>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentStep]
  if (!currentQuestion) return null

  const selectedAnswer = answers.find(a => a.questionId === currentQuestion.id)

  const handleAnswerSelect = (answerId: number) => {
    addAnswer(currentQuestion.id, answerId)
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 400)
    } else {
      setTimeout(() => submitResults(userData), 400)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50" dir="rtl">
      <div className="flex-1 pt-24 md:pt-32 pb-16 px-4">
        <Container size="md">
          <div className="max-w-3xl mx-auto space-y-12">
            {testName && <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-2">{testName}</h1>}
            <ProgressBar value={currentStep + 1} max={questions.length} />
            <div className="flex items-center justify-between w-full max-w-4xl mx-auto mt-12 mb-4 text-slate-400 font-medium">
              <button onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)} disabled={currentStep === 0} className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4" /> السابق
              </button>
              <span>اختر الدائرة الأقرب للعبارة التي تشبهك أكثر.</span>
              <button onClick={() => !selectedAnswer ? toast.error('يرجى اختيار إجابة') : (currentStep < questions.length - 1 ? setCurrentStep(currentStep + 1) : submitResults(userData))} className="flex items-center gap-1">
                {currentStep === questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'} <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="relative mt-16">
                <div className="text-center mb-10"><h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-relaxed">{currentQuestion.questionText}</h2></div>
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer?.answerId === option.id
                    return (
                      <motion.div key={option.id} onClick={() => handleAnswerSelect(option.id)} className={cn("group flex items-center justify-between p-5 md:p-6 rounded-2xl border transition-all cursor-pointer bg-white", isSelected ? 'border-[#1A56DB] bg-[#F0F5FF]' : 'border-slate-200 hover:border-[#1A56DB]/40')}>
                        <span className={cn("text-lg flex-1 text-right font-medium", isSelected ? 'text-[#1A56DB]' : 'text-slate-700')}>{option.optionText}</span>
                        <div className="flex-shrink-0 mr-4 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center"><span className="text-slate-600 font-bold text-sm">{index + 1}</span></div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Container>
      </div>
    </main>
  )
}

export default function ClientTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <TestPageContent />
    </Suspense>
  )
}