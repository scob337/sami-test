'use client'

import { ReactNode } from 'react'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface AuthFormProps {
  children: ReactNode
  title: string
  subtitle: string
  footerText: string
  footerLink: { text: string; href: string }
}

export function AuthForm({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
}: AuthFormProps) {
  return (
    <Section size="lg" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <Container size="sm" className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div className="bg-card/40 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-border/50 shadow-2xl shadow-black/5">
            {/* Header */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-block group mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-xl shadow-primary/20 transition-transform group-hover:scale-110">
                  M
                </div>
              </Link>
              <h1 className="text-4xl font-black text-foreground tracking-tight">{title}</h1>
              <p className="text-lg font-bold text-muted-foreground mt-3 opacity-80">{subtitle}</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {children}
            </div>

            {/* Footer */}
            <p className="text-center text-base font-bold text-muted-foreground mt-10">
              {footerText}{' '}
              <Link
                href={footerLink.href}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                {footerLink.text}
              </Link>
            </p>
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
