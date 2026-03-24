'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface CustomPaymentFormProps {
  amount: number
  description: string
  metadata: any
  onSuccess?: (payment: any) => void
  onError?: (error: any) => void
}

export function CustomPaymentForm({
  amount,
  description,
  metadata,
  onSuccess,
  onError
}: CustomPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Format Card Number: 0000 0000 0000 0000
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Format Expiry: MM / YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return `${v.substring(0, 2)} / ${v.substring(2, 4)}`
    }
    return v
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    // Name validation
    if (!formData.name.trim()) newErrors.name = 'اسم حامل البطاقة مطلوب'
    
    // Card number validation (Luhn)
    const rawNumber = formData.number.replace(/\s/g, '')
    if (!rawNumber || rawNumber.length < 16) {
      newErrors.number = 'رقم البطاقة غير مكتمل'
    } else if (!luhnCheck(rawNumber)) {
      newErrors.number = 'رقم البطاقة غير صحيح'
    }

    // Expiry validation
    const expiryParts = formData.expiry.split('/')
    if (expiryParts.length !== 2) {
      newErrors.expiry = 'التاريخ غير صحيح'
    } else {
      const month = parseInt(expiryParts[0].trim())
      const year = parseInt('20' + expiryParts[1].trim())
      const now = new Date()
      const expiryDate = new Date(year, month - 1, 1)
      
      if (isNaN(month) || month < 1 || month > 12) {
        newErrors.expiry = 'الشهر غير صحيح'
      } else if (expiryDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
        newErrors.expiry = 'البطاقة منتهية الصلاحية'
      }
    }

    // CVC validation
    if (formData.cvc.length < 3) {
      newErrors.cvc = 'CVC غير صحيح'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const luhnCheck = (num: string) => {
    let arr = (num + '')
      .split('')
      .reverse()
      .map((x) => parseInt(x))
    let lastDigit = arr.splice(0, 1)[0]
    let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9 || 9)), 0)
    sum += lastDigit
    return sum % 10 === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY
      const expiryParts = formData.expiry.split('/')
      const month = expiryParts[0].trim()
      const year = '20' + expiryParts[1].trim()

      const paymentData = {
        amount: Math.round(amount * 100), // Moyasar uses subunits
        currency: 'SAR',
        description: description,
        callback_url: `${window.location.origin}/api/payment/verify`,
        source: {
          type: 'creditcard',
          name: formData.name,
          number: formData.number.replace(/\s/g, ''),
          cvc: formData.cvc,
          month: month,
          year: year
        },
        metadata: metadata
      }

      const response = await fetch('https://api.moyasar.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(publishableKey + ':')}`
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'فشلت عملية الدفع')
      }

      // Handle 3D Secure redirection
      if (result.source.transaction_url) {
        window.location.href = result.source.transaction_url
      } else if (onSuccess) {
        onSuccess(result)
      }

    } catch (error: any) {
      console.error('Payment Error:', error)
      toast.error(error.message || 'حدث خطأ أثناء معالجة الدفع')
      if (onError) onError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Card Holder Name */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-400">اسم حامل البطاقة</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="الاسم كما هو مكتوب على البطاقة"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                "h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-amber-500/50 text-white font-bold transition-all",
                errors.name && "border-red-500/50 focus:ring-red-500/50"
              )}
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs font-bold">{errors.name}</p>}
        </div>

        {/* Card Number */}
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-400">رقم البطاقة</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: formatCardNumber(e.target.value) })}
              className={cn(
                "h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-amber-500/50 text-white font-bold transition-all pr-12",
                errors.number && "border-red-500/50 focus:ring-red-500/50"
              )}
            />
            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          </div>
          {errors.number && <p className="text-red-400 text-xs font-bold">{errors.number}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiry */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-400">تاريخ الانتهاء</Label>
            <Input
              type="text"
              placeholder="MM / YY"
              maxLength={7}
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: formatExpiry(e.target.value) })}
              className={cn(
                "h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-amber-500/50 text-white font-bold transition-all text-center",
                errors.expiry && "border-red-500/50 focus:ring-red-500/50"
              )}
            />
            {errors.expiry && <p className="text-red-400 text-xs font-bold">{errors.expiry}</p>}
          </div>

          {/* CVC */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-400">رمز CVC</Label>
            <Input
              type="text"
              placeholder="123"
              maxLength={4}
              value={formData.cvc}
              onChange={(e) => setFormData({ ...formData, cvc: e.target.value.replace(/[^0-9]/g, '') })}
              className={cn(
                "h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-2 focus:ring-amber-500/50 text-white font-bold transition-all text-center",
                errors.cvc && "border-red-500/50 focus:ring-red-500/50"
              )}
            />
            {errors.cvc && <p className="text-red-400 text-xs font-bold">{errors.cvc}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold justify-center opacity-60">
        <Lock className="w-3 h-3" />
        <span>تشفير SSL آمن بمعايير PCI-DSS</span>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-16 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-slate-900 font-black text-xl rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1 active:scale-[0.98]"
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <span>جاري المعالجة...</span>
          </div>
        ) : (
          `ابدأ الآن | ${Math.round(amount)} ر.س`
        )}
      </Button>
    </form>
  )
}
