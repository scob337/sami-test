import { motion } from 'framer-motion'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Download, ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      <Section size="lg">
        <Container>
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-4 mb-12 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold">
                مكتبة الكتب
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                اكتشف مجموعة من الكتب المتخصصة لمعرفة نمط شخصيتك وتطوير ذاتك
              </p>
            </div>

            {/* Books Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {books.map((book) => (
                <Link key={book.id} href={`/books/${book.slug}`} className="group block">
                  <div className="bg-card border border-border rounded-[32px] p-3 flex flex-col h-full hover:border-primary/40 transition-all duration-500 hover:shadow-[var(--brand-shadow)] shadow-sm">
                    
                    {/* Book Cover */}
                    <div className="relative aspect-[3/4] w-full rounded-[24px] overflow-hidden shadow-inner mb-4">
                      {book.heroImage ? (
                        <img 
                          src={book.heroImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-blue-900/20 flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700 ease-in-out">
                          <BookOpen className="w-16 h-16 text-primary/40 mb-4" />
                          <span className="text-primary/60 font-black text-lg max-w-[80%] text-center leading-tight">كتاب رقمي</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-dark)]/80 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
                      
                      {/* Price Badge on Cover */}
                      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-foreground font-black px-4 py-1.5 rounded-full border border-white/10 shadow-lg text-sm">
                        {book.price > 0 ? `${book.price} ر.س` : 'مجاني'}
                      </div>
                      
                      {/* Author badge if available */}
                      {book.expertName && (
                        <div className="absolute bottom-4 right-4 bg-background/70 backdrop-blur-sm text-foreground/90 font-bold px-3 py-1 rounded-lg text-xs border border-white/10">
                          بواسطة {book.expertName}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 px-3 pb-2 text-right">
                      <h3 className="font-black text-xl md:text-2xl mb-2 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-snug">
                        {book.title}
                      </h3>
                      
                      <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed line-clamp-3 mb-6 flex-1">
                        {book.description || 'اكتشف المزيد حول هذا الكتاب المفيد لتطوير ذاتك وتحسين فهمك لشخصيتك...'}
                      </p>

                      <Button className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl h-12 font-bold transition-all border border-primary/20 group-hover:border-primary border-dashed">
                        عرض التفاصيل
                        <ArrowLeft className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0 group-hover:-translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}

              {books.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  لا توجد كتب متاحة حالياً.
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 text-center mt-16 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                هل تريد المزيد من الموارد؟
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                انضم إلى العضوية المميزة للوصول إلى جميع الكتب والموارد التعليمية
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 h-14 text-lg">
                  تسجيل حساب جديد
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
