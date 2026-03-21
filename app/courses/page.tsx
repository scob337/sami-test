'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { motion } from 'framer-motion'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Play, Star, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Course {
  id: number
  title: string
  slug: string
  description: string
  price: number
  image: string
  _count?: {
    episodes: number
    enrollments: number
  }
}

export default function CoursesPage() {
  const { data: courses, isLoading } = useSWR<Course[]>('/api/courses', fetcher)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1A3B]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A1A3B] text-white pt-24 pb-20" dir="rtl">
      <Section>
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
            <div className="text-center md:text-right">
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">الدورات التدريبية</h1>
              <p className="text-blue-100/70 text-lg font-medium">استمتع بمحتوى تعليمي متميز تم إعداده خصيصاً لك.</p>
            </div>
          </div>

          {!courses?.length ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-bold mb-4">لا توجد كورسات متاحة حالياً</h3>
              <p className="text-slate-400">سنقوم بإضافة محتوى جديد قريباً، ابقَ على اطلاع!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {courses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={`/courses/${course.slug || course.id}`}
                    className="group block bg-slate-50 dark:bg-[#112240] rounded-[2rem] overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-900/20"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#112240] via-transparent to-transparent opacity-60"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/40">
                          <Play className="w-8 h-8 text-white fill-white mr-1" />
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center gap-4 text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">
                        <span className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                          <Clock className="w-3 h-3" />
                          {course._count?.episodes || 0} حلقة
                        </span>
                        <span className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400">
                          <Users className="w-3 h-3" />
                          {course._count?.enrollments || 0} مشترك
                        </span>
                      </div>

                      <h3 className="text-2xl font-black mb-3 group-hover:text-blue-400 transition-colors leading-tight">
                        {course.title}
                      </h3>
                      
                      <p className="text-slate-400 text-sm font-medium mb-8 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <span className="text-2xl font-black text-white">
                          {course.price > 0 ? `${course.price} ر.س` : 'مجاناً'}
                        </span>
                        <Button className="rounded-xl px-6 bg-blue-600 hover:bg-blue-500 font-bold">
                          ابدأ الآن
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </main>
  )
}
