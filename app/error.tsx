'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Captured Error:', error)
  }, [error])

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Dynamic Background Decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-destructive/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-xl w-full text-center space-y-10 p-12 bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative z-10"
      >
        <div className="space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
            className="w-28 h-28 bg-destructive/10 text-destructive rounded-[2rem] flex items-center justify-center mx-auto mb-8 ring-4 ring-destructive/5"
          >
            <AlertCircle className="w-14 h-14" />
          </motion.div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-foreground tracking-tight sm:text-5xl">
              عذراً، حدث خطأ ما
            </h1>
            <p className="text-muted-foreground font-bold text-lg max-w-md mx-auto leading-relaxed">
              واجهنا مشكلة غير متوقعة أثناء معالجة طلبك. لا تقلق، فريقنا يعمل على إصلاح الأمور.
            </p>
          </div>
        </div>

        {/* Technical details for Admins/Advanced users */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-destructive/20 to-primary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative p-6 bg-black/40 rounded-2xl border border-white/5 text-xs font-mono text-left dir-ltr overflow-auto max-h-40 scrollbar-hide">
            <div className="flex items-center gap-2 mb-2 text-destructive/80 font-bold border-b border-white/5 pb-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
              ERROR_LOG_DETAILS
            </div>
            <p className="text-destructive/70 whitespace-pre-wrap leading-relaxed">
              {error.message || "Unknown Application Error"}
              {error.digest && `\nDigest ID: ${error.digest}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
          <Button
            onClick={() => reset()}
            className="h-16 rounded-[1.25rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl gap-3 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95"
          >
            <RotateCcw className="w-6 h-6" />
            إعادة المحاولة
          </Button>
          <Link href="/" className="w-full">
            <Button
              variant="outline"
              className="w-full h-16 rounded-[1.25rem] border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-black text-xl gap-3 transition-all hover:scale-[1.03] active:scale-95"
            >
              <Home className="w-6 h-6" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-2">
          <p className="text-[11px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">
            SYSTEM STATUS: RECOVERING
          </p>
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/20 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
