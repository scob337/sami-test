'use client'

import { motion } from 'framer-motion'
import { Container } from './container'
import { Section } from './section'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  title: string
  description: string
  image?: string
  className?: string
  badge?: string
}

export function HeroSection({ title, description, image, className, badge }: HeroSectionProps) {
  return (
    <Section className={cn("relative overflow-hidden pt-32 pb-20 mt-[-64px]", className)}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {badge && (
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-black mb-6"
            >
              {badge}
            </motion.span>
          )}
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight leading-[1.1]"
          >
            {title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed mb-10 max-w-2xl"
          >
            {description}
          </motion.p>

          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl"
            >
              <img src={image} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </motion.div>
          )}
        </div>
      </Container>
      
      {/* Bottom fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </Section>
  )
}
