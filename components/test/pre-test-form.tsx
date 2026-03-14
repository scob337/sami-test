'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Phone, Mail, User, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot, 
  InputOTPSeparator 
} from '@/components/ui/input-otp'
import { AnimatePresence } from 'framer-motion'

interface PreTestFormProps {
  onComplete: (userData: any) => void
}

export function PreTestForm({ onComplete }: PreTestFormProps) {
  const [step, setStep] = useState<'info' | 'otp'>('info')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
  })
  const [otp, setOtp] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.emailOrPhone) {
      toast.error('يرجى ملء جميع البيانات')
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
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
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('تم التحقق بنجاح!')
      onComplete({ ...formData, verified: true })
    } catch (error) {
      toast.error('رمز التحقق غير صحيح')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="bg-card/40 backdrop-blur-2xl border-2 border-border/50 shadow-2xl shadow-black/5 overflow-hidden rounded-[3rem] relative">
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-2 bg-secondary/50">
            <motion.div 
              className="h-full bg-primary shadow-[0_0_15px_rgba(79,70,229,0.4)]"
              initial={{ width: "0%" }}
              animate={{ width: step === 'info' ? "50%" : "100%" }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          <CardHeader className="pt-16 pb-8 text-center px-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary border border-primary/20 shadow-inner"
            >
              {step === 'info' ? <User className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
            </motion.div>
            <CardTitle className="text-4xl font-black text-foreground tracking-tight">
              {step === 'info' ? 'ابدأ رحلة الاكتشاف' : 'تأكيد الهوية'}
            </CardTitle>
            <CardDescription className="text-xl font-bold text-muted-foreground mt-4 opacity-80 leading-relaxed">
              {step === 'info' 
                ? 'أدخل بياناتك لحفظ تقدمك والحصول على تقريرك الشخصي المطور.' 
                : 'أدخل الرمز المكون من 6 أرقام المرسل إلى هاتفك/بريدك.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-10 pb-16">
            <AnimatePresence mode="wait">
              {step === 'info' ? (
                <motion.form
                  key="info-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSendOtp}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">الاسم بالكامل</Label>
                      <div className="relative group">
                        <Input 
                          placeholder="أدخل اسمك الثلاثي" 
                          className="h-16 px-6 rounded-2xl bg-secondary/50 border-2 border-border/50 focus:border-primary/50 focus:outline-none transition-all font-bold text-lg pr-12"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">البريد أو رقم الجوال</Label>
                      <div className="relative group">
                        <Input 
                          placeholder="example@mail.com" 
                          className="h-16 px-6 rounded-2xl bg-secondary/50 border-2 border-border/50 focus:border-primary/50 focus:outline-none transition-all font-bold text-lg pr-12 text-left dir-ltr"
                          value={formData.emailOrPhone}
                          onChange={(e) => setFormData({...formData, emailOrPhone: e.target.value})}
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-18 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري الإرسال...</span>
                      </div>
                    ) : (
                      'متابعة للاختبار'
                    )}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-10"
                >
                  <div className="flex flex-col items-center space-y-8">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      className="gap-4"
                    >
                      <InputOTPGroup className="gap-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot 
                            key={i} 
                            index={i} 
                            className="w-14 h-18 text-3xl font-black rounded-2xl border-2 border-border/50 bg-secondary/50 focus:border-primary/50 transition-all shadow-inner" 
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>

                    <button 
                      type="button"
                      onClick={() => setStep('info')}
                      className="text-primary font-black flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      تغيير البيانات المدخلة
                    </button>
                  </div>

                  <Button 
                    className="w-full h-18 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    disabled={isLoading || otp.length < 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري التحقق...</span>
                      </div>
                    ) : (
                      'تحقق وابدأ الآن'
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-10 pt-8 border-t border-border/50 flex items-center justify-center gap-6 opacity-60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold">تشفير آمن</span>
              </div>
              <div className="w-px h-4 bg-border/50" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold">خصوصية تامة</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
