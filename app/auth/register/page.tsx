'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/store/auth-store'
import { cn } from '@/lib/utils'
import { Header as Navbar } from '@/components/layout/header'

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

  const { setUser } = useAuthStore()

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'فشل التسجيل')
      }

      setUser(result.user)
      toast.success('تم التسجيل بنجاح!')

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء التسجيل')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans" dir="rtl">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-8">إنشاء حساب جديد</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-right block">الاسم الكامل</label>
              <Input
                placeholder="أدخل اسمك بالكامل"
                {...register('fullName')}
                disabled={isLoading}
                className="h-11 border-slate-200 dark:border-slate-700 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-sm placeholder:text-slate-400 dark:bg-slate-950 dark:text-slate-200 text-right"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1 text-right">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">البريد الإلكتروني</label>
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  {...register('email')}
                  disabled={isLoading}
                  className="h-11 border-slate-200 dark:border-slate-700 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-sm placeholder:text-slate-400 dark:bg-slate-950 dark:text-slate-200 text-right"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">رقم الهاتف</label>
                <Input
                  type="tel"
                  placeholder="رقم الهاتف"
                  {...register('phone')}
                  disabled={isLoading}
                  className="h-11 border-slate-200 dark:border-slate-700 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-sm placeholder:text-slate-400 dark:bg-slate-950 dark:text-slate-200 text-right"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">كلمة المرور</label>
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  {...register('password')}
                  disabled={isLoading}
                  className="h-11 border-slate-200 dark:border-slate-700 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-sm placeholder:text-slate-400 dark:bg-slate-950 dark:text-slate-200 text-right"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">تأكيد كلمة المرور</label>
                <Input
                  type="password"
                  placeholder="تأكيد كلمة المرور"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                  className="h-11 border-slate-200 dark:border-slate-700 rounded-md focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-sm placeholder:text-slate-400 dark:bg-slate-950 dark:text-slate-200 text-right"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-11 mt-4 font-bold text-sm tracking-wide rounded-md transition-all",
                isLoading 
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-[0.98]"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>جاري إنشاء الحساب...</span>
                </div>
              ) : (
                'إنشاء حساب'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400 font-bold">
              لديك حساب بالفعل؟{' '}
              <a href="/auth/login" className="text-blue-600 hover:underline">
                سجل دخولك
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
