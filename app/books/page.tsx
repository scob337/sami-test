'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Download } from 'lucide-react'

const books = [
  {
    id: '1',
    title: 'فهم شخصيتك: دليل الاستشاريين',
    author: 'د. محمود أحمد',
    description: 'دليل شامل لفهم نوع الشخصية INFJ والاستفادة من نقاط قوتك',
    personality: 'INFJ',
    pages: 250,
    url: '#',
  },
  {
    id: '2',
    title: 'رحلة المثاليين',
    author: 'فاطمة السعيد',
    description: 'استكشف عالم الشخصيات المثالية (INFP) والنمو الشخصي',
    personality: 'INFP',
    pages: 220,
    url: '#',
  },
  {
    id: '3',
    title: 'الاستراتيجيون والقيادة',
    author: 'أحمد البراهيم',
    description: 'تطوير مهارات القيادة للشخصيات الاستراتيجية (INTJ)',
    personality: 'INTJ',
    pages: 280,
    url: '#',
  },
  {
    id: '4',
    title: 'حماة العالم',
    author: 'سارة محمد',
    description: 'كيفية الاستفادة من قدرات الحماة (ISFJ) في حياتك',
    personality: 'ISFJ',
    pages: 190,
    url: '#',
  },
]

export default function BooksPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Section size="lg">
        <Container>
          <div className="space-y-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold">
                مكتبة الشخصيات
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                اكتشف مجموعة من الكتب المتخصصة المخصصة لشخصيتك
              </p>
            </motion.div>

            {/* Books Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full p-6 flex flex-col hover:border-primary/40 transition-colors">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-start justify-between">
                        <BookOpen className="w-8 h-8 text-primary" />
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {book.personality}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {book.author}
                        </p>
                        <p className="text-sm leading-relaxed line-clamp-3">
                          {book.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{book.pages} صفحة</span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-6 bg-primary hover:bg-primary/90"
                      onClick={() => window.open(book.url, '_blank')}
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل الكتاب
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center"
            >
              <h2 className="text-2xl font-bold mb-4">
                هل تريد المزيد من الموارد؟
              </h2>
              <p className="text-muted-foreground mb-6">
                انضم إلى العضوية المميزة للوصول إلى جميع الكتب والموارد التعليمية
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                ترقية إلى Premium
              </Button>
            </motion.div>
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}
