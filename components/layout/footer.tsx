'use client'

import { Mail, Phone, MapPin, Zap, Heart } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-[rgba(255,250,243,0.9)] backdrop-blur-xl border-t border-border pt-16 pb-12 overflow-hidden w-full">
      <div className="container relative z-10 max-w-7xl mx-auto px-6">

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-6">
            <Link href="https://twitter.com/7types_app" className="text-muted-foreground/60 hover:text-primary transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground/60 hover:text-primary transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex items-center gap-3 bg-secondary/30 px-5 py-2.5 rounded-full border border-border/50">
              <img src="/Logo.png" alt="7Types" className="w-7 h-7 object-contain" />
              <p className="text-foreground font-black text-sm tracking-tight">
                {currentYear} 7Types Online
              </p>
            </div>
            <div className="flex gap-10 text-muted-foreground/80 text-sm font-black">
              <Link href="/privacy" className="hover:text-primary transition-all">سياسة الخصوصية</Link>
              <Link href="/terms" className="hover:text-primary transition-all">شروط الخدمة</Link>
            </div>
          </div>
        </div>

        {/* Promotional Bar - Premium Redesign in Arabic */}
        <div className="mt-16 pt-12 border-t border-border/50 flex items-center justify-center">
          <motion.a
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            href="https://abdo-front-end.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-4 rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-sm px-10 py-5 text-sm font-black transition-all shadow-2xl hover:shadow-primary/20 hover:border-primary/50 overflow-hidden"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="flex items-center gap-3">
              <span className="relative text-foreground/70 group-hover:text-foreground transition-colors">صُنع بـ</span>
              <div className="relative">
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
                <motion.div 
                   animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className="absolute inset-0 bg-rose-500 rounded-full blur-md"
                />
              </div>
              <span className="relative text-foreground/70 group-hover:text-foreground transition-colors">بواسطة</span>
            </div>
            
            <span className="h-4 w-px bg-border/50" />
            
            <span className="relative bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-base font-black tracking-wide">
              عبد التواب شعبان
            </span>
          
          </motion.a>
        </div>
      </div>
    </footer>
  )
}
