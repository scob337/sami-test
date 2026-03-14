'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { AuthForm } from '@/components/auth/auth-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true)

      // TODO: Implement Supabase registration
      console.log('Registration data:', data)

      toast.success('تم التسجيل بنجاح! يرجى تأكيد رقم الهاتف')
      router.push('/auth/otp')
    } catch (error) {
      toast.error('حدث خطأ أثناء التسجيل')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthForm
      title="إنشاء حساب"
      subtitle="انضم إلى آلاف المستخدمين واكتشف شخصيتك"
      footerText="هل لديك حساب بالفعل؟"
      footerLink={{ text: 'دخول', href: '/auth/login' }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">الاسم الكامل</label>
          <Input
            placeholder="أحمد محمد"
            {...register('fullName')}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1 font-bold">{errors.fullName.message}</p>
          )}
        </div>

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

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">رقم الهاتف</label>
          <Input
            placeholder="+966 55 000 0000"
            {...register('phone')}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 font-bold">{errors.phone.message}</p>
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">تأكيد كلمة المرور</label>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1 font-bold">{errors.confirmPassword.message}</p>
          )}
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
              <span>جاري التسجيل...</span>
            </div>
          ) : (
            'إنشاء حساب'
          )}
        </Button>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          بالتسجيل، أنت توافق على{' '}
          <a href="/terms" className="text-primary hover:underline">
            الشروط والأحكام
          </a>
        </p>
      </form>
    </AuthForm>
  )
}
