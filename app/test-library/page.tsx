'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { BookMarked, ArrowDown, ArrowUpLeft } from 'lucide-react'
import Link from 'next/link'

interface Test {
  id: number
  name: string
  isActive: boolean
}

interface Book {
  id: number
  title: string
  description: string
  tests: Test[]
}

const colors = [
  'purple', 'emerald', 'blue', 'amber', 'rose', 'cyan', 'indigo', 'orange'
];

export default function TestLibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLibrary() {
      try {
        const res = await fetch('/api/test-library')
        if (!res.ok) throw new Error('Failed to fetch library')
        const data = await res.json()
        setBooks(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchLibrary()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col relative bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <Header />

      {/* Hero Section (from HTML) */}
      <section className="pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden relative border-b border-slate-100 dark:border-slate-800" dir="rtl">
          <div className="absolute inset-x-0 top-0 h-[30rem] bg-gradient-to-b from-blue-50/40 dark:from-blue-900/10 via-purple-50/20 dark:via-purple-900/5 to-transparent -z-10"></div>
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:2rem_2rem] -z-10"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-accent/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800/50 rounded-full px-3 py-1 mb-8 shadow-sm">
                  <BookMarked className="text-white w-4 h-4" />
                  <span className="text-sm text-white font-bold">دليل الاختبارات</span>
              </div>

              {/* Headlines */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                  مكتبة الاختبارات الشخصية.
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                  استكشف الدليل الشامل لاختبارات تحليل الشخصية. افهم كيف يوجه الأشخاص المختلفون طاقتهم، ويعالجون المعلومات، ويتخذون القرارات، وينظمون حياتهم.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <a href="#types-grid" className="w-full sm:w-auto text-base font-bold bg-accent text-white px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                       تصفح جميع النماذج
                      <ArrowDown className="text-lg w-5 h-5" />
                  </a>
              </div>
          </div>
      </section>

      {/* The Grid Section (adapted for active tests) */}
      <section id="types-grid" className="py-24 bg-slate-50/30 dark:bg-slate-900/50 flex-1" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="mb-12 flex flex-col sm:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                  <div>
                      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">الكتب والاختبارات المتاحة</h2>
                      <p className="text-base text-slate-500 dark:text-slate-400 font-medium">اختر نموذجًا أدناه لبدء الاختبار وعرض السمات الشاملة ونقاط القوة وأساليب التواصل.</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {books.map((book, idx) => {
                  const hasTests = book.tests.length && book.tests.length > 0;
                  const firstTestId = hasTests ? book.tests[0].id : null;
                  const colorMatch = colors[idx % colors.length];
                  
                  // Map color tailwind classes since dynamic concatenation sometimes fails in tailwind compile
                  const getColors = (c: string) => {
                      switch(c) {
                          case 'purple': return { bgHeader: 'bg-purple-500', textHex: 'text-purple-700', bgHex: 'bg-purple-50', borderHex: 'border-purple-100', hoverBorder: 'hover:border-purple-200', hoverShadow: 'hover:shadow-purple-900/5', hoverGroupText: 'group-hover:text-purple-600' };
                          case 'emerald': return { bgHeader: 'bg-emerald-500', textHex: 'text-emerald-700', bgHex: 'bg-emerald-50', borderHex: 'border-emerald-100', hoverBorder: 'hover:border-emerald-200', hoverShadow: 'hover:shadow-emerald-900/5', hoverGroupText: 'group-hover:text-emerald-600' };
                          case 'blue': return { bgHeader: 'bg-blue-500', textHex: 'text-blue-700', bgHex: 'bg-blue-50', borderHex: 'border-blue-100', hoverBorder: 'hover:border-blue-200', hoverShadow: 'hover:shadow-blue-900/5', hoverGroupText: 'group-hover:text-blue-600' };
                          case 'amber': return { bgHeader: 'bg-amber-500', textHex: 'text-amber-700', bgHex: 'bg-amber-50', borderHex: 'border-amber-100', hoverBorder: 'hover:border-amber-200', hoverShadow: 'hover:shadow-amber-900/5', hoverGroupText: 'group-hover:text-amber-600' };
                          case 'rose': return { bgHeader: 'bg-rose-500', textHex: 'text-rose-700', bgHex: 'bg-rose-50', borderHex: 'border-rose-100', hoverBorder: 'hover:border-rose-200', hoverShadow: 'hover:shadow-rose-900/5', hoverGroupText: 'group-hover:text-rose-600' };
                          case 'cyan': return { bgHeader: 'bg-cyan-500', textHex: 'text-cyan-700', bgHex: 'bg-cyan-50', borderHex: 'border-cyan-100', hoverBorder: 'hover:border-cyan-200', hoverShadow: 'hover:shadow-cyan-900/5', hoverGroupText: 'group-hover:text-cyan-600' };
                          case 'indigo': return { bgHeader: 'bg-indigo-500', textHex: 'text-indigo-700', bgHex: 'bg-indigo-50', borderHex: 'border-indigo-100', hoverBorder: 'hover:border-indigo-200', hoverShadow: 'hover:shadow-indigo-900/5', hoverGroupText: 'group-hover:text-indigo-600' };
                          default: return { bgHeader: 'bg-slate-500', textHex: 'text-slate-700', bgHex: 'bg-slate-50', borderHex: 'border-slate-100', hoverBorder: 'hover:border-slate-200', hoverShadow: 'hover:shadow-slate-900/5', hoverGroupText: 'group-hover:text-slate-600' };
                      }
                  }
                  
                  const activeStyle = getColors(colorMatch);

                  return (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link 
                        href={hasTests ? `/test?testId=${firstTestId}` : '#'} 
                        className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-xl ${activeStyle.hoverShadow} ${activeStyle.hoverBorder} transition-all duration-300 relative overflow-hidden flex flex-col h-full`}
                      >
                          <div className={`absolute top-0 left-0 w-full h-1 ${activeStyle.bgHeader} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                          <div className="flex items-center justify-between mb-5">
                              <span className={`text-xl font-bold tracking-tight ${activeStyle.textHex} dark:${activeStyle.textHex} ${activeStyle.bgHex} dark:bg-slate-800 border ${activeStyle.borderHex} dark:border-slate-700 px-3 py-1 rounded-lg`}>
                                 {hasTests ? 'متاح الآن' : 'قريباً'}
                              </span>
                              {hasTests && <ArrowUpLeft className={`text-slate-300 dark:text-slate-600 ${activeStyle.hoverGroupText} transition-colors w-5 h-5`} />}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{book.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6 flex-grow line-clamp-3">
                              {book.description || 'كتاب متخصص يقدم لك رؤى عميقة واختبارات متقدمة لتحليل شخصيتك وفهم أنماط سلوكك المختلفة.'}
                          </p>
                          <div className={`text-xs font-bold ${activeStyle.textHex} uppercase tracking-widest mt-auto`}>
                             {hasTests ? `${book.tests.length} اختبار (اختبارات)` : 'كتاب إرشادي'}
                          </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden" dir="rtl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">اكتشف نوع شخصيتك.</h2>
              <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                  قم بإجراء تقييمنا المجاني لمعرفة أي من الأنماط الـ 16 يصفك بشكل أفضل، وتعلم كيف تستفيد من نقاط قوتك الفريدة.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link href="/test" className="w-full sm:w-auto text-base font-bold bg-blue-600 text-white px-8 py-3.5 rounded-xl hover:bg-blue-500 transition-colors shadow-md flex justify-center">
                      ابدأ الاختبار المجاني
                  </Link>
              </div>
          </div>
      </section>

      <Footer />
    </main>
  )
}
