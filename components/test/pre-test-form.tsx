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
      // Simulate API call to send OTP
      console.log('Sending OTP to:', formData.emailOrPhone)
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
      // Simulate API call to verify OTP
      console.log('Verifying OTP:', otp)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('تم التحقق بنجاح! ابدأ الاختبار الآن')
      onComplete({ ...formData, verified: true })
    } catch (error) {
      toast.error('رمز التحقق غير صحيح')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-card border border-border shadow-xl overflow-hidden rounded-3xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-muted">
            <motion.div 
              className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.2)]"
              initial={{ width: "0%" }}
              animate={{ width: step === 'info' ? "50%" : "100%" }}
            />
          </div>

          <CardHeader className="pt-10 pb-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20">
              {step === 'info' ? <User className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {step === 'info' ? 'ابدأ رحلة الاكتشاف' : 'تأكيد الهوية'}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {step === 'info' 
                ? 'أدخل بياناتك لحفظ تقدمك والحصول على نتائجك' 
                : `أدخل الرمز المرسل إلى ${formData.emailOrPhone}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-10 px-8">
            {step === 'info' ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground mr-1 font-bold">الاسم الكامل</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      id="name"
                      placeholder="أدخل اسمك الكريم"
                      className="bg-muted/50 border-border pr-10 h-12 rounded-xl text-foreground focus:ring-primary/20 focus:bg-background transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-foreground mr-1 font-bold">البريد الإلكتروني أو رقم الجوال</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      id="contact"
                      placeholder="example@mail.com أو 05xxxxxxxx"
                      className="bg-muted/50 border-border pr-10 h-12 rounded-xl text-foreground focus:ring-primary/20 focus:bg-background transition-all"
                      value={formData.emailOrPhone}
                      onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/10"
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                </Button>
                
                <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  بإكمالك للتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="flex justify-center" dir="ltr">
                  <InputOTP 
                    maxLength={6} 
                    value={otp} 
                    onChange={setOtp}
                    className="gap-2"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 bg-muted/50 border-border text-foreground text-xl rounded-xl" />
                      <InputOTPSlot index={1} className="w-12 h-14 bg-muted/50 border-border text-foreground text-xl rounded-xl" />
                      <InputOTPSlot index={2} className="w-12 h-14 bg-muted/50 border-border text-foreground text-xl rounded-xl" />
                    </InputOTPGroup>
                    <InputOTPSeparator className="text-border" />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="w-12 h-14 bg-muted/50 border-border text-foreground text-xl rounded-xl" />
                      <InputOTPSlot index={4} className="w-12 h-14 bg-muted/50 border-border text-foreground text-xl rounded-xl" />
                      <InputOTPSlot index={5} className="w-12 h-14 bg-muted/50 border-border text-foreground text-xl rounded-xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/10"
                    disabled={isLoading}
                  >
                    {isLoading ? 'جاري التحقق...' : 'تأكيد وابدأ الاختبار'}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-primary hover:bg-primary/5"
                    onClick={() => setStep('info')}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="ml-2 w-4 h-4" />
                    تغيير البيانات
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
