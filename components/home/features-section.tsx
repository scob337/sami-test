'use client'

import { Edit, Wand2, PhoneCall, Handshake, Users, Minus, Maximize, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function FeaturesSection() {
    return (
        <>
            {/* Feature 2: Reports Assistant */}
            <section className="py-24 overflow-hidden bg-background border-y border-border" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Visual Left (RTL -> appears on Right) */}
                        <div className="order-2 lg:order-1 relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-border flex items-center justify-center shadow-sm" dir="ltr">
                            <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:16px_16px] opacity-10 rounded-3xl"></div>
                            <div className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-border shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-none rounded-xl overflow-hidden flex flex-col">
                                {/* Editor Header */}
                                <div className="bg-muted px-4 py-3 border-b border-border flex justify-between items-center text-left">
                                    <span className="text-xs font-bold text-muted-foreground">تقرير تفصيلي</span>
                                    <div className="flex gap-2">
                                        <Minus className="w-4 h-4 text-muted-foreground" />
                                        <Maximize className="w-4 h-4 text-muted-foreground" />
                                        <X className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                                {/* Editor Body */}
                                <div className="p-4 flex-1 space-y-4 text-left">
                                    <div className="flex items-center gap-2 border-b border-border pb-2">
                                        <span className="text-xs font-bold text-muted-foreground w-12 text-right">للمستخدم:</span>
                                        <span className="text-sm font-bold text-primary bg-muted px-2 py-0.5 rounded">ali@Sami-Test.app</span>
                                    </div>
                                    <div className="flex items-center gap-2 border-b border-border pb-2">
                                        <span className="text-xs font-bold text-muted-foreground w-12 text-right">الموضوع:</span>
                                        <span className="text-sm font-bold text-primary">خارطة التطور الشخصي للربع الثالث</span>
                                    </div>
                                    <div className="pt-2 text-right">
                                        {/* AI generation effect */}
                                        <div className="flex items-center gap-2 mb-3 justify-end">
                                            <span className="text-xs font-bold text-primary dark:text-slate-200">الذكاء الاصطناعي يقوم بصياغة تقرير بناءً على نمط (ESTJ)...</span>
                                            <Wand2 className="w-4 h-4 text-accent" />
                                        </div>
                                        <p className="text-sm font-bold text-primary dark:text-slate-100 leading-relaxed bg-[#F3F6FA] dark:bg-slate-800 p-4 rounded-xl border border-[#E1E5EA] dark:border-slate-700" dir="rtl">
                                            مرحباً علي، <br /><br />
                                            من خلال متابعة تقدمك، نلاحظ أن قدراتك القيادية وحسمك للأمور قد أثرا إيجابياً على الفريق بشكل عام. <br /><br />
                                            للوصول إلى أهدافك في الربع الثالث، نوصي بالتركيز على تفويض المهام وتطوير المرونة في التعامل مع المتغيرات المفاجئة.<br /><br />
                                            بالتوفيق.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Right (RTL -> appears on Left) */}
                        <div className="order-1 lg:order-2">
                            <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center mb-6">
                                <Edit className="text-2xl text-accent w-6 h-6" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-4 leading-tight">
                                ابنِ علاقات أقوى عبر فهم من حولك.
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-medium">
                                تصور خريطة شخصية كاملة لك وللآخرين. اكتشف نقاط القوة الطبيعية، النقاط العمياء، ومواضع الاحتكاك المحتملة لتعزيز التواصل الصحي والفعال في بيئتك المهنية والشخصية.
                            </p>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                                    </div>
                                    <span className="text-base font-bold text-slate-700">رسوم بيانية توضح نقاط القوة والضعف بدقة.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                                    </div>
                                    <span className="text-base font-bold text-slate-700">مولد تقارير وتوصيات مبني على الذكاء الاصطناعي للمساعدة في اتخاذ قرارات يومية.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                                    </div>
                                    <span className="text-base font-bold text-slate-700">شارك بطاقة نتائجك المصممة باحترافية مع فريقك بسهولة.</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>

            {/* Use Cases / Bento Box */}
            <section className="py-24 bg-white dark:bg-slate-950" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary mb-4 leading-tight">
                            مصمم لكل جوانب حياتك.
                        </h2>
                        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                            سواء كنت تبحث عن التطور المهني أو الشخصي، تمنحك منصتنا ميزة فهم ذاتك والآخرين في ثوانٍ.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="bg-white dark:bg-slate-900 border text-primary dark:text-slate-100 border-border rounded-xl p-8 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-10 h-10 bg-accent rounded-lg text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <PhoneCall className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">فرق العمل والقيادة</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">نظم التواصل ووجه فريقك بأفضل طريقة من خلال إرساء سياسة التواصل المبنية على أنماط الأفراد ووعيهم الذاتي.</p>
                            <Link href="/test-library" className="text-sm font-bold text-primary flex items-center gap-1 hover:text-accent transition-colors w-fit">
                                <span>اكتشف المزيد</span>
                                <ArrowLeft className="w-4 h-4 mr-1" />
                            </Link>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white dark:bg-slate-900 border text-primary dark:text-slate-100 border-border rounded-xl p-8 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-10 h-10 bg-accent rounded-lg text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Handshake className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">النمو المهني</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">اكتشف مسار تطورك الوظيفي المناسب واصقل مهاراتك الناعمة لتقليل الاحتكاك مع زملائك في العمل والقيادة.</p>
                            <Link href="/test-library" className="text-sm font-bold text-primary flex items-center gap-1 hover:text-accent transition-colors w-fit">
                                <span>اكتشف المزيد</span>
                                <ArrowLeft className="w-4 h-4 mr-1" />
                            </Link>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white dark:bg-slate-900 border text-primary dark:text-slate-100 border-border rounded-xl p-8 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 group">
                            <div className="w-10 h-10 bg-accent rounded-lg text-white flex items-center justify-center mb-6 border border-transparent group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">العلاقات الشخصية</h3>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-6">حدد طرق التواصل الفعالة مع أقربائك وأصدقائك عبر تقديم توصيات مبنية على خريطة علاقاتك وتحليلاتنا المتقدمة.</p>
                            <Link href="/test-library" className="text-sm font-bold text-primary flex items-center gap-1 hover:text-accent transition-colors w-fit">
                                <span>اكتشف المزيد</span>
                                <ArrowLeft className="w-4 h-4 mr-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-primary dark:bg-slate-900 text-white relative overflow-hidden border-t dark:border-slate-800" dir="rtl">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight dark:text-slate-100">هل أنت مستعد لفهم نفسك بشكل أفضل؟</h2>
                    <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                        انضم إلى الآلاف من الذين اكتشفوا شخصياتهم الحقيقية وبدأوا رحلة التطور الشخصي عبر تحليلات الذكاء الاصطناعي معنا.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link href="/test" className="w-full sm:w-auto text-base font-bold bg-accent text-white px-8 py-4 px-8 rounded-full hover:-translate-y-0.5 transition-transform flex items-center justify-center shadow-lg hover:shadow-accent/20">
                            ابدأ ألاختبار مجانا
                        </Link>

                    </div>
                    <p className="mt-8 text-sm text-white/50 font-bold">لست بحاجة لبطاقة ائتمانية للبدء. خصوصيتك موضع اهتمامنا.</p>
                </div>
            </section>
        </>
    )
}
