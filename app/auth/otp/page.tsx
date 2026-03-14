'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { otpSchema, type OTPInput } from '@/lib/validations'
import { AuthForm } from '@/components/auth/auth-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function OTPPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPInput>({
    resolver: zodResolver(otpSchema),
  })

  const onSubmit = async (data: OTPInput) => {
    try {
      setIsLoading(true)

      // TODO: Implement OTP verification
      console.log('OTP data:', data)

      toast.success('تم التحقق بنجاح!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('الكود غير صحيح')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      // TODO: Implement resend OTP
      toast.success('تم إعادة إرسال الكود')
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      toast.error('فشل إعادة الإرسال')
    }
  }

  return (
    <AuthForm
      title="التحقق من رقم الهاتف"
      subtitle="أدخل الكود الذي تم إرساله إلى رقم الهاتف"
      footerText="لم تتلق الكود؟"
      footerLink={{ text: 'طلب كود جديد', href: '#' }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Phone Number */}
        <div className="space-y-2">
          <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">رقم الهاتف</label>
          <Input
            placeholder="+966 55 000 0000"
            {...register('phone')}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 font-bold">{errors.phone.message}</p>
          )}
        </div>

        {/* OTP Code */}
        <div className="space-y-2">
          <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">كود التحقق</label>
          <Input
            placeholder="000000"
            maxLength={6}
            {...register('code')}
            disabled={isLoading}
            className="h-16 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-black text-3xl tracking-[1rem] text-center"
          />
          {errors.code && (
            <p className="text-red-500 text-sm mt-1 font-bold">{errors.code.message}</p>
          )}
          <p className="text-xs font-bold text-muted-foreground mt-3 text-center opacity-60">
            أدخل الكود المكون من 6 أرقام المرسل لهاتفك
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span>جاري التحقق...</span>
            </div>
          ) : (
            'تحقق الآن'
          )}
        </Button>

        {/* Resend Section */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendCooldown > 0}
            className="text-sm font-bold text-primary hover:text-primary/80 disabled:opacity-50 transition-all"
          >
            {resendCooldown > 0 
              ? `إعادة الإرسال خلال ${resendCooldown} ثانية` 
              : 'طلب كود جديد'}
          </button>
        </div>
      </form>
    </AuthForm>
  )
}
