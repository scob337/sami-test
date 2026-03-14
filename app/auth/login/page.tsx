'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { AuthForm } from '@/components/auth/auth-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true)

      // TODO: Implement Supabase login
      console.log('Login data:', data)

      toast.success('تم الدخول بنجاح')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error('بيانات الدخول غير صحيحة')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthForm
      title="دخول"
      subtitle="ادخل لحسابك واكتشف شخصيتك"
      footerText="ليس لديك حساب؟"
      footerLink={{ text: 'تسجيل', href: '/auth/register' }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">البريد الإلكتروني</label>
          <Input
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 font-bold">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">كلمة المرور</label>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 font-bold">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <a
            href="/auth/forgot-password"
            className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
          >
            هل نسيت كلمة المرور؟
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span>جاري الدخول...</span>
            </div>
          ) : (
            'دخول'
          )}
        </Button>
      </form>

      {/* Social Login */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">أو</span>
        </div>
      </div>

      <Button variant="outline" className="w-full h-10" disabled={isLoading}>
        <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.834 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.559 8.179-6.086 8.179-11.384 0-6.627-5.373-12-12-12z" />
        </svg>
        GitHub
      </Button>
    </AuthForm>
  )
}
