'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Sparkles, Lock, Timer, BarChart3 } from 'lucide-react'

export function HeroSection({ content }: { content?: any }) {
    const router = useRouter()
    const { user: authUser } = useAuthStore()

    const title = content?.title || '7 Types'
    const subtitle = content?.subtitle || 'اكتشف نمط شخصيتك الحقيقي'
    const description = content?.description || 'أجب على 13 سؤالاً بسيطاً واحصل على تحليل شامل لشخصيتك يكشف لك نقاط قوتك وكيف تتعامل مع العالم من حولك.'
    const buttonText = content?.buttonText || 'ابدأ الاختبار'
    const buttonLink = content?.buttonLink || '/test-library'

    return (
        <section className="relative flex flex-col items-center justify-center min-h-[90vh] overflow-hidden text-center px-4 pt-20" dir="rtl">
            {/* Ambient Background with theme support */}
            <div className="absolute inset-0 bg-background" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.15)_0%,transparent_60%)]" />
            
            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-8">
                {content?.heroImage ? (
                  <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="w-full max-w-md h-auto mb-4 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10"
                  >
                      <img 
                        src={content.heroImage} 
                        alt={title} 
                        className="w-full h-auto object-cover"
                      />
                  </motion.div>
                ) : (
                  <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="w-24 h-24 mb-4 rounded-full bg-card backdrop-blur-md flex items-center justify-center shadow-2xl shadow-primary/10 overflow-hidden border border-border"
                  >
                      <img 
                        src="/Logo.png" 
                        alt="7Types Logo" 
                        className="w-16 h-16 object-contain"
                      />
                  </motion.div>
                )}

                {/* Typography */}
                <div className="space-y-4">
                    <motion.h1
                        dir={title.includes('7 Types') ? 'ltr' : 'rtl'}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-foreground tracking-tight leading-tight"
                    >
                        {title}
                    </motion.h1>
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-2xl md:text-3xl text-primary font-bold"
                    >
                        {subtitle}
                    </motion.h2>
                    
                    {content?.quote && (
                       <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.25 }}
                          className="bg-primary/10 border border-primary/20 rounded-2xl p-4 my-6 italic text-lg text-primary font-bold max-w-lg mx-auto"
                       >
                           "{content.quote}"
                       </motion.div>
                    )}

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto mt-6"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="pt-6 flex flex-col md:flex-row gap-4 justify-center"
                >
                    <button 
                        onClick={() => {
                            router.push(buttonLink)
                        }}
                        className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white px-12 py-5 rounded-2xl font-black text-xl md:text-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/20 cursor-pointer"
                    >
                        {buttonText}
                        <Sparkles className="w-6 h-6 animate-pulse" />
                    </button>

                    {content?.videoUrl && (
                      <a href={content.videoUrl} target="_blank" rel="noopener noreferrer">
                        <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-bold text-lg md:text-xl transition-all shadow-lg border border-white/10 cursor-pointer w-full md:w-auto h-full">
                            مشاهدة الإعلان المسموع
                        </button>
                      </a>
                    )}
                </motion.div>

                {/* Features Badges */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-8 pt-12 text-sm md:text-base font-bold text-muted-foreground"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border">
                        <Lock className="w-4 h-4 text-orange-500" />
                        <span>خصوصية تامة</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border">
                        <Timer className="w-4 h-4 text-blue-500" />
                        <span>5 دقائق فقط</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        <span>تحليل فوري</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
