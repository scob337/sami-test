'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Bell, Send, AlertCircle, Info, CheckCircle } from 'lucide-react'

interface SendNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    name: string
  } | null
}

export function SendNotificationModal({ isOpen, onClose, user }: SendNotificationModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('info')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!user) return
    if (!title || !content) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/notifications/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          content,
          type
        })
      })

      if (!res.ok) throw new Error()

      toast.success('تم إرسال الإشعار بنجاح')
      setTitle('')
      setContent('')
      onClose()
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الإشعار')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none p-6 sm:p-8" dir="rtl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
            <Bell className="w-6 h-6 text-blue-500" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">إرسال إشعار فردي</DialogTitle>
          <p className="text-slate-500 font-bold text-sm mt-1">المستلم: {user?.name}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">نوع الإشعار</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-xl h-12 font-bold">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-xl">
                <SelectItem value="info" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" /> معلومات عامة
                  </div>
                </SelectItem>
                <SelectItem value="warning">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> تنبيه هام
                  </div>
                </SelectItem>
                <SelectItem value="success">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> رسالة نجاح
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">عنوان الإشعار</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: تم تحديث كورس جديد" 
              className="rounded-xl h-12 font-bold px-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">محتوى الرسالة</label>
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب تفاصيل الإشعار هنا..." 
              className="min-h-[120px] rounded-[1.5rem] font-medium p-4"
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button 
            onClick={handleSend} 
            disabled={isLoading}
            className="rounded-xl h-12 px-8 flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg gap-2"
          >
            <Send className="w-5 h-5" /> {isLoading ? 'جاري الإرسال...' : 'إرسال الآن'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="rounded-xl h-12 px-6 font-bold"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
