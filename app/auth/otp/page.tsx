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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone Number */}
        <div>
          <label className="text-sm font-medium mb-2 block">رقم الهاتف</label>
          <Input
            placeholder="+966 55 000 0000"
            {...register('phone')}
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* OTP Code */}
        <div>
          <label className="text-sm font-medium mb-2 block">كود التحقق</label>
          <Input
            placeholder="000000"
            maxLength={6}
            {...register('code')}
            disabled={isLoading}
            className="tracking-widest text-center text-lg"
          />
          {errors.code && (
            <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            أدخل الكود المكون من 6 أرقام
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 h-10"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              جاري التحقق...
            </div>
          ) : (
            'تحقق'
          )}
        </Button>

        {/* Resend Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleResendOTP}
          disabled={isLoading || resendCooldown > 0}
        >
          {resendCooldown > 0
            ? `إعادة الإرسال خلال ${resendCooldown}ث`
            : 'إعادة إرسال الكود'}
        </Button>
      </form>
    </AuthForm>
  )
}
