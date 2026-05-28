'use client'

import { useState, Suspense } from 'react'
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
import { Eye, EyeOff } from 'lucide-react'

import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''
  
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30" dir="rtl">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-[480px] bg-card/95 backdrop-blur-xl rounded-[32px] border border-border/70 shadow-2xl shadow-black/10 p-10 relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-foreground tracking-tight mb-3">تسجيل الدخول</h1>
            <p className="text-muted-foreground font-medium italic">يسعدنا رؤيتك مجدداً في Sami-Test</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-foreground/85 mr-2 uppercase tracking-widest">اسم المستخدم / رقم الهاتف</label>
              <Input
                type="text"
                placeholder="أدخل بريدك أو رقم جوالك"
                {...register('identifier')}
                disabled={isLoading}
                dir="auto"
                className="h-16 sm:h-14 px-6 bg-background border-border rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground placeholder:text-muted-foreground text-xl sm:text-lg font-bold transition-all"
              />
              {errors.identifier && (
                <p className="text-destructive text-xs mt-1 font-bold">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-foreground/85 mr-2 uppercase tracking-widest">كلمة المرور الشخصية</label>
              <div className="relative group">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                  dir="ltr"
                  className="h-16 sm:h-14 px-6 bg-background border-border rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground placeholder:text-muted-foreground text-xl sm:text-lg font-bold transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1 font-bold">{errors.password.message}</p>
              )}
            </div>

              <div className="flex items-center justify-end px-2">
              {/* Forgot password removed as it is not implemented */}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-16 mt-6 font-black text-lg rounded-2xl transition-all shadow-xl",
                isLoading 
                  ? "bg-muted text-muted-foreground cursor-not-allowed" 
                  : "bg-gradient-to-r from-primary to-accent hover:brightness-110 text-primary-foreground shadow-primary/30 active:scale-[0.98]"
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
            <p className="text-muted-foreground font-bold">
              ليس لديك حساب بعد؟{' '}
              <a 
                href={`/auth/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} 
                className="text-primary hover:text-primary/80 underline underline-offset-8 transition-colors"
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
