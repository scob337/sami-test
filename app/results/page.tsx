'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Footer } from '@/components/layout/footer'
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
      <div className="min-h-screen flex items-center justify-center bg-[#0A1A3B]">
        <LoadingSpinner size="lg" className="text-blue-500" />
      </div>
    )
  }

  if (!result) return null;

  const dateStr = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="min-h-screen flex flex-col bg-[#0A1A3B]" dir="rtl">
      
      {/* Deep Blue Header Area */}
      <div className="bg-[#0A1A3B] pt-32 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(25,75,155,0.4)_0%,transparent_60%)]" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-600 rounded-full blur-[150px] opacity-20" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-4">
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-blue-400 font-bold uppercase tracking-widest text-sm"
          >
            {dateStr}
          </motion.p>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-white leading-tight"
          >
            تحليل شخصية {user?.user_metadata?.fullName || user?.email?.split('@')[0] || 'المبدع'}
          </motion.h1>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4 mt-6"
          >
             <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-blue-200 text-xs font-bold">التقرير جاهز الآن</span>
             </div>
             
             <div className="flex items-center gap-3">
               <button
                 onClick={() => router.push('/test')}
                 className="text-blue-400 hover:text-white text-sm font-bold bg-white/5 hover:bg-white/10 px-6 py-2 rounded-xl transition-all border border-white/10"
               >
                 إعادة الاختبار
               </button>
               <button
                 onClick={() => setShowSharePopup(true)}
                 className="text-emerald-400 hover:text-white text-sm font-bold bg-emerald-500/10 hover:bg-emerald-500/20 px-6 py-2 rounded-xl transition-all border border-emerald-500/20 flex items-center gap-2"
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
              className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 group hover:bg-white/10 transition-all cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Crown className="w-8 h-8 text-purple-400" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-purple-400 uppercase tracking-widest">النمط الأساسي</p>
                <h2 className="text-3xl font-black text-white">{currentType.name}</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[250px]">
                  {currentType.description}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 group hover:bg-white/10 transition-all cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-pink-400" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-pink-400 uppercase tracking-widest">النمط الثانوي</p>
                <h2 className="text-3xl font-black text-white">
                  {result?.secondaryPattern ? secondaryType.name : 'لا توجد شخصية'}
                </h2>
                {result?.secondaryPattern && (
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[250px]">
                    {secondaryType.description}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Traits Distribution Chart */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-slate-50 dark:bg-[#112240] rounded-[40px] p-8 md:p-12 border border-white/5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-white">توزيع الأنماط</h3>
              <div className="text-blue-400 bg-blue-400/10 px-4 py-2 rounded-xl text-xs font-black">تحليل حسابي دقيق</div>
            </div>
            
            <div className="space-y-6">
              {sortedScores.map(([typeCode, score]: [string, any], index: number) => {
                const traitData = PERSONALITY_DETAILED_DATA[typeCode.toUpperCase()] || { name: typeCode };
                const colorClass = (TRAIT_COLORS as any)[typeCode.toUpperCase()] || 'bg-slate-500';
                const widthPercent = Math.min(100, ((score as number) / 15) * 100);

                return (
                  <div key={typeCode} className="group">
                    <div className="flex justify-between items-center text-sm font-bold mb-2">
                       <span className="text-white bg-white/5 px-3 py-1 rounded-lg group-hover:bg-white/10 transition-colors">{score as number} نقطة</span>
                       <span className="text-slate-300">{traitData.name}</span>
                    </div>
                    <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden flex justify-end p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${widthPercent}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                        className={`h-full rounded-full ${colorClass} shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Simplified Report Content */}
          <div className="space-y-8">
            {/* Comprehensive Report Block (Locked/Unlocked) */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              className="bg-slate-50 dark:bg-[#112240] rounded-[40px] p-8 md:p-12 border border-white/5 shadow-2xl space-y-8 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                    <Star className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-white">التقرير التحليلي الشامل</h3>
                    <p className="text-slate-400 font-medium text-sm md:text-base mt-1 italic">تقرير مفصل تم إعداده خصيصاً لك</p>
                  </div>
                </div>
                {reportData?.isPartial ? (
                  <div className="flex flex-col items-end gap-2 text-blue-400">
                    <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                      <Lock className="w-3 h-3" />
                      نسخة مجانية
                    </div>
                  </div>
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                )}
              </div>

              <div className="relative min-h-[200px]">
                {isPending ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-blue-400 font-bold animate-pulse">جاري تحليل بياناتك وصياغة التقرير...</p>
                  </div>
                ) : (
                  <>
                    <div className={cn(
                      "prose prose-invert max-w-none text-slate-300 leading-relaxed font-medium text-base md:text-lg whitespace-pre-wrap transition-all pb-64 md:pb-80",
                      reportData?.isPartial && "max-h-[800px] md:max-h-[1000px] overflow-hidden mask-fade-bottom"
                    )}>
                      {report || 'جاري تحميل تفاصيل التقرير...'}
                    </div>

                    {reportData?.isPartial && (
                      <div className="absolute inset-x-0 bottom-0 pt-64 md:pt-96 pb-8 md:pb-16 flex flex-col items-center justify-center bg-gradient-to-t from-[#112240] via-[#112240]/98 to-transparent z-40 text-center space-y-6 md:space-y-10">
                        <div className="max-w-xl space-y-5 md:space-y-7 px-6">
                          <p className="text-lg md:text-2xl font-black text-white leading-tight">
                            هذه مجرد <span className="text-blue-400">بداية</span> لاكتشاف أعماق شخصيتك...
                          </p>
                          
                          {/* Curiosity Features List */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                            {[
                              { icon: Heart, text: 'تحليل عميق للعلاقات العاطفية' },
                              { icon: Briefcase, text: 'دليل المسار المهني المثالي لك' },
                              { icon: Lightbulb, text: 'استراتيجيات تطوير نقاط القوة' },
                              { icon: AlertTriangle, text: 'تحذيرات حول عيوب الشخصية' }
                            ].map((feat, i) => (
                              <div key={i} className="flex items-center gap-2 text-slate-400 text-[10px] md:text-xs">
                                <feat.icon className="w-3 h-3 md:w-4 md:h-4 text-blue-500/50" />
                                <span>{feat.text}</span>
                              </div>
                            ))}
                          </div>

                          <p className="text-slate-400 font-bold text-xs md:text-base leading-relaxed">
                            افتح التقرير الكامل الآن للحصول على كافة التفاصيل الحصرية التي تنتظرك.
                          </p>
                        </div>
                        
                        <Link href={`/checkout?type=test&id=${result?.attemptId || urlAttemptId}`} className="w-full md:w-auto px-6">
                          <Button className="h-14 md:h-20 w-full md:px-14 rounded-2xl md:rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-lg md:text-2xl shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 md:gap-4 border border-white/10 group">
                            <Crown className="w-5 h-5 md:w-8 md:h-8 group-hover:rotate-12 transition-transform" />
                            اشترك وافتح التقرير الكامل
                          </Button>
                        </Link>
                        
                        <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest opacity-60">تحليل مدعوم بالذكاء الاصطناعي بنسبة 100%</p>
                      </div>
                    )}
                    
                    {isPaid && dbResult?.attempt?.test?.book && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 pt-12 border-t border-white/5 flex flex-col items-center text-center space-y-6"
                      >
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black">
                              <CheckCircle2 className="w-4 h-4" />
                              اكتمل التحليل بنجاح
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white">هدية إضافية: {dbResult.attempt.test.book.title}</h3>
                            <p className="text-slate-400 text-sm font-medium">لقد حصلت أيضاً على النسخة الرقمية الكاملة من هذا الكتاب</p>
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
          </div>

        </div>
      </div>
      <Footer />

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
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10 space-y-6"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">مشاركة النتيجة</h3>
                </div>
                <button onClick={() => setShowSharePopup(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-sm font-black text-slate-700 dark:text-slate-300">نمطك الأساسي</p>
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
                className="w-full h-14 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl font-black flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
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
