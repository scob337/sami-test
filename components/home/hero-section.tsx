'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Brain, Sparkles, Lock, Timer, BarChart3 } from 'lucide-react'

export function HeroSection() {
    const router = useRouter()
    const { user: authUser } = useAuthStore()
    return (
        <section className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center px-4" dir="rtl">
            {/* Deep Blue Background Gradient */}
            <div className="absolute inset-0 bg-[#0A1A3B]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,75,155,0.2)_0%,transparent_60%)]" />
            
            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-8">
                {/* Brain Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 mb-4 rounded-full bg-[#1A56DB] flex items-center justify-center shadow-lg shadow-blue-900/50"
                >
                    <Brain className="w-12 h-12 text-white" />
                </motion.div>

                {/* Typography */}
                <div className="space-y-4">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-6xl font-bold text-white tracking-tight"
                    >
                        اختبار سامي
                    </motion.h1>
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl md:text-2xl text-blue-100 font-medium"
                    >
                        اكتشف نمط شخصيتك الحقيقي
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-base md:text-lg text-blue-200/80 leading-relaxed max-w-xl mx-auto mt-6"
                    >
                        أجب على 13 سؤالاً بسيطاً واحصل على تحليل شامل لشخصيتك يكشف لك نقاط قوتك وكيف تتعامل مع العالم من حولك.
                    </motion.p>
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="pt-6"
                >
                    <button 
                        onClick={() => {
                            router.push('/test-library')
                        }}
                        className="flex items-center justify-center gap-3 bg-[#10B981] hover:bg-[#059669] text-white px-10 py-5 rounded-2xl font-bold text-lg md:text-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/20 cursor-pointer"
                    >
                        ابدأ الاختبار
                        <Sparkles className="w-5 h-5" />
                    </button>
                </motion.div>

                {/* Features Badges */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-6 pt-12 text-sm text-blue-200/70"
                >
                    <div className="flex items-center gap-2">
                        <span>خصوصية تامة</span>
                        <Lock className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>5 دقائق فقط</span>
                        <Timer className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>تحليل فوري</span>
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
