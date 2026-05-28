import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  max,
  className,
  showLabel = true,
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min((value / max) * 100, 100))

  return (
    <div className={cn('w-full flex flex-col gap-2', className)} dir="rtl">
      {showLabel && (
        <div className="flex items-center justify-between text-sm md:text-base font-bold text-muted-foreground">
          <span>
            السؤال {value} من {max}
          </span>
          <span className="text-primary">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="relative h-2.5 w-full bg-border/80 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-l from-primary to-accent"
        />
      </div>
    </div>
  )
}
