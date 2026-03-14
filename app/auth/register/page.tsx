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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-sm font-medium mb-2 block">الاسم الكامل</label>
          <Input
            placeholder="أحمد محمد"
            {...register('fullName')}
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium mb-2 block">البريد الإلكتروني</label>
          <Input
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium mb-2 block">رقم الهاتف</label>
          <Input
            placeholder="+966 55 000 0000"
            {...register('phone')}
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium mb-2 block">كلمة المرور</label>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm font-medium mb-2 block">تأكيد كلمة المرور</label>
          <Input
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 h-10"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              جاري التسجيل...
            </div>
          ) : (
            'تسجيل'
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
