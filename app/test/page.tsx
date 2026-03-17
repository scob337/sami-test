'use client'

import { useState, useEffect, Suspense } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/header'
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
import { PreTestForm } from '@/components/test/pre-test-form'
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

      const requestBody = {
        answers: filteredAnswers,
        userId: finalUserData?.id || 0, // 0 will trigger guest creation in API
        testId: parseInt(testId),
        guestData: {
          name: finalUserData?.name || 'زائر',
          emailOrPhone: finalUserData?.emailOrPhone || ''
        }
      }

      console.log('Submitting test payload:', requestBody)

      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Submission error response:', errorText)
        throw new Error('Submission failed')
      }

      const resultData = await response.json()
      setResult(resultData)

      // Trigger report generation in background usually, but here we just call it
      fetch('/api/test/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: resultData.attemptId,
          testId: parseInt(testId),
          userData: finalUserData,
          answers
        })
      }).catch(e => console.error('Background report failure (ignored):', e))

      toast.success('تم إكمال الاختبار بنجاح!')
      setTimeout(() => router.push('/results'), 1500)

    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ النتائج، يرجى المحاولة مرة أخرى')
      console.error('Submit Results Exception:', error)
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (user) {
      setIsRegistered(true)
      setUserData(user)
    }
  }, [user])

  const { data: questionsData } = useSWR<Question[]>(
    testId ? `/api/questions?testId=${testId}` : null,
    fetcher
  )
  const { data: testInfoData } = useSWR<any>(
    testId ? `/api/test/info?testId=${testId}` : null,
    fetcher
  )

  useEffect(() => {
    if (questionsData) {
      setQuestions(questionsData)
      setIsLoading(false)
    }
  }, [questionsData])

  useEffect(() => {
    if (testInfoData) {
      setTestName(testInfoData.name)
    }
  }, [testInfoData])

  const handleRegistrationComplete = (data: any) => {
    setUserData(data)
    setIsRegistered(true)
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col bg-[#0A1A3B] items-center justify-center p-6 text-center" dir="rtl">
        <Header />
        <div className="max-w-md space-y-8 relative z-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white">عذراً، يجب تسجيل الدخول أولاً</h2>
            <p className="text-slate-400 font-medium leading-relaxed">يرجى تسجيل الدخول أو إنشاء حساب جديد لتتمكن من إجراء الاختبار وحفظ نتائجك بشكل احترافي.</p>
          </div>
          <div className="flex flex-col gap-4">
            <Link href={`/auth/login?callbackUrl=${encodeURIComponent(`/test${testId ? `?testId=${testId}` : ''}`)}`} className="w-full">
              <Button className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                سجل دخولك الآن
              </Button>
            </Link>
            <Link href={`/auth/register?callbackUrl=${encodeURIComponent(`/test${testId ? `?testId=${testId}` : ''}`)}`} className="w-full">
              <Button variant="ghost" className="w-full h-14 text-blue-400 hover:text-blue-300 hover:bg-white/5 font-black text-lg">
                ليس لدي حساب، أريد التسجيل
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0A1A3B]" dir="rtl">
        {/* Deep Blue Background Gradient Match */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,75,155,0.2)_0%,transparent_60%)]" />
        
        <div className="relative z-10 flex flex-col items-center space-y-8 p-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 mb-6 rounded-full bg-[#10B981] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            <Brain className="w-12 h-12 text-white" />
          </motion.div>

          <div className="space-y-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              جاري صياغة تقرير شخصيتك...
            </h2>
            <p className="text-blue-200/80 font-medium text-sm md:text-base">
              يتم تحليل إجاباتك وإعداد تقريرك الشخصي
            </p>
          </div>

          <div className="flex gap-2 pt-8">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-4 h-4 bg-white/50 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="w-4 h-4 bg-white/50 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              className="w-4 h-4 bg-white/50 rounded-full"
            />
          </div>
        </div>
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

  const handleCompleteTest = async (answerId?: number) => {
    setIsCompleted(true)
    
    // If answerId provided (from auto-submit), we may need to make sure state reflects it
    // But store `addAnswer` is synchronous so submitResults should just read it or we
    // could wait a tick. `answers` state might be slightly delayed in React render cycle,
    // so we pass the latest data if needed. Actually submitResults(userData) uses `answers` from store
    // which is immediately updated in zustand.
    await submitResults(userData)
  }

  const handleAnswerSelect = (answerId: number) => {
    addAnswer(currentQuestion.id, answerId)

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 400)
    } else {
      setTimeout(() => handleCompleteTest(answerId), 400)
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

  return (
    <main className="min-h-screen flex flex-col bg-slate-50" dir="rtl">
      <Header />

      <div className="flex-1 pt-24 md:pt-32 pb-16 px-4">
        <Container size="md">

          <div className="max-w-3xl mx-auto space-y-12">
            {testName && (
              <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">
                {testName}
              </h1>
            )}

            <ProgressBar
              value={currentStep + 1}
              max={questions.length}
            />

            <div className="flex items-center justify-between w-full max-w-4xl mx-auto mt-12 mb-4 text-slate-400 font-medium text-sm md:text-base">
              <button 
                onClick={handlePrevious} 
                disabled={currentStep === 0}
                className="hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:text-slate-400 dark:disabled:hover:text-slate-600 transition-colors flex items-center gap-1"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </button>
              <span className="text-center hidden md:inline-block">اختر الدائرة الأقرب للعبارة التي تشبهك أكثر.</span>
              <button 
                onClick={handleNext} 
                className={cn("hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1", !selectedAnswer && "opacity-50 hover:text-slate-400 dark:hover:text-slate-600")}
              >
                {currentStep === questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'}
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center md:hidden mb-8 text-slate-400 font-medium text-sm">
               اختر الدائرة الأقرب للعبارة التي تشبهك أكثر.
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative mt-16"
              >
                <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-relaxed tracking-tight">
                    {currentQuestion.questionText}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer?.answerId === option.id;
                    return (
                      <motion.div
                        key={option.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                        onClick={() => handleAnswerSelect(option.id)}
                        className={`
                          group flex items-center justify-between p-5 md:p-6 rounded-2xl border transition-all duration-300 cursor-pointer bg-white
                          ${isSelected 
                            ? 'border-[#1A56DB] bg-[#F0F5FF] shadow-sm' 
                            : 'border-slate-200 hover:border-[#1A56DB]/40 hover:bg-slate-50'}
                        `}
                      >
                        <span className={`text-lg md:text-xl flex-1 text-right transition-colors font-medium ${isSelected ? 'text-[#1A56DB]' : 'text-slate-700 group-hover:text-slate-900'}`}>
                          {option.optionText}
                        </span>
                        
                        <div className="flex-shrink-0 mr-4 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-600 font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
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