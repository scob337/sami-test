'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { useTestStore } from '@/lib/store/test-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { 
  Crown, Star, Heart, Briefcase, Lightbulb, 
  AlertTriangle, CheckCircle2, Lock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useEffect, useState } from 'react'
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

  // Fetch results if not in store
  const { data: dbResult, isLoading: isLoadingResult } = useSWR<any>(
    (!result && urlAttemptId) ? `/api/test/result?attemptId=${urlAttemptId}` : null,
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

  const { data: reportData } = useSWR<any>(
    (result?.attemptId || urlAttemptId) ? `/api/test/report?attemptId=${result?.attemptId || urlAttemptId}` : null,
    fetcher
  )

  const report = reportData?.reportText

  // Protection: Redirect to home if no result and not loading
  useEffect(() => {
    if (!authLoading && !isLoadingResult && !result && !urlAttemptId) {
      router.push('/')
    }
  }, [result, urlAttemptId, isLoadingResult, authLoading, router])

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
      <Header />
      
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
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md"
          >
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-blue-200 text-xs font-bold">التقرير جاهز الآن</span>
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
              <div>
                <p className="text-xs font-black text-purple-400 uppercase tracking-widest mb-1">النمط الأساسي</p>
                <h2 className="text-3xl font-black text-white">{currentType.name}</h2>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 group hover:bg-white/10 transition-all cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-pink-400" />
              </div>
              <div>
                <p className="text-xs font-black text-pink-400 uppercase tracking-widest mb-1">النمط الثانوي</p>
                <h2 className="text-3xl font-black text-white">{secondaryType.name}</h2>
              </div>
            </motion.div>
          </div>

          {/* Traits Distribution Chart */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-[#112240] rounded-[40px] p-8 md:p-12 border border-white/5 shadow-2xl"
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

          {/* Detailed Analysis Sections */}
          <div className="space-y-6">
            
            {[
              { id: 'desc', title: 'وصف الشخصية', text: currentType.description, icon: Star, color: 'text-blue-400' },
              { id: 'strengths', title: 'نقاط القوة', text: currentType.strengths, icon: CheckCircle2, color: 'text-emerald-400' },
              { id: 'weaknesses', title: 'نقاط التحسين', text: currentType.weaknesses, icon: AlertTriangle, color: 'text-amber-400' },
              { id: 'relationships', title: 'في العلاقات', text: currentType.relationships, icon: Heart, color: 'text-pink-400' },
              { id: 'work', title: 'بيئة العمل', text: currentType.work, icon: Briefcase, color: 'text-indigo-400' },
              { id: 'tips', title: 'نصائح للتطوير', text: currentType.tips, icon: Lightbulb, color: 'text-amber-300' },
            ].map((section, idx) => (
              <motion.div 
                key={section.id}
                initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                className="bg-[#112240] rounded-[32px] p-8 border border-white/5 shadow-xl hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform", section.color.replace('text', 'bg').replace('400', '400/10'))}>
                    <section.icon className={cn("w-6 h-6", section.color)} />
                  </div>
                  <h4 className="text-xl font-black text-white">{section.title}</h4>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium text-lg pr-4 border-r-2 border-white/5">
                  {section.text}
                </p>
              </motion.div>
            ))}
            
          </div>

          {/* Premium Unlocked Banner */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
            className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[48px] p-10 md:p-16 text-center shadow-2xl shadow-blue-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                   <Lock className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white">هذا التقرير هو البداية فقط!</h2>
              <p className="text-blue-100 font-bold text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                للحصول على التقرير الكامل الذي يتضمن تحليلاً معمقاً لكل جانب من جوانب شخصيتك، مع خطة تطوير مفصلة ونصائح عملية مخصصة لك فقط.
              </p>
              <div className="pt-8">
                <Link href="/checkout">
                  <Button className="h-16 px-12 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-black text-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto">
                    <Crown className="w-6 h-6" />
                    احصل على التقرير الشامل الآن
                  </Button>
                </Link>
                <p className="text-blue-200/60 text-xs font-bold mt-4 uppercase tracking-[3px]">أكثر من 50 صفحة من التحليل المخصص</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
