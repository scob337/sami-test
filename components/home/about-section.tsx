'use client'

import { ScanSearch, ThumbsUp, ThumbsDown } from 'lucide-react'

export function AboutSection() {
    return (
        <section className="py-24 overflow-hidden" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Content Left (RTL means it appears on the right) */}
                    <div>
                        <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center mb-6">
                            <ScanSearch className="text-2xl text-accent w-6 h-6" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-4 leading-tight">
                            نساعدك على فهم نفسك بشكل أعمق.
                        </h2>
                        <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                            انطلقت Sami-Test بهدف سد الفجوة بين علوم النفس التقليدية واحتياجات العصر الحديث. نحن نؤمن أن فهم الذات هو المفتاح الأول للنجاح المهني والشخصي.
                        </p>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                                </div>
                                <span className="text-base font-bold text-slate-700">تحليل علمي دقيق يعتمد على الأنماط المعترف بها عالمياً.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                                </div>
                                <span className="text-base font-bold text-slate-700">توصيات مخصصة لكل مستخدم بناءً على نتائجه الفريدة.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                                </div>
                                <span className="text-base font-bold text-slate-700">بناء خرائط تواصل فعالة لتحسين ديناميكية العمل والفريق.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Visual Right (RTL means it appears on the left) */}
                    <div className="relative bg-background rounded-3xl p-8 border border-border flex items-center justify-center ltr-parent" dir="ltr">
                        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:16px_16px] opacity-10 rounded-3xl"></div>
                        <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-border shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-none rounded-xl p-6 border-t-8 border-t-accent" dir="rtl">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold tracking-tighter shadow-sm">
                                    INTJ
                                </div>
                                <h3 className="text-lg font-bold text-primary">المحلل الاستراتيجي (INTJ)</h3>
                                <p className="text-sm text-muted-foreground font-medium mt-1">مبتكر، منطقي، وموجه نحو التخطيط طويل الأمد.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-3 flex gap-3 items-start">
                                    <ThumbsUp className="text-emerald-600 dark:text-emerald-500 mt-0.5 shrink-0 w-4 h-4" />
                                    <div>
                                        <span className="block text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-1">يُنصح به</span>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">ركز على الأهداف المستقبلية واستخدم لغة منطقية وواضحة ترتكز على البيانات.</p>
                                    </div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl p-3 flex gap-3 items-start">
                                    <ThumbsDown className="text-red-600 dark:text-red-500 mt-0.5 shrink-0 w-4 h-4" />
                                    <div>
                                        <span className="block text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-widest mb-1">تجنب</span>
                                        <p className="text-xs text-red-700 dark:text-red-300 font-bold">إغراقهم بالتفاصيل الصغيرة غير الضرورية أو اتخاذ قرارات متسرعة بدون أسس موضوعية.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
