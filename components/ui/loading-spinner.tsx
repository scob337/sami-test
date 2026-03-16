import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('relative flex items-center justify-center', sizes[size], className)}>
      {/* Outer Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-current opacity-40"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Inner Pulsing Ring */}
      <motion.div
        className="absolute inset-1 rounded-full border-2 border-transparent border-b-current opacity-70"
        animate={{ rotate: -360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Center Dot */}
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
