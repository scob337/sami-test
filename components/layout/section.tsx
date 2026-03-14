import React from 'react'
import { cn } from '@/lib/utils'
import { Container } from './container'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  variant?: 'default' | 'muted' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  containerSize?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Section({
  children,
  variant = 'default',
  size = 'md',
  containerSize = 'lg',
  className,
  ...props
}: SectionProps) {
  const variantClasses = {
    default: 'bg-background text-foreground',
    muted: 'bg-muted/30',
    accent: 'bg-primary/5',
  }

  const sizeClasses = {
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
  }

  return (
    <section
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  )
}
