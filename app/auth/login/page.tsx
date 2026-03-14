'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { AuthForm } from '@/components/auth/auth-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/store/auth-store'

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

  const { setUser, user } = useAuthStore()

  // If already logged in on client, redirect based on role
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, router])

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
      toast.success('تم الدخول بنجاح')

      // Delay redirect slightly to show success toast
      setTimeout(() => {
        if (result.user.isAdmin) {
          router.push('/admin')
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
    <div className="min-h-screen bg-[#f6f8f9] dark:bg-slate-950 flex flex-col font-sans" dir="ltr">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Logo as Home Link */}
          <a href="/" className="text-[#002f5d] dark:text-slate-100 font-bold text-2xl tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
            Sami-Test
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">◆</span>
          </a>
        </div>
        <div className="text-sm text-gray-700 dark:text-slate-300">
          Don't have an account?{' '}
          <a href="/auth/register" className="text-[#0082c9] dark:text-blue-400 hover:underline">
            Sign up
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-16 px-4">
        {/* Login Card */}
        <div className="w-full max-w-[500px] bg-white dark:bg-slate-900 rounded-sm border border-gray-200 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-none p-0">
          <div className="p-10 pt-12 text-center">
            <h1 className="text-[32px] font-bold text-[#1a1a1a] dark:text-slate-100 mb-3">Log In</h1>
            <p className="text-[15px] text-[#4a4a4a] dark:text-slate-400 mb-8">Use your work email to log in.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
              {/* Identifier */}
              <div className="text-left">
                <Input
                  type="text"
                  placeholder="Email or Phone Number"
                  {...register('identifier')}
                  disabled={isLoading}
                  className="w-full h-12 px-4 shadow-sm border-gray-300 dark:border-slate-700 rounded-[4px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-[15px] placeholder:text-gray-400 dark:bg-slate-950 dark:text-slate-200"
                />
                {errors.identifier && (
                  <p className="text-red-500 text-sm mt-1">{errors.identifier.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="text-left">
                <Input
                  type="password"
                  placeholder="Password"
                  {...register('password')}
                  disabled={isLoading}
                  className="w-full h-12 px-4 shadow-sm border-gray-300 dark:border-slate-700 rounded-[4px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-[15px] placeholder:text-gray-400 dark:bg-slate-950 dark:text-slate-200"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#f8f9fa] dark:bg-slate-800 hover:bg-[#e9ecef] dark:hover:bg-slate-700 text-[#a0aab2] dark:text-slate-400 hover:text-[#495057] dark:hover:text-slate-200 font-bold text-[13px] tracking-wide rounded-[4px] border border-transparent uppercase transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>LOGGING IN...</span>
                  </div>
                ) : (
                  'LOG IN'
                )}
              </Button>
            </form>

            <hr className="border-gray-200 dark:border-slate-800 mb-6" />

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-[46px] border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-gray-50 dark:hover:bg-slate-800 uppercase text-[13px] font-bold tracking-wide rounded-[4px] flex items-center justify-center gap-3 relative"
                disabled={isLoading}
                type="button"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[18px] h-[18px] absolute left-4" />
                LOG IN WITH GOOGLE
              </Button>

              <Button
                variant="outline"
                className="w-full h-[46px] border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-950 hover:bg-gray-50 dark:hover:bg-slate-800 uppercase text-[13px] font-bold tracking-wide rounded-[4px] flex items-center justify-center gap-3 relative"
                disabled={isLoading}
                type="button"
              >
                <svg className="w-[18px] h-[18px] absolute left-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.834 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.559 8.179-6.086 8.179-11.384 0-6.627-5.373-12-12-12z" />
                </svg>
                LOG IN WITH GITHUB
              </Button>
            </div>

            <div className="mt-8 text-center">
              <a
                href="/auth/forgot-password"
                className="text-[14px] text-blue-500 dark:text-blue-400 hover:underline"
              >
                Forgot Password
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-[12px] text-gray-500 dark:text-slate-500 pb-8 text-center">
          © {new Date().getFullYear()} Sami-Test
        </div>
      </main>
    </div>
  )
}
