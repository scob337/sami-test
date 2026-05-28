'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { TestPageContent } from '@/app/test/client-page'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface BookTestModalProps {
  testId: string
  triggerButtonText?: string
  className?: string
  size?: 'default' | 'lg'
}

export function BookTestModal({ testId, triggerButtonText = 'ابدأ الاختبار الآن', className, size = 'default' }: BookTestModalProps) {
  const [open, setOpen] = useState(false)

  // Pre-load the test client components lazily if possible, or just render it when open
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size={size} 
          className={className}
        >
          {triggerButtonText}
          <ArrowLeft className="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl h-[90vh] sm:h-[85vh] p-0 border border-border rounded-3xl overflow-hidden bg-background flex flex-col" showCloseButton={true}>
        <DialogTitle className="sr-only">اختبار الشخصية</DialogTitle>
        <div className="w-full h-full overflow-y-auto">
          {open && (
             <TestPageContent testIdProp={testId} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
