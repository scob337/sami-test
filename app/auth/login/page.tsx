'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/store/auth-store'
import { cn } from '@/lib/utils'
import { Header as Navbar } from '@/components/layout/header'

import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const { setUser } = useAuthStore()

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'فشل تسجيل الدخول')
      }

      setUser(result.user)
      toast.success('مرحباً بك مجدداً!')

      setTimeout(() => {
        if (callbackUrl) {
          router.push(callbackUrl)
        } else if (result.user.isAdmin) {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }, 500)
    } catch (error: any) {
      toast.error(error.message || 'بيانات الدخول غير صحيحة')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1A3B] flex flex-col font-sans selection:bg-blue-500/30" dir="rtl">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-[480px] bg-[#112240]/80 backdrop-blur-xl rounded-[32px] border border-white/5 shadow-2xl p-10 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">تسجيل الدخول</h1>
            <p className="text-slate-400 font-medium italic">يسعدنا رؤيتك مجدداً في Sami-Test</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-300 mr-2 uppercase tracking-widest">اسم المستخدم / رقم الهاتف</label>
              <Input
                type="text"
                placeholder="أدخل بريدك أو رقم جوالك"
                {...register('identifier')}
                disabled={isLoading}
                className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-slate-500 text-lg font-bold transition-all"
              />
              {errors.identifier && (
                <p className="text-red-400 text-xs mt-1 font-bold">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-300 mr-2 uppercase tracking-widest">كلمة المرور الشخصية</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-slate-500 text-lg font-bold transition-all"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 font-bold">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-16 mt-6 font-black text-lg rounded-2xl transition-all shadow-xl",
                isLoading 
                  ? "bg-slate-700 text-white/50 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/20 active:scale-[0.98]"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <LoadingSpinner size="sm" className="text-white" />
                  <span>جاري التحقق...</span>
                </div>
              ) : (
                'دخول آمن'
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 font-bold">
              ليس لديك حساب بعد؟{' '}
              <a 
                href={`/auth/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} 
                className="text-blue-400 hover:text-blue-300 underline underline-offset-8 transition-colors"
              >
                اشترك الآن مجاناً
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
