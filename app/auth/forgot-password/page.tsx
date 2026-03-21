'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Header as Navbar } from '@/components/layout/header'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, Mail, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const supabase = createClient()

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setIsSent(true)
      toast.success('تم إرسال رابط استعادة كلمة المرور')
    } catch (error: any) {
      console.error('Reset request error:', error)
      toast.error(error.message || 'فشل إرسال الطلب')
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
          <Link 
            href="/auth/login" 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-bold mb-8 group w-fit"
          >
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            العودة لتسجيل الدخول
          </Link>

          {!isSent ? (
            <>
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-3">نسيت كلمة المرور؟</h1>
                <p className="text-slate-400 font-medium px-4">أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لاستعادة حسابك بأمان.</p>
              </div>

              <form onSubmit={handleResetRequest} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-300 mr-2 uppercase tracking-widest">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      <span>جاري المعالجة...</span>
                    </div>
                  ) : (
                    'إرسال رابط الاستعادة'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-4">تفقد بريدك الإلكتروني</h2>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                لقد أرسلنا رابطاً خاصاً إلى <span className="text-blue-400">{email}</span>. 
                يرجى الضغط على الرابط في الرسالة لتعيين كلمة مرور جديدة.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSent(false)}
                className="w-full h-14 border-white/10 text-white hover:bg-white/5 rounded-2xl font-bold transition-all"
              >
                لم تصلك الرسالة؟ أعد المحاولة
              </Button>
            </div>
          )}

          <div className="mt-10 text-center border-t border-white/5 pt-8">
            <p className="text-slate-500 font-bold text-sm">
              تواجه مشكلة؟ <a href="mailto:support@samitest.com" className="text-blue-400 hover:underline">اتصل بالدعم الفني</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
