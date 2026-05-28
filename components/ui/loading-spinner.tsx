import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-40 h-40",
    xl: "w-60 h-60",
    "2xl": "w-80 h-80"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-10", className)}>
      <motion.div
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={cn("relative flex items-center justify-center p-6", sizeClasses[size])}
      >
        {/* Animated Rings with more premium glow */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[6px] border-primary/10 border-t-primary rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-[4px] border-accent/10 border-b-accent rounded-full shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]"
        />
        
        {/* Logo Container - Enlarged and clearer */}
        <div className="relative z-10 w-full h-full p-4 flex items-center justify-center bg-background/60 backdrop-blur-md rounded-full border border-white/5 shadow-inner">
          <img 
            src="/Logo.png" 
            alt="Loading..." 
            className="w-full h-full object-contain drop-shadow-2xl brightness-110"
          />
        </div>
      </motion.div>
      
      {/* Loading Text - Premium Arabic Typography */}
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <motion.h2
            animate={{ 
              opacity: [0.7, 1, 0.7],
              textShadow: ["0 0 0px var(--primary)", "0 0 20px var(--primary)", "0 0 0px var(--primary)"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent tracking-[0.1em] px-4"
          >
            جاري التحميل
          </motion.h2>
          
          {/* Decorative dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-2 h-2 bg-primary rounded-full"
              />
            ))}
          </div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground font-bold tracking-[0.3em] uppercase"
        >
          نحن نجهز لك تجربة استثنائية
        </motion.p>
      </div>
    </div>
  )
}
