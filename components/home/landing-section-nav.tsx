'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'start', label: 'البداية' },
  { id: 'why', label: 'لماذا؟' },
  { id: 'how', label: 'كيف تبدأ؟' },
  { id: 'offer', label: 'الكتاب' },
  { id: 'plans', label: 'الباقات' },
  { id: 'faq', label: 'أسئلة' },
] as const

/** تنقل داخلي بأسفل صفحة الهبوط — روابط anchor فقط بدون Next Link */
export function LandingSectionNav() {
  const [active, setActive] = useState<string>('start')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <nav
      className="sticky bottom-0 z-40 border-t border-border bg-[rgba(255,250,243,0.95)] backdrop-blur-xl shadow-[0_-8px_30px_rgba(32,22,13,0.08)]"
      aria-label="تصفح أقسام الصفحة"
    >
      <div className="container max-w-6xl mx-auto px-3 py-3">
        <p className="text-center text-[11px] font-black text-muted-foreground mb-2 hidden sm:block">
          تصفّح أقسام الصفحة
        </p>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 snap-x snap-mandatory">
          {SECTIONS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                'snap-center shrink-0 px-4 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap',
                active === id
                  ? 'bg-gradient-to-br from-primary to-accent text-[#1b1207] shadow-md'
                  : 'bg-card border border-border text-foreground hover:bg-secondary'
              )}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
