'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { AuthForm } from '@/components/auth/auth-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/lib/store/auth-store'

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

  const { setUser, user } = useAuthStore()

  // If already logged in on client, redirect to dashboard
  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

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
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col md:flex-row font-sans" dir="ltr">
      {/* Left Column: Form */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex flex-col items-center justify-center p-8 lg:p-12 xl:p-20 relative">
        <div className="w-full max-w-[440px] space-y-6 text-center">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-[32px] font-bold text-[#1a1a1a] dark:text-slate-100 flex items-center justify-center gap-2">
              <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity text-[#002f5d] dark:text-slate-100">
                Sami-Test
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">◆</span>
              </a>
            </h1>
            <p className="text-[15px] text-[#4a4a4a] dark:text-slate-400 leading-relaxed px-4">
              Access your full personality profile, communication guidance, and relationship insights to work better with anyone.
            </p>
            <p className="text-[13px] text-[#6c757d] dark:text-slate-500">
              Free to start • No credit card required
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left pt-2">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <Input
                  placeholder="First Name"
                  {...register('fullName')}
                  disabled={isLoading}
                  className="h-12 px-4 shadow-sm border-gray-300 dark:border-slate-700 rounded-[4px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-[15px] placeholder:text-gray-400 dark:bg-slate-900 dark:text-slate-200"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>
              {/* Last Name */}
              <div>
                <Input
                  placeholder="Last Name"
                  disabled={isLoading}
                  className="h-12 px-4 shadow-sm border-gray-300 dark:border-slate-700 rounded-[4px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-[15px] placeholder:text-gray-400 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register('email')}
                  disabled={isLoading}
                  className="w-full h-12 px-4 shadow-sm border-gray-300 dark:border-slate-700 rounded-[4px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-[15px] placeholder:text-gray-400 dark:bg-slate-900 dark:text-slate-200"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              {/* Phone */}
              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  {...register('phone')}
                  disabled={isLoading}
                  className="w-full h-12 px-4 shadow-sm border-gray-300 dark:border-slate-700 rounded-[4px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-[15px] placeholder:text-gray-400 dark:bg-slate-900 dark:text-slate-200"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  {...register('password')}
                  disabled={isLoading}
                  className="h-12 px-4 shadow-sm border-gray-300 dark:border-slate-700 rounded-[4px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-[15px] placeholder:text-gray-400 dark:bg-slate-900 dark:text-slate-200"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              {/* Confirm Password */}
              <div>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                  className="h-12 px-4 shadow-sm border-gray-300 dark:border-slate-700 rounded-[4px] focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-[15px] placeholder:text-gray-400 dark:bg-slate-900 dark:text-slate-200"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 py-2">
              <input type="checkbox" id="terms" className="mt-1 flex-shrink-0 w-[18px] h-[18px] text-blue-500 border-gray-300 dark:bg-slate-900 dark:border-slate-700 rounded focus:ring-blue-500" />
              <label htmlFor="terms" className="text-[14px] text-gray-700 dark:text-slate-300 leading-tight">
                I agree to Sami-Test's <a href="/terms" className="text-blue-500 dark:text-blue-400 hover:underline">Terms and Conditions</a>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 bg-[#f8f9fa] dark:bg-slate-800 hover:bg-[#e9ecef] dark:hover:bg-slate-700 text-[#a0aab2] dark:text-slate-400 hover:text-[#495057] dark:hover:text-slate-200 font-bold text-[13px] tracking-wide rounded-[4px] border border-transparent uppercase transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>SIGNING UP...</span>
                </div>
              ) : (
                'SIGN UP'
              )}
            </Button>
          </form>

          <hr className="border-gray-200 dark:border-slate-800" />

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-[46px] border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 uppercase text-[13px] font-bold tracking-wide rounded-[4px] flex items-center justify-center gap-3 relative"
              disabled={isLoading}
              type="button"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[18px] h-[18px] absolute left-4" />
              SIGN UP WITH GOOGLE
            </Button>

            <Button
              variant="outline"
              className="w-full h-[46px] border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 uppercase text-[13px] font-bold tracking-wide rounded-[4px] flex items-center justify-center gap-3 relative"
              disabled={isLoading}
              type="button"
            >
              <svg className="w-[18px] h-[18px] absolute left-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.834 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.559 8.179-6.086 8.179-11.384 0-6.627-5.373-12-12-12z" />
              </svg>
              SIGN UP WITH GITHUB
            </Button>
          </div>

          <div className="mt-8 text-center pb-8">
            <a
              href="/auth/login"
              className="text-[15px] font-medium text-blue-500 dark:text-blue-400 hover:underline"
            >
              Already have an account? Log in instead
            </a>
          </div>

        </div>
      </div>

      {/* Right Column: Visual Mockup */}
      <div className="hidden md:flex flex-1 bg-[#f8f8f8] dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 items-center justify-center p-12 overflow-hidden relative min-h-[900px]">
        {/* Background pattern or subtle gradient can go here if needed */}

        <div className="w-full max-w-[550px] flex flex-col items-center">
          {/* Avatars Row */}
          <div className="flex items-center justify-center gap-6 mb-8 relative z-10 w-full px-12">
            {/* Avatar 1 */}
            <div className="w-16 h-16 rounded-full border-2 border-transparent relative overflow-hidden flex-shrink-0 grayscale opacity-80 shadow-md">
              <div className="w-full h-full bg-slate-300"></div>
              <img src="https://i.imgur.com/8KgR4Ie.jpeg" className="w-full h-full object-cover" alt="avatar" />
            </div>

            {/* Center Avatar (Active) */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-[3px] border-blue-500 p-1 flex-shrink-0 relative z-20 bg-white dark:bg-slate-800 shadow-lg mx-2" style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <img src="https://i.imgur.com/7w2hZpT.jpeg" className="w-full h-full object-cover grayscale-[20%]" alt="Irene Mitchell" />
                </div>
              </div>
              {/* Icon Below Center Avatar */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500 border border-blue-500 rounded-full flex items-center justify-center z-30 shadow-sm text-white text-xs">
                ◆
              </div>
              {/* Decorative connecting dots */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                <div className="w-6 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
              </div>
            </div>

            {/* Avatar 3 */}
            <div className="w-16 h-16 rounded-full border-2 border-transparent relative overflow-hidden flex-shrink-0 grayscale opacity-80 shadow-md">
              <div className="w-full h-full bg-slate-300 dark:bg-slate-700"></div>
              <img src="https://i.imgur.com/GjZwvBw.jpeg" className="w-full h-full object-cover" alt="avatar" />
            </div>

            {/* Avatar 4 */}
            <div className="w-16 h-16 rounded-full border-2 border-transparent relative overflow-hidden flex-shrink-0 grayscale opacity-80 shadow-md hidden lg:block">
              <div className="w-full h-full bg-slate-300 dark:bg-slate-700"></div>
              <img src="https://i.imgur.com/yFjPZ6W.jpeg" className="w-full h-full object-cover" alt="avatar" />
            </div>
          </div>

          {/* Profile Card Mockup */}
          <div className="w-full bg-white dark:bg-slate-800 rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-slate-700 p-8 text-left mt-8 z-20">

            <div className="flex items-end gap-3 mb-4 border-b border-gray-50 dark:border-slate-700 pb-4">
              <h2 className="text-[24px] font-bold text-[#1a1a1a] dark:text-slate-100">Irene Mitchell</h2>
              <span className="text-[15px] text-[#6c757d] dark:text-slate-400 mb-1">VP of Sales</span>
            </div>

            {/* Traits */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-3 py-1.5 border border-blue-500 text-white text-[13px] rounded-sm bg-blue-500">Enthusiastic</span>
              <span className="px-3 py-1.5 border border-blue-500 text-white text-[13px] rounded-sm bg-blue-500">Big picture thinker</span>
              <span className="px-3 py-1.5 border border-blue-500 text-white text-[13px] rounded-sm bg-blue-500">People-oriented</span>
            </div>

            {/* How to Meet */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  📅
                </div>
                <h3 className="text-[16px] font-medium text-gray-800 dark:text-slate-200">How to Meet</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Do Box */}
                <div className="bg-[#f8fcfa] dark:bg-emerald-950/20 border border-[#e0f1e8] dark:border-emerald-900/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-[#0b8245] dark:text-emerald-400 font-semibold mb-2 text-[14px]">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Do
                  </div>
                  <p className="text-[14px] text-gray-700 dark:text-slate-300 leading-snug">Begin with wins and positive energy</p>
                </div>

                {/* Don't Box */}
                <div className="bg-[#fef8f8] dark:bg-rose-950/20 border border-[#fae5e5] dark:border-rose-900/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-[#cc1616] dark:text-rose-400 font-semibold mb-2 text-[14px]">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Don't
                  </div>
                  <p className="text-[14px] text-gray-700 dark:text-slate-300 leading-snug">Start with problems or criticisms</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
