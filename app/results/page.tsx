'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTestStore } from '@/lib/store/test-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { 
  Crown, Star, Heart, Briefcase, Lightbulb, 
  AlertTriangle, CheckCircle2, Lock, Download, BookOpen, Share2, Copy, Check, X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useEffect, useState, Suspense, useCallback } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const TRAIT_COLORS: Record<string, string> = {
  'WISE': 'bg-purple-500',
  'OPEN': 'bg-pink-500',
  'PRECISE': 'bg-blue-600',
  'THINKER': 'bg-cyan-500',
  'ASSERTIVE': 'bg-red-500',
  'CALM': 'bg-emerald-500',
  'SPONTANEOUS': 'bg-amber-500',
}

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

import { PERSONALITY_DETAILED_DATA } from '@/lib/constants/personality-data'

export default function ResultsPage() {
  const router = useRouter()
  const { result, setResult } = useTestStore()
  const { user, loading: authLoading } = useAuthStore()
  
  // Get attemptId from URL as fallback
  const [urlAttemptId, setUrlAttemptId] = useState<string | null>(null)
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setUrlAttemptId(params.get('attemptId'))
  }, [])

  // Fetch results if not in store or to get latest payment status
  const { data: dbResult, isLoading: isLoadingResult } = useSWR<any>(
    urlAttemptId ? `/api/test/result?attemptId=${urlAttemptId}` : null,
    fetcher
  )

  useEffect(() => {
    if (dbResult && !result) {
      setResult({
        attemptId: dbResult.attemptId,
        primaryPattern: dbResult.primaryPattern,
        secondaryPattern: dbResult.secondaryPattern,
        scores: dbResult.scoresJson,
        summary_ar: '', // API could be expanded to return this if needed
        summary_en: ''
      })
    }
  }, [dbResult, result, setResult])

  const { data: reportData, error: reportError, mutate: mutateReport } = useSWR<any>(
    (result?.attemptId || urlAttemptId) ? `/api/test/report?attemptId=${result?.attemptId || urlAttemptId}` : null,
    fetcher,
    { 
      revalidateOnFocus: false,
      refreshInterval: (data) => (data?.status === 'pending' ? 3000 : 0)
    }
  )

  const isPending = reportData?.status === 'pending'
  const report = isPending ? null : reportData?.reportText
  const isPaid = reportData?.isPaid ?? (dbResult?.attempt?.payment?.status === 'COMPLETED')
  const hasResult = !!(result || dbResult)

  // Protection: Redirect to home if no result and not loading
  useEffect(() => {
    if (!authLoading && !isLoadingResult && !hasResult && !urlAttemptId) {
      router.push('/')
    }
  }, [hasResult, urlAttemptId, isLoadingResult, authLoading, router])

  const currentType = useMemo(() => {
    const code = (result?.primaryPattern || '').toUpperCase()
    return PERSONALITY_DETAILED_DATA[code] || PERSONALITY_DETAILED_DATA['WISE']
  }, [result?.primaryPattern])

  const secondaryType = useMemo(() => {
    if (!result?.scores) return PERSONALITY_DETAILED_DATA['OPEN']
    const sorted = Object.entries(result.scores).sort(([, a], [, b]) => (b as number) - (a as number))
    if (sorted.length > 1) {
      const code = sorted[1][0].toUpperCase()
      return PERSONALITY_DETAILED_DATA[code] || PERSONALITY_DETAILED_DATA['OPEN']
    }
    return PERSONALITY_DETAILED_DATA['OPEN']
  }, [result?.scores])

  const sortedScores = useMemo(() => {
    if (!result?.scores) return []
    return Object.entries(result.scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
  }, [result?.scores])

  const [showSharePopup, setShowSharePopup] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const resultsUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareResultText = `اكتشفت أن نمط شخصيتي هو "${currentType.name}" في تحليل Sami-Test! 🌟`
  const resultShareLinks = [
    { name: 'واتساب', color: 'bg-green-500 hover:bg-green-600', url: `https://wa.me/?text=${encodeURIComponent(shareResultText + '\n' + resultsUrl)}` },
    { name: 'تويتر', color: 'bg-sky-500 hover:bg-sky-600', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareResultText)}&url=${encodeURIComponent(resultsUrl)}` },
    { name: 'فيسبوك', color: 'bg-blue-600 hover:bg-blue-700', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resultsUrl)}` },
    { name: 'تيليجرام', color: 'bg-sky-600 hover:bg-sky-700', url: `https://t.me/share/url?url=${encodeURIComponent(resultsUrl)}&text=${encodeURIComponent(shareResultText)}` },
  ]

  if (authLoading || isLoadingResult || (!result && urlAttemptId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    )
  }

  if (!result) return null;

  const dateStr = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="min-h-screen flex flex-col bg-background" dir="rtl">
      
      {/* Deep Blue Header Area */}
      <div className="bg-muted/30 pt-32 pb-32 px-4 relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.1)_0%,transparent_60%)]" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary rounded-full blur-[150px] opacity-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent rounded-full blur-[150px] opacity-10" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-4">
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm"
          >
            {dateStr}
          </motion.p>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-foreground leading-tight"
          >
            تحليل شخصية {user?.name || user?.email?.split('@')[0] || 'المبدع'}
          </motion.h1>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4 mt-6"
          >
             <div className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-full shadow-sm">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-muted-foreground text-xs font-bold">التقرير جاهز الآن</span>
             </div>
             
             <div className="flex items-center gap-3">
               <button
                 onClick={() => router.push('/test')}
                 className="text-primary hover:text-primary-foreground text-sm font-bold bg-background hover:bg-primary px-6 py-2 rounded-xl transition-all border border-border"
               >
                 إعادة الاختبار
               </button>
               <button
                 onClick={() => setShowSharePopup(true)}
                 className="text-emerald-500 hover:text-emerald-600 text-sm font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-6 py-2 rounded-xl transition-all border border-emerald-500/20 flex items-center gap-2"
               >
                 <Share2 className="w-4 h-4" />
                 شارك نتيجتك
               </button>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Overlapping Header */}
      <div className="flex-1 px-4 -mt-20 relative z-20 pb-24">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Top Cards (Primary & Secondary) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="bg-card backdrop-blur-xl rounded-[32px] p-8 border border-border shadow-2xl flex flex-col items-center justify-center text-center space-y-4 group hover:bg-muted/50 transition-all cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Crown className="w-8 h-8 text-purple-500" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-purple-500 uppercase tracking-widest">النمط الأساسي</p>
                <h2 className="text-3xl font-black text-foreground">{currentType.name}</h2>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[250px]">
                  {currentType.description}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="bg-card backdrop-blur-xl rounded-[32px] p-8 border border-border shadow-2xl flex flex-col items-center justify-center text-center space-y-4 group hover:bg-muted/50 transition-all cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-pink-500" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-pink-500 uppercase tracking-widest">النمط الثانوي</p>
                <h2 className="text-3xl font-black text-foreground">
                  {result?.secondaryPattern ? secondaryType.name : 'لا توجد شخصية'}
                </h2>
                {result?.secondaryPattern && (
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[250px]">
                    {secondaryType.description}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Traits Distribution Chart */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-[40px] p-8 md:p-12 border border-border shadow-2xl"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-foreground">توزيع الأنماط</h3>
              <div className="text-primary bg-primary/10 px-4 py-2 rounded-xl text-xs font-black">تحليل حسابي دقيق</div>
            </div>
            
            <div className="space-y-6">
              {sortedScores.map(([typeCode, score]: [string, any], index: number) => {
                const traitData = PERSONALITY_DETAILED_DATA[typeCode.toUpperCase()] || { name: typeCode };
                const colorClass = (TRAIT_COLORS as any)[typeCode.toUpperCase()] || 'bg-slate-500';
                const widthPercent = Math.min(100, ((score as number) / 15) * 100);

                return (
                  <div key={typeCode} className="group">
                    <div className="flex justify-between items-center text-sm font-bold mb-2">
                       <span className="text-foreground bg-muted px-3 py-1 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{score as number} نقطة</span>
                       <span className="text-muted-foreground">{traitData.name}</span>
                    </div>
                    <div className="w-full bg-muted h-4 rounded-full overflow-hidden flex justify-end p-0.5 border border-border">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${widthPercent}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                        className={`h-full rounded-full ${colorClass} shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Simplified Report Content */}
          {/* Results Block */}
          <div className="space-y-8">
            {isPaid ? (
              /* --- PAID FULL REPORT --- */
              <motion.div 
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                className="bg-card rounded-[40px] p-8 md:p-12 border border-border shadow-2xl space-y-8 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-border pb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Star className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-foreground">التقرير التحليلي الشامل</h3>
                      <p className="text-muted-foreground font-medium text-sm md:text-base mt-1 italic">تقرير مفصل تم إعداده خصيصاً لك</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>

                <div className="relative min-h-[200px]">
                  {isPending ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <LoadingSpinner size="lg" className="text-primary" />
                      <p className="text-primary font-bold animate-pulse">جاري تحليل بياناتك وصياغة التقرير...</p>
                    </div>
                  ) : (
                    <>
                      {reportData?.reportData ? (
                        /* Structured JSON Report Rendering */
                        <div className="space-y-12 pb-24">
                          {/* Opening Insight */}
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4"
                          >
                            <h4 className="text-xl md:text-3xl font-black text-foreground leading-tight italic">
                              "{reportData.reportData.opening_insight}"
                            </h4>
                            <div className="w-12 h-1 bg-primary/20 mx-auto rounded-full" />
                          </motion.div>

                          {/* What You Protect */}
                          {reportData.reportData.what_you_protect && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                              className="bg-primary/5 border border-primary/20 rounded-3xl p-6 md:p-10 text-center space-y-3"
                            >
                              <Lock className="w-8 h-8 text-primary mx-auto opacity-50" />
                              <h5 className="text-primary font-black uppercase tracking-widest text-sm">أنت تحمي في داخلك</h5>
                              <p className="text-2xl md:text-3xl font-black text-foreground">{reportData.reportData.what_you_protect}</p>
                            </motion.div>
                          )}

                          {/* Analysis Sections */}
                          <div className="space-y-8">
                             {[
                               { title: 'تحليل النمط الأساسي', content: reportData.reportData.primary_analysis },
                               { title: 'تحليل النمط الثانوي', content: reportData.reportData.secondary_analysis },
                               { title: 'كيمياء المزج بين الأنماط', content: reportData.reportData.blend_analysis }
                             ].filter(s => s.content).map((sec, i) => (
                               <div key={i} className="space-y-4">
                                 <h5 className="text-xl font-black text-primary flex items-center gap-2">
                                   <div className="w-1.5 h-6 bg-primary rounded-full" />
                                   {sec.title}
                                 </h5>
                                 <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                   {sec.content}
                                 </p>
                               </div>
                             ))}
                          </div>

                          {/* Strengths & Challenges Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                              <h5 className="text-xl font-black text-emerald-500 flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6" />
                                نقاط القوة
                              </h5>
                              <div className="space-y-4">
                                {reportData.reportData.strengths?.map((s: any, i: number) => (
                                  <div key={i} className="bg-muted/50 border border-border/50 rounded-2xl p-6 space-y-2 hover:bg-muted transition-colors">
                                    <p className="font-black text-foreground text-lg">{s.title}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                                    {s.example && <p className="text-xs text-primary/70 font-bold mt-2">مثال: {s.example}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-6">
                              <h5 className="text-xl font-black text-amber-500 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" />
                                التحديات المتكررة
                              </h5>
                              <div className="space-y-4">
                                {reportData.reportData.challenges?.map((c: any, i: number) => (
                                  <div key={i} className="bg-muted/50 border border-border/50 rounded-2xl p-6 space-y-2 hover:bg-muted transition-colors">
                                    <p className="font-black text-foreground text-lg">{c.title}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
                                    {c.development_hint && <p className="text-xs text-amber-500/70 font-bold mt-2 italic">تلميح: {c.development_hint}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* External Perception */}
                          {(reportData.reportData.how_others_see_you || reportData.reportData.intention_vs_impact) && (
                            <div className="bg-card border border-border shadow-md rounded-[32px] overflow-hidden">
                              <div className="bg-primary/10 px-8 py-4 border-b border-border">
                                <h5 className="font-black text-lg text-primary flex items-center gap-2">
                                  <Share2 className="w-5 h-5" />
                                  كيف يراك العالم؟
                                </h5>
                              </div>
                              <div className="p-8 space-y-8">
                                {reportData.reportData.how_others_see_you && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">الانطباع الخارجي</p>
                                    <p className="text-lg leading-relaxed">{reportData.reportData.how_others_see_you}</p>
                                  </div>
                                )}
                                {reportData.reportData.intention_vs_impact && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">النية مقابل الأثر</p>
                                    <p className="text-lg leading-relaxed text-foreground/80">{reportData.reportData.intention_vs_impact}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Practical Sentences */}
                          {reportData.reportData.practical_sentences?.length > 0 && (
                            <div className="space-y-6">
                              <h5 className="text-xl font-black text-foreground text-center">جمل تساعدك في مواقفك اليومية</h5>
                              <div className="flex flex-wrap justify-center gap-3">
                                {reportData.reportData.practical_sentences.map((s: string, i: number) => (
                                  <div key={i} className="bg-background border border-border/50 px-6 py-3 rounded-2xl shadow-sm font-bold text-sm hover:border-primary/50 transition-all cursor-default">
                                    "{s}"
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Development Plan */}
                          {reportData.reportData.development_plan?.length > 0 && (
                            <div className="space-y-8 bg-muted/30 rounded-[40px] p-8 md:p-12 border border-border">
                               <h5 className="text-2xl font-black text-foreground text-center mb-4">خطة التطوير العملية</h5>
                               <div className="space-y-8 relative">
                                  <div className="absolute top-0 bottom-0 right-[15px] w-0.5 bg-primary/10" />
                                  {reportData.reportData.development_plan.map((step: any, i: number) => (
                                    <div key={i} className="relative pr-12">
                                      <div className="absolute top-1 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-xs z-10 shadow-lg shadow-primary/20">
                                        {i + 1}
                                      </div>
                                      <div className="space-y-2">
                                        <p className="font-black text-lg text-foreground">{step.step}</p>
                                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                                      </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}

                          {/* Closing Message */}
                          {reportData.reportData.closing_message && (
                            <motion.div 
                              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                              className="text-center pt-8 border-t border-border"
                            >
                               <p className="text-xl font-medium text-muted-foreground leading-relaxed">
                                 {reportData.reportData.closing_message}
                               </p>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        /* Fallback to Text Report */
                        <div className={cn(
                          "prose prose-slate dark:prose-invert max-w-none text-foreground leading-relaxed font-medium text-base md:text-lg whitespace-pre-wrap transition-all pb-6",
                        )}>
                          {report || 'حدث خطأ أثناء تحميل التقرير. يرجى المحاولة لاحقاً.'}
                        </div>
                      )}

                      {dbResult?.attempt?.test?.book && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-12 pt-12 border-t border-border flex flex-col items-center text-center space-y-6"
                        >
                            <div className="space-y-2">
                              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-xs font-black">
                                <CheckCircle2 className="w-4 h-4" />
                                اكتمل التحليل بنجاح
                              </div>
                              <h3 className="text-xl md:text-2xl font-black text-foreground">هدية إضافية: {dbResult.attempt.test.book.title}</h3>
                              <p className="text-muted-foreground text-sm font-medium">لقد حصلت أيضاً على النسخة الرقمية الكاملة من هذا الكتاب</p>
                            </div>

                            <a href={dbResult.attempt.test.book.filePdf} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                              <Button className="h-16 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20 flex items-center gap-3 group">
                                <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                تحميل الكتاب بصيغة PDF
                              </Button>
                            </a>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              /* --- FREE SHORT RESULT --- */
              <motion.div 
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
                className="bg-card rounded-[40px] p-6 md:p-12 border border-primary/20 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary to-accent" />
                
                {/* Reassurance Message */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl p-4 text-center mb-8 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-bold text-sm">هذه النتيجة المختصرة مجانية لك بالكامل! الدفع مطلوب فقط في حال رغبتك بفتح التقرير الشامل.</span>
                </div>

                <div className="space-y-10">
                  {/* Short Description */}
                  <div className="text-center space-y-4">
                     <h3 className="text-2xl md:text-3xl font-black text-foreground">النتيجة المختصرة ({currentType.name})</h3>
                     <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                       {currentType.description}
                     </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="bg-muted/50 rounded-3xl p-6 border border-border/50">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                             <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                           </div>
                           <h4 className="font-black text-lg">أهم نقاط قوتك</h4>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{currentType.strengths}</p>
                     </div>
                     
                     <div className="bg-muted/50 rounded-3xl p-6 border border-border/50">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                             <AlertTriangle className="w-5 h-5 text-rose-500" />
                           </div>
                           <h4 className="font-black text-lg">تحدٍ متكرر تواجهه</h4>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{currentType.weaknesses}</p>
                     </div>
                  </div>

                  <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 text-center">
                     <h4 className="font-black text-lg mb-2 text-primary">مثال واقعي:</h4>
                     <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">{currentType.work}</p>
                  </div>

                  {/* Free Upgrade CTA */}
                  <div className="pt-8 border-t border-border flex flex-col items-center justify-center text-center space-y-8">
                    <div className="max-w-2xl space-y-5 px-6">
                      <p className="text-xl md:text-3xl font-black text-foreground leading-tight">
                        هذه مجرد <span className="text-primary">بداية</span> لاكتشاف أعماق شخصيتك...
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right">
                        {[
                          { icon: Heart, text: 'تحليل عميق لطبيعتك في الزواج والعلاقات' },
                          { icon: Briefcase, text: 'كيف تتفاعل في بيئة العمل ومع المدير' },
                          { icon: Lightbulb, text: 'مع المال والقرار والمخاطرة' },
                          { icon: BookOpen, text: 'جمل وتمارين قابلة للتطبيق' }
                        ].map((feat, i) => (
                          <div key={i} className="flex items-center gap-3 text-muted-foreground text-sm font-bold bg-background p-3 rounded-xl border border-border">
                            <feat.icon className="w-5 h-5 text-primary" />
                            <span>{feat.text}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-muted-foreground font-bold text-sm md:text-base leading-relaxed bg-muted/50 p-4 rounded-xl border border-border/50">
                        احصل الآن على التقرير الشامل واستمتع بتحليل مفصل يساعدك في فهم شخصيتك بدقة، والارتقاء بعلاقاتك، ومسارك المهني.
                      </p>
                    </div>
                    
                    <Link href={`/checkout?type=test&id=${result?.attemptId || urlAttemptId}`} className="w-full md:w-auto px-6">
                      <Button className="h-14 md:h-20 w-full md:px-14 rounded-2xl md:rounded-3xl bg-gradient-to-r from-primary via-accent to-purple-600 hover:from-primary/90 hover:via-accent/90 hover:to-purple-500 text-primary-foreground font-black text-lg md:text-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 md:gap-4 border-none group">
                        <Crown className="w-5 h-5 md:w-8 md:h-8 group-hover:rotate-12 transition-transform" />
                        اشترك وافتح التقرير الكامل
                      </Button>
                    </Link>
                    
                    <div className="space-y-2 mt-4">
                      <p className="text-xs text-muted-foreground/80 font-black uppercase tracking-widest bg-muted/50 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block border border-border/50">تقرير مخصص ومُعد بعناية وحرفية</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>

      {/* Share Popup */}
      <AnimatePresence>
        {showSharePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSharePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-border space-y-6"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="font-black text-lg text-foreground">مشاركة النتيجة</h3>
                </div>
                <button onClick={() => setShowSharePopup(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="bg-muted rounded-2xl p-4 text-center">
                <p className="text-sm font-black text-muted-foreground">نمطك الأساسي</p>
                <p className="text-2xl font-black text-purple-500 mt-1">{currentType.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {resultShareLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`h-14 rounded-2xl text-white font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${link.color}`}
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(resultsUrl)
                  setCopiedLink(true)
                  setTimeout(() => setCopiedLink(false), 2000)
                }}
                className="w-full h-14 bg-background hover:bg-muted rounded-2xl font-black flex items-center justify-center gap-2 transition-all border border-border text-foreground"
              >
                {copiedLink ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                {copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
