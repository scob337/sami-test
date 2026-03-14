import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  showLabel?: boolean
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

export function ProgressBar({
  value,
  max,
  className,
  showLabel = true,
  variant = 'default',
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min((value / max) * 100, 100))

  const variantClasses = {
    default: 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]',
    success: 'bg-accent shadow-[0_0_15px_rgba(var(--accent),0.5)]',
    warning: 'bg-primary/80 shadow-[0_0_15px_rgba(var(--primary),0.4)]',
    destructive: 'bg-destructive shadow-[0_0_15px_rgba(var(--destructive),0.5)]',
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="relative h-4 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/50 backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn('h-full rounded-full relative z-10', variantClasses[variant])}
        >
          {/* Animated Shine Effect */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
          />
        </motion.div>
      </div>
      {showLabel && (
        <div className="flex items-center justify-between text-base font-black tracking-tight">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-foreground">{value}</span>
            <span className="opacity-40">/</span>
            <span>{max}</span>
            <span className="mr-2 text-sm font-bold uppercase tracking-widest opacity-60">التقدم</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-2xl', variant === 'default' ? 'text-primary' : '')}>
              {percentage.toFixed(0)}
            </span>
            <span className="text-sm opacity-60">%</span>
          </div>
        </div>
      )}
    </div>
  )
}
