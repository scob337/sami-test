'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('رابط غير صالح. يرجى طلب رابط جديد.')
    }
  }, [token])

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('الرابط غير صالح')
      return
    }

    if (password.length < 6) {
      toast.error('يجب أن تكون كلمة المرور 6 أحرف على الأقل')
      return
    }

    if (password !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة')
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل تحديث كلمة المرور')

      setIsSuccess(true)
      toast.success('تم تحديث كلمة المرور بنجاح')
      
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error: any) {
      console.error('Password reset error:', error)
      toast.error(error.message || 'فشل تحديث كلمة المرور')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1A3B] flex flex-col font-sans selection:bg-blue-500/30" dir="rtl">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="w-full max-w-[480px] bg-white dark:bg-[#112240]/80 backdrop-blur-xl rounded-[32px] border border-white/5 shadow-2xl p-10 relative z-10 transition-all">
          
          {error ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-4">رابط غير صالح</h2>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">{error}</p>
              <Button
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full h-14 bg-white/5 text-white hover:bg-white/10 rounded-2xl font-bold transition-all border border-white/10"
              >
                طلب رابط جديد
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-4">تم التغيير بنجاح!</h2>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                تم تحديث كلمة المرور الخاصة بك بنجاح. سنقوم بتحويلك إلى صفحة تسجيل الدخول خلال لحظات.
              </p>
              <div className="flex justify-center">
                <LoadingSpinner size="sm" className="text-blue-500" />
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-3">تحديث كلمة المرور</h1>
                <p className="text-slate-400 font-medium px-4">أدخل كلمة المرور الجديدة التي ترغب في استخدامها لحسابك.</p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-300 mr-2 uppercase tracking-widest">كلمة المرور الجديدة</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-slate-500 text-lg font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-300 mr-2 uppercase tracking-widest">تأكيد كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder:text-slate-500 text-lg font-bold transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <LoadingSpinner size="sm" className="text-white" />
                      <span>جاري التحديث...</span>
                    </div>
                  ) : (
                    'تحديث كلمة المرور'
                  )}
                </Button>
              </form>
            </>
          )}

          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <p className="text-slate-500 font-bold text-sm">
              SAMI Test &copy; {new Date().getFullYear()} - جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
