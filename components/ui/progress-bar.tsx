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
  const percentage = Math.min((value / max) * 100, 100)

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-red-500',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full rounded-full transition-all', variantClasses[variant])}
        />
      </div>
      {showLabel && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            السؤال {value} من {max}
          </span>
          <span className="font-semibold text-primary">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  )
}
