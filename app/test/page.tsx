'use client'

import { useState, useEffect } from 'react'
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
import { ChevronLeft, ChevronRight, Brain, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { PreTestForm } from '@/components/test/pre-test-form'
import { useAuthStore } from '@/lib/store/auth-store'
import { useSearchParams } from 'next/navigation'

import { Suspense } from 'react'
import Link from 'next/link'

function TestPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = searchParams.get('testId') || '1'
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
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
    getProgress,
    resetTest,
  } = useTestStore()
  console.log('TestPage Render:', { testId, isLoading, questionsCount: questions.length, isRegistered })

  const submitResults = async (finalUserData: any) => {
    try {
      setIsSubmitting(true)

      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers, 
          userId: finalUserData?.id || 1,
          testId: parseInt(testId) 
        }),
      })

      if (!response.ok) throw new Error('Submission failed')
      
      const resultData = await response.json()
      setResult(resultData)
      
      // Background report generation
      fetch('/api/test/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: resultData.attemptId,
          testId: parseInt(testId),
          userData: finalUserData,
          answers: answers
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
    // Check if user is already logged in (from auth store)
    if (user) {
      setIsRegistered(true)
      setUserData(user)
    }

    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/questions?testId=${testId}`)
        if (!res.ok) throw new Error('Failed to fetch questions')
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
    // After registration, proceed to complete submission if test was done
    if (isCompleted) {
      submitResults(data)
    }
  }

  // Pre-test registration is no longer forced for starting

  if (isLoading || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Premium background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1),transparent)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full animate-pulse" />
        
        <div className="text-center space-y-8 relative z-10">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {isSubmitting ? 'جاري تحليل إجاباتك...' : 'جاري تحضير الاختبار...'}
            </h2>
            <p className="text-muted-foreground animate-pulse font-medium text-lg">
              {isSubmitting ? 'نحن نبني ملفك الشخصي بدقة عالية' : 'يرجى الانتظار قليلاً، نجهز لك تجربة فريدة'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Safety check for questions loading
  if (!isLoading && questions.length === 0) {
    return (
      <main className="min-h-screen flex flex-col relative bg-background text-foreground">
        <Header />
        <Section className="flex-1 flex items-center justify-center relative z-10">
          <Container size="sm" className="text-center space-y-8">
            <div className="w-24 h-24 rounded-[2rem] bg-destructive/10 flex items-center justify-center mx-auto text-destructive border border-destructive/20">
              <Brain className="w-12 h-12" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic">عذراً، لم نجد أسئلة</h2>
              <p className="text-xl text-muted-foreground font-medium">
                يبدو أن هذا الاختبار لا يحتوي على أسئلة حالياً. يرجى تجربة اختبار آخر من المكتبة.
              </p>
            </div>
            <div className="pt-8">
              <Link href="/test-library">
                <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-2xl shadow-primary/20">
                  العودة للمكتبة
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
        <Footer />
      </main>
    )
  }

  // Still loading or safety check for current question
  if (isLoading || questions.length === 0 || !questions[currentStep]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const currentQuestion = questions[currentStep]
  const selectedAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id
  )

  const handleAnswerSelect = (answerId: number) => {
    addAnswer(currentQuestion.id, answerId)
    // Auto-advance after short delay if not the last question
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
      // Show registration form
      toast.info('يرجى التسجيل لحفظ نتائجك ورؤية التقرير')
      return
    }
    
    // User is already registered, submit directly
    await submitResults(userData)
  }

  if (isCompleted && !isRegistered) {
    return (
      <main className="min-h-screen flex flex-col relative pt-32 pb-12 bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 relative z-10">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-foreground">رائع! انتهيت من الاختبار</h2>
              <p className="text-muted-foreground font-medium">سجل بياناتك الآن لربط نتائجك وتحميل تقريرك المفصل</p>
            </div>
            <PreTestForm onComplete={handleRegistrationComplete} />
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col relative bg-background text-foreground overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <Header />
      
      <Section className="flex-1 flex items-center py-24 relative z-10">
        <Container size="md">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Premium Progress Bar */}
            <div className="space-y-6">
              <div className="flex justify-between items-end px-2">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] tracking-widest uppercase mb-2">
                    المرحلة {Math.floor(currentStep / 5) + 1}
                  </div>
                  <p className="text-3xl font-black text-foreground leading-none">
                    {currentStep + 1} <span className="text-muted-foreground/40 text-2xl font-medium">/ {questions.length}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black primary-gradient bg-clip-text text-transparent">
                    {getProgress(questions.length)}%
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">مكتمل</span>
                </div>
              </div>
              
              <div className="h-4 w-full bg-secondary rounded-full overflow-hidden p-1 border border-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress(questions.length)}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 20 }}
                  className="h-full primary-gradient rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shimmer" />
                </motion.div>
              </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.98, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: -30 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="bg-card relative overflow-hidden p-6 sm:p-10 md:p-14 rounded-2xl md:rounded-[3rem] border border-border shadow-xl">
                  {/* Subtle mesh background */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.05),transparent)] pointer-events-none" />
                  
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-black mb-8 sm:mb-14 text-foreground leading-tight tracking-tight relative z-10">
                    {currentQuestion.questionText}
                  </h2>
                  
                  <div className="grid gap-5 relative z-10">
                    {currentQuestion.options.map((option: any, index: number) => (
                      <motion.button
                        key={option.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 + 0.2 }}
                        onClick={() => handleAnswerSelect(option.id)}
                        className={`
                          group relative p-5 sm:p-8 text-right rounded-2xl border-2 transition-all duration-300 cursor-pointer
                          ${selectedAnswer?.answerId === option.id 
                            ? 'bg-primary/15 border-primary shadow-lg shadow-primary/10' 
                            : 'bg-secondary border-border hover:border-primary/50 hover:bg-muted'}
                        `}
                      >
                        <div className="flex items-center justify-between gap-4 sm:gap-8">
                          <div className={`
                            w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0
                            ${selectedAnswer?.answerId === option.id 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground/30 group-hover:border-primary/60'}
                          `}>
                            {selectedAnswer?.answerId === option.id && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-3 h-3 bg-primary-foreground rounded-full" 
                              />
                            )}
                          </div>
                          <span className={`text-base sm:text-xl md:text-2xl transition-all duration-300 flex-1 ${selectedAnswer?.answerId === option.id ? 'text-foreground font-bold' : 'text-muted-foreground group-hover:text-foreground font-medium'}`}>
                            {option.optionText}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Premium Navigation */}
            <div className="flex items-center justify-between pt-10">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isSubmitting}
                className="group h-12 sm:h-16 px-6 sm:px-10 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 transition-all font-bold text-base sm:text-lg cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                السابق
              </Button>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswer || isSubmitting}
                className={`
                  h-12 sm:h-16 px-8 sm:px-12 rounded-2xl font-bold text-base sm:text-xl transition-all duration-300 group relative overflow-hidden cursor-pointer
                  ${isSubmitting ? 'bg-muted pointer-events-none' : 'bg-primary hover:bg-primary/80 text-primary-foreground shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95'}
                `}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <div className="flex items-center gap-3">
                    <span>{currentStep === questions.length - 1 ? 'إرسال الإجابات' : 'التالي'}</span>
                    {currentStep !== questions.length - 1 && (
                      <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    )}
                  </div>
                )}
                {/* Subtle shine effect on button */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>
            </div>
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <TestPageContent />
    </Suspense>
  )
}
