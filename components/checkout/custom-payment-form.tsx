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
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const scriptId = 'moyasar-js'
    const styleId = 'moyasar-css'

    // Load CSS
    if (!document.getElementById(styleId)) {
      const link = document.createElement('link')
      link.id = styleId
      link.rel = 'stylesheet'
      link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'
      document.head.appendChild(link)
    }

    // Load JS
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js'
      script.async = true
      script.onload = () => setIsReady(true)
      document.body.appendChild(script)
    } else {
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    if (!isReady || !window.Moyasar) return

    const publishableKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY

    // Clear existing form if any
    const container = document.querySelector('.mysr-form')
    if (container) container.innerHTML = ''

    window.Moyasar.init({
      element: '.mysr-form',
      amount: Math.round(amount * 100),
      currency: 'SAR',
      description: description,
      publishable_api_key: publishableKey,
      callback_url: `${window.location.origin}/api/payment/verify`,
      methods: ['creditcard', 'stcpay'],
      metadata: metadata,
      on_completed: (payment: any) => {
        if (onSuccess) onSuccess(payment)
      },
      on_error: (error: any) => {
        if (onError) onError(error)
      }
    })
    setIsLoading(false)
  }, [isReady, amount, description, metadata, onSuccess, onError])

  return (
    <div className="space-y-6">
      <div className="relative min-h-[300px] w-full bg-white/[0.02] border border-white/5 rounded-[32px] p-2 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050B1A]/80 backdrop-blur-sm gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 font-bold animate-pulse">جاري تحميل بوابة الدفع...</p>
          </div>
        )}
        <div className="mysr-form !w-full !max-w-none"></div>
      </div>
      
      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold justify-center opacity-60">
        <Lock className="w-3 h-3" />
        <span>تشفير SSL آمن بالكامل عبر Moyasar</span>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    Moyasar: any
  }
}
