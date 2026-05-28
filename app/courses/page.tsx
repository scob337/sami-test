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

import { HeroSection } from '@/components/layout/hero-section'

export default function CoursesPage() {
  const { data: courses, isLoading } = useSWR<Course[]>('/api/courses', fetcher)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20" dir="rtl">
      <HeroSection 
        title="الدورات التدريبية"
        description="استمتع بمحتوى تعليمي متميز تم إعداده خصيصاً لك لتطوير مهاراتك وفهم ذاتك بشكل أعمق."
        badge="تعلم وتطور"
      />
      
      <Section className="pt-0">
        <Container>

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
                    className="group flex flex-col bg-card/60 backdrop-blur-xl rounded-[32px] overflow-hidden border border-white/10 hover:border-primary/40 hover:bg-card/80 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.3)] shadow-xl shadow-black/20"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden p-3">
                      <div className="w-full h-full rounded-[24px] overflow-hidden relative shadow-inner">
                        <img 
                          src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A3B]/90 via-[#0A1A3B]/40 to-transparent"></div>
                        
                        {/* Status/Badge */}
                        <div className="absolute top-4 right-4 flex gap-2">
                           <span className="bg-background/80 backdrop-blur-md text-foreground text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10 shadow-sm flex items-center gap-1.5">
                             <Play className="w-3 h-3 text-primary" />
                             دورة مسجلة
                           </span>
                        </div>

                        {/* Interactive Play Button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 ease-out">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-6 pt-2">
                      <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary" />
                          {course._count?.episodes || 0} حلقة
                        </span>
                        <span className="w-1 h-1 bg-border rounded-full" />
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-500" />
                          {course._count?.enrollments || 0} مشترك
                        </span>
                      </div>

                      <h3 className="text-xl md:text-2xl font-black mb-3 text-foreground group-hover:text-primary transition-colors duration-300 leading-snug">
                        {course.title}
                      </h3>
                      
                      <p className="text-muted-foreground/80 text-sm font-medium mb-6 line-clamp-2 leading-relaxed flex-1">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-0.5">استثمر</span>
                          <span className="text-2xl font-black text-foreground">
                            {course.price > 0 ? (
                              <div className="flex items-baseline gap-1">
                                {course.price} <span className="text-sm font-bold text-primary">ر.س</span>
                              </div>
                            ) : (
                              <span className="text-emerald-400">مجانًا</span>
                            )}
                          </span>
                        </div>
                        <Button variant="ghost" className="rounded-2xl h-12 w-12 p-0 bg-primary/10 hover:bg-primary group-hover:bg-primary text-primary group-hover:text-white transition-all overflow-hidden border border-primary/20">
                           <Play className="w-5 h-5 fill-current ml-1" />
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
