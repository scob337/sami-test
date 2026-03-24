'use client'

import { useState } from 'react'
import { User, Phone, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface PreTestFormProps {
  onComplete: (userData: any) => void
  onBack?: () => void
}

export function PreTestForm({ onComplete, onBack }: PreTestFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
  })

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
      toast.success('تم التسجيل بنجاح')
      onComplete({ ...formData, verified: true })
    } catch (error) {
      toast.error('حدث خطأ أثناء التسجيل')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-50 min-h-[500px] flex flex-col pt-8" dir="rtl">
      
      {/* Top Bar with Back Button */}
      <div className="flex justify-end mb-8 px-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer"
          >
            <span className="font-medium text-sm">رجوع</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center w-full px-6 md:px-8">
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
              'ابدأ الاختبار الآن'
            )}
          </button>

        </form>
      </div>
    </div>
  )
}
