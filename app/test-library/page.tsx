'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { BookOpen, Play, ChevronRight, Book as BookIcon, Target } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col relative bg-background text-foreground overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <Header />

      <Section className="flex-1 py-32 relative z-10">
        <Container>
          <div className="space-y-16">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm tracking-widest uppercase">
                مكتبة الاختبارات
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                اختر رحلتك{' '}
                <span className="primary-gradient bg-clip-text text-transparent italic">
                  المعرفية
                </span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                استعرض مجموعتنا المختارة من الكتب والاختبارات النفسية والمهنية المصممة لمساعدتك على فهم ذاتك وتحقيق أهدافك.
              </p>
            </motion.div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {books.map((book, bookIdx) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: bookIdx * 0.1 }}
                  className="group"
                >
                  <div className="bg-card h-full p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[3rem] border border-border shadow-lg overflow-hidden relative transition-all duration-300 hover:border-primary/30 hover:shadow-xl group">
                    {/* Subtle mesh background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.05),transparent)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                          <BookIcon className="w-8 h-8" />
                        </div>
                         <div className="px-3 py-1 rounded-full bg-accent border border-primary/20 text-accent-foreground font-bold text-[10px] tracking-widest uppercase">
                          {book.tests.length} اختبار متاح
                        </div>
                      </div>

                      <div className="space-y-4 flex-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground group-hover:text-primary transition-colors">
                          {book.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed font-medium line-clamp-3">
                          {book.description || 'كتاب متخصص يقدم لك رؤى عميقة واختبارات متقدمة لتحليل شخصيتك وفهم أنماط سلوكك المختلفة.'}
                        </p>
                      </div>

                      <div className="mt-12 space-y-4">
                        <div className="text-sm font-bold text-muted-foreground/60 tracking-widest uppercase mb-4 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          الاختبارات المتاحة
                        </div>
                        
                        <div className="grid gap-3">
                          {book.tests.map((test) => (
                            <Link key={test.id} href={`/test?testId=${test.id}`}>
                              <Button
                                variant="outline"
                                className="w-full h-14 sm:h-16 px-6 justify-between rounded-2xl border-border bg-secondary hover:bg-muted hover:border-primary/40 group/btn transition-all duration-300 cursor-pointer"
                              >
                                <span className="font-bold text-lg group-hover/btn:text-primary transition-colors">
                                  {test.name}
                                </span>
                                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-all duration-300">
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </div>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                          <BookOpen className="w-4 h-4" />
                          <span>يتضمن كتاب إرشادي</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  )
}
