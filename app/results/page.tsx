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

const TRAIT_COLORS: Record<string, string> = {
  'WISE': 'bg-purple-500',
  'OPEN': 'bg-pink-500',
  'PRECISE': 'bg-blue-600',
  'THINKER': 'bg-cyan-500',
  'ASSERTIVE': 'bg-red-500',
  'CALM': 'bg-emerald-500',
  'SPONTANEOUS': 'bg-amber-500',
}

const PERSONALITY_TYPES = [
  { code: 'ASSERTIVE', name: 'الحازم', description: 'قائد طبيعي ومبادر، يمتلك رؤية واضحة وقدرة على اتخاذ القرارات الصعبة.' },
  { code: 'PRECISE', name: 'المدقق', description: 'منظم ويهتم بالتفاصيل، يسعى دائماً للإتقان والجودة في كل عمل.' },
  { code: 'CALM', name: 'الهادئ', description: 'هادئ ومتزن ومستمع جيد، يفضل الاستقرار والانسجام في محيطه.' },
  { code: 'WISE', name: 'الحكيم', description: 'عميق التفكير ورزين، يمتلك بصيرة نافذة وقدرة على فهم الأمور بعمق.' },
  { code: 'SPONTANEOUS', name: 'العفوي', description: 'مبدع، حيوي ومحب للمغامرة، يكره الروتين ويبحث دائماً عن التجديد.' },
  { code: 'OPEN', name: 'المنفتح', description: 'اجتماعي وودود بجاذبية طبيعية، يستمتع بالتواصل مع الآخرين وبناء العلاقات.' },
  { code: 'THINKER', name: 'المفكر', description: 'تحليلي ومنطقي، يعتمد على البيانات والعقل في اتخاذ قراراته وفهم الحياة.' },
]

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

export default function ResultsPage() {
  const router = useRouter()
  const { result } = useTestStore()
  const { user } = useAuthStore()
  
  const { data: reportData } = useSWR(
    result?.attemptId ? `/api/test/report?attemptId=${result.attemptId}` : null,
    fetcher
  )

  const report = reportData?.reportText

  const currentType = useMemo(() => {
    if (!result) return PERSONALITY_TYPES[3] // Default to Wise for testing if empty
    return PERSONALITY_TYPES.find(
      (t) => t.code === (result.primaryPattern || '').toUpperCase()
    ) || PERSONALITY_TYPES[3]
  }, [result?.primaryPattern])

  const secondaryType = useMemo(() => {
    if (!result) return PERSONALITY_TYPES[5] // Default to Open
    // Just sort scores and grab the second one
    const sorted = Object.entries(result.scores || {}).sort(([, a], [, b]) => (b as number) - (a as number))
    if (sorted.length > 1) {
      return PERSONALITY_TYPES.find(t => t.code === sorted[1][0]) || PERSONALITY_TYPES[5]
    }
    return PERSONALITY_TYPES[5]
  }, [result?.scores])

  const sortedScores = useMemo(() => {
    if (!result?.scores) {
      // Dummy data matching mockup
      return [
        ['WISE', 9], ['OPEN', 9], ['PRECISE', 7], ['THINKER', 7], 
        ['ASSERTIVE', 6], ['CALM', 5], ['SPONTANEOUS', 3]
      ]
    }
    return Object.entries(result.scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
  }, [result?.scores])

  if (!result && false) { // Removed forced return for testing mockup styles if no result
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Helper date for mockup
  const dateStr = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="min-h-screen flex flex-col bg-slate-50" dir="rtl">
      
      {/* Deep Blue Header Area */}
      <div className="bg-[#0A1A3B] pt-12 pb-32 px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(25,75,155,0.4)_0%,transparent_60%)]" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-2 mt-8">
          <p className="text-blue-200/70 text-sm">{dateStr}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            نتيجة {user && 'name' in user ? (user as any).name : 'شخصيتك'}
          </h1>
        </div>
      </div>

      {/* Main Content Overlapping Header */}
      <div className="flex-1 px-4 -mt-20 relative z-20 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Top Cards (Primary & Secondary) */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-3"
            >
              <Crown className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-xs md:text-sm text-slate-500 mb-1">النمط الأساسي</p>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">{currentType.name}</h2>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-3"
            >
              <Star className="w-8 h-8 text-pink-500" />
              <div>
                <p className="text-xs md:text-sm text-slate-500 mb-1">النمط الثانوي</p>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">{secondaryType.name}</h2>
              </div>
            </motion.div>
          </div>

          {/* Traits Distribution Chart */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-6 text-right">توزيع الأنماط</h3>
            
            <div className="space-y-4">
              {sortedScores.map(([typeCode, score], index) => {
                const trait = PERSONALITY_TYPES.find(t => t.code === typeCode) || { name: typeCode };
                const colorClass = TRAIT_COLORS[typeCode as string] || 'bg-slate-500';
                // Calculate width percentage relative to max score (13)
                const widthPercent = Math.min(100, ((score as number) / 13) * 100);

                return (
                  <div key={typeCode} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-500">{score as number}</span>
                      <span className="text-slate-700">{trait.name}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex justify-end">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${widthPercent}%` }} transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-full rounded-full ${colorClass}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Characteristics Cards List */}
          <div className="space-y-4 pt-4">
            
            {/* Description */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              className="bg-white rounded-xl md:rounded-2xl p-6 shadow-sm border border-slate-100 text-right"
            >
              <div className="flex items-center justify-end gap-3 mb-3">
                <h4 className="font-bold text-slate-900 text-lg">وصف مختصر</h4>
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-slate-500 leading-relaxed font-medium">
                شخصية حكيمة ومتأملة تتميز بالعمق في التفكير والنظرة الشاملة للأمور.
              </p>
            </motion.div>

            {/* Strengths */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              className="bg-white rounded-xl md:rounded-2xl p-6 shadow-sm border border-slate-100 text-right"
            >
              <div className="flex items-center justify-end gap-3 mb-3">
                <h4 className="font-bold text-slate-900 text-lg">نقاط القوة</h4>
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-slate-500 leading-relaxed font-medium">
                الحكمة والبصيرة، النظرة الشاملة، القدرة على تقديم النصح، التفكير الاستراتيجي.
              </p>
            </motion.div>

            {/* Weaknesses */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              className="bg-white rounded-xl md:rounded-2xl p-6 shadow-sm border border-slate-100 text-right"
            >
              <div className="flex items-center justify-end gap-3 mb-3">
                <h4 className="font-bold text-slate-900 text-lg">نقاط التحسين</h4>
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-slate-500 leading-relaxed font-medium">
                الإفراط في التحليل، صعوبة اتخاذ قرارات سريعة، العزلة أحياناً.
              </p>
            </motion.div>

            {/* Relationships */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              className="bg-white rounded-xl md:rounded-2xl p-6 shadow-sm border border-slate-100 text-right"
            >
              <div className="flex items-center justify-end gap-3 mb-3">
                <h4 className="font-bold text-slate-900 text-lg">العلاقات</h4>
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-slate-500 leading-relaxed font-medium">
                تقدم عمقاً فكرياً لعلاقاتك. تحتاج لشريك يقدر تأملاتك ويشاركك الحوار.
              </p>
            </motion.div>

            {/* Work */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              className="bg-white rounded-xl md:rounded-2xl p-6 shadow-sm border border-slate-100 text-right"
            >
              <div className="flex items-center justify-end gap-3 mb-3">
                <h4 className="font-bold text-slate-900 text-lg">بيئة العمل</h4>
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-slate-500 leading-relaxed font-medium">
                مناسب للأدوار الاستشارية والاستراتيجية. تتفوق في التخطيط طويل المدى.
              </p>
            </motion.div>

            {/* Tips */}
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              className="bg-white rounded-xl md:rounded-2xl p-6 shadow-sm border border-slate-100 text-right"
            >
              <div className="flex items-center justify-end gap-3 mb-3">
                <h4 className="font-bold text-slate-900 text-lg">نصائح للتطوير</h4>
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-slate-500 leading-relaxed font-medium">
                وازن بين التأمل والعمل. ولا تدع التحليل يمنعك من التقدم.
              </p>
            </motion.div>
            
          </div>

          {/* Premium Unlocked Banner */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
            className="mt-12 bg-[#F59E0B] rounded-2xl md:rounded-3xl p-8 md:p-12 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-slate-900/10 flex items-center justify-center">
                 <Lock className="w-8 h-8 text-slate-900" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">هذا التقرير مختصر وغير مكتمل!</h2>
            <p className="text-slate-900/80 font-medium mb-8 max-w-lg mx-auto">
              للحصول على التقرير الكامل الذي يتضمن تحليلاً معمقاً لشخصيتك، وخطة تطوير مفصلة، ونصائح مخصصة - احصل على الكتاب الكامل.
            </p>
            <Link href="/checkout">
              <button className="bg-slate-900 text-white hover:bg-slate-800 transition-colors px-8 py-4 rounded-xl font-bold text-lg md:text-xl shadow-xl w-full sm:w-auto cursor-pointer">
                احصل على التقرير الكامل
              </button>
            </Link>
          </motion.div>

        </div>
      </div>
    </main>
  )
}
