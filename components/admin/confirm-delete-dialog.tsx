'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertCircle, Trash2, X } from 'lucide-react'

interface ConfirmDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title?: string
  description?: string
  isDeleting?: boolean
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = 'هل أنت متأكد من الحذف؟',
  description = 'لا يمكن التراجع عن هذه العملية. سيتم حذف العنصر وجميع البيانات المرتبطة به نهائياً من قاعدة البيانات.',
  isDeleting = false,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={val => !val && onClose()}>
      <AlertDialogContent className="bg-white dark:bg-slate-900 border-none rounded-[32px] p-0 overflow-hidden shadow-2xl max-w-md" dir="rtl">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                {title}
              </AlertDialogTitle>
              <div className="mt-1 flex items-center gap-1.5 text-red-500/80">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">إجراء لا يمكن التراجع عنه</span>
              </div>
            </div>
          </div>

          <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-base">
            {description}
          </AlertDialogDescription>
        </div>

        <AlertDialogFooter className="p-8 pt-0 flex flex-col sm:flex-row-reverse gap-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-red-500/20 transition-all active:scale-95 border-none"
          >
            {isDeleting ? (
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" className="text-white" />
                <span>جاري الحذف...</span>
              </div>
            ) : (
              'تأكيد الحذف النهائي'
            )}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl h-14 px-8 text-slate-400 font-black text-lg border-2 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900 transition-all mt-0"
          >
            إلغاء
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
