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
    <Section size="lg" className="min-h-[80vh] flex items-center justify-center">
      <Container size="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold mb-4">
              M
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {children}
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {footerText}{' '}
            <Link
              href={footerLink.href}
              className="text-primary hover:underline font-medium"
            >
              {footerLink.text}
            </Link>
          </p>
        </motion.div>
      </Container>
    </Section>
  )
}
