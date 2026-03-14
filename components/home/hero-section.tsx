'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/layout/container'
import Link from 'next/link'
import { Wand2, PlayCircle, ShieldCheck, Star, User, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'

export function HeroSection() {
    return (
        <>
            {/* Hero Section */}
            <section className="pt-20 pb-16 sm:pt-32 sm:pb-32 overflow-hidden relative" dir="rtl">
                <div className="absolute inset-x-0 top-0 h-[40rem] bg-gradient-to-b from-background via-background to-transparent -z-10"></div>
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:2rem_2rem] -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Hero Content */}
                        <div className="relative z-10 text-center lg:text-right">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-950/50 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-8 shadow-sm">
                                <Wand2 className="text-accent w-4 h-4" />
                                <span className="text-xs text-primary dark:text-slate-100 font-bold tracking-widest">منصة الذكاء الشخصي</span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-primary dark:text-slate-100 mb-6 leading-[1.1]">
                                اعرف نفسك. <br/>افهم الآخرين.
                            </h1>
                            <p className="mt-4 text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                                في عصر الذكاء الاصطناعي، فهم الأشخاص هو قوتك الخارقة. اكتشف شخصيتك وتعلم كيف تعمل بشكل أفضل مع كل من حولك.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                                <Link href="/test" className="w-full sm:w-auto">
                                    <div className="w-full sm:w-auto text-white font-bold bg-blue-500  px-8 py-4 rounded-full hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                        ابدأ مجاناً
                                    </div>
                                </Link>

                            </div>


                        </div>

                        {/* Hero Visual / Mockup */}
                        <div className="relative mx-auto w-full max-w-lg lg:max-w-none" dir="ltr">
                            {/* Decorative glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent/5 blur-3xl rounded-full -z-10"></div>

                            <div className="bg-white dark:bg-slate-900 border text-foreground border-border rounded-xl shadow-2xl dark:shadow-none p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl">
                                {/* Browser Chrome */}
                                <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/50"></div>
                                    <div className="ml-4 flex-1 h-6 bg-muted rounded-md border border-border/50 flex items-center px-3">
                                        <span className="text-xs text-muted-foreground font-medium">linkedin.com/in/saeed-almahdi</span>
                                    </div>
                                </div>

                                {/* Fake Profile Area */}
                                <div className="flex items-start gap-4 mb-8">
                                    <div className="w-16 h-16 rounded-full bg-muted border border-border flex-shrink-0 flex items-center justify-center">
                                        <User className="text-2xl text-muted-foreground w-8 h-8" />
                                    </div>
                                    <div className="flex-1 space-y-2 pt-1">
                                        <div className="h-5 w-1/2 bg-primary/80 rounded-md"></div>
                                        <div className="h-3 w-3/4 bg-muted-foreground/30 rounded-md"></div>
                                        <div className="h-3 w-1/3 bg-muted-foreground/30 rounded-md"></div>
                                    </div>
                                </div>

                                {/* Crystal Floating Extension Mockup */}
                                <div className="absolute top-20 right-4 sm:right-6 w-72 bg-white dark:bg-slate-950 border-t-8 border-t-accent shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-none border-x border-b border-border rounded-xl p-5 transform translate-x-2 translate-y-4" dir="rtl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-primary dark:text-slate-100">سعيد المهدي</h3>
                                            <p className="text-sm text-muted-foreground font-medium">المحلل الاستراتيجي</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-accent flex justify-center items-center text-white font-bold shadow-sm">
                                            I
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="text-[10px] font-bold text-accent-foreground bg-accent/90 px-2 py-1 rounded">منطقي</span>
                                        <span className="text-[10px] font-bold text-accent-foreground bg-accent/90 px-2 py-1 rounded">مستقل</span>
                                        <span className="text-[10px] font-bold text-accent-foreground bg-accent/90 px-2 py-1 rounded">مفكر حرج</span>
                                    </div>
                                    
                                    <div className="bg-[#F3F6FA] dark:bg-slate-900 rounded-lg p-3 border border-[#E1E5EA] dark:border-slate-800">
                                        <span className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1 block">كيفية التواصل</span>
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                            ركز على البيانات والأهداف الطويلة المدى. يفضل سعيد الأحاديث المباشرة وتجنب المقدمات الطويلة.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
