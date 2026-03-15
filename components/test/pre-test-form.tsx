'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone, ShieldCheck, ArrowRight, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot, 
} from '@/components/ui/input-otp'

interface PreTestFormProps {
  onComplete: (userData: any) => void
  onBack?: () => void
}

export function PreTestForm({ onComplete, onBack }: PreTestFormProps) {
  const [step, setStep] = useState<'info' | 'otp'>('info')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
  })
  const [otp, setOtp] = useState('')
  const [timeLeft, setTimeLeft] = useState(291) // 4:51

  useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [step, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.emailOrPhone) {
      toast.error('يرجى ملء جميع البيانات')
      return
    }
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setStep('otp')
      toast.success('تم إرسال رمز التحقق بنجاح')
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الرمز')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) {
      toast.error('يرجى إدخال رمز التحقق كاملاً')
      return
    }
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      toast.success('تم التحقق بنجاح!')
      onComplete({ ...formData, verified: true })
    } catch (error) {
      toast.error('رمز التحقق غير صحيح')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 min-h-[500px] flex flex-col pt-8" dir="rtl">
      
      {/* Top Bar with Back Button */}
      <div className="flex justify-end mb-8 px-4">
        <button 
          onClick={() => step === 'otp' ? setStep('info') : (onBack && onBack())}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer"
        >
          <span className="font-medium text-sm">رجوع</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 'info' ? (
          <motion.div
            key="info-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col items-center w-full px-6 md:px-8"
          >
            <div className="text-center space-y-2 mb-10">
              <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]">التسجيل</h1>
              <p className="text-slate-500 text-sm md:text-base">أدخل بياناتك للبدء في الاختبار</p>
            </div>

            <form onSubmit={handleSendOtp} className="w-full space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a] block text-right">الاسم</label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="أدخل اسمك الكامل"
                    className="w-full h-12 md:h-14 px-4 pl-12 rounded-xl border border-slate-200 outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] transition-all bg-white"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0f172a] block text-right">رقم الجوال أو البريد الإلكتروني</label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="05xxxxxxx أو email@example.com"
                    className="w-full h-12 md:h-14 px-4 pl-12 rounded-xl border border-slate-200 outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] transition-all bg-white"
                    value={formData.emailOrPhone}
                    onChange={(e) => setFormData({...formData, emailOrPhone: e.target.value})}
                    dir="auto"
                  />
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-12 md:h-14 mt-4 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'إرسال رمز التحقق'
                )}
              </button>

            </form>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col items-center w-full px-6 md:px-8"
          >
            <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-[#1A56DB]" />
            </div>

            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]">التحقق من الهوية</h1>
              <p className="text-slate-500 text-sm md:text-base" dir="rtl">
                تم إرسال رمز التحقق إلى <span className="dir-ltr inline-block">{formData.emailOrPhone || '966508865634'}</span>
              </p>
            </div>

            <div className="w-full bg-[#f8fafc] border border-slate-100 rounded-lg p-3 flex items-center justify-center gap-2 mb-8">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-600">للتجربة: استخدم الرمز <span className="font-bold text-[#1A56DB]">123456</span></span>
            </div>

            <form onSubmit={handleVerifyOtp} className="w-full flex flex-col items-center space-y-8">
              
              <div className="dir-ltr w-full flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} className="gap-2 md:gap-3">
                  <InputOTPGroup className="gap-2 md:gap-3 flex justify-center w-full">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot 
                        key={i} 
                        index={i} 
                        className="w-10 h-12 md:w-12 md:h-14 text-xl md:text-2xl font-bold rounded-xl border border-slate-200 bg-white focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-slate-500 text-sm font-medium">
                ينتهي خلال {formatTime(timeLeft)}
              </div>

              <button 
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full h-12 md:h-14 bg-[#1A56DB] hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'تأكيد'
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
