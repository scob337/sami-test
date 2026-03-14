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
  title = 'هل أنت متأكد؟',
  description = 'لا يمكن التراجع عن هذه العملية. سيتم حذف العنصر نهائياً.',
  isDeleting = false,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={val => !val && onClose()}>
      <AlertDialogContent className="bg-card border-border rounded-3xl" dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row-reverse gap-2">
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-6 font-bold"
          >
            {isDeleting ? <LoadingSpinner size="sm" /> : 'حذف'}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onClose}
            className="rounded-xl h-10 text-muted-foreground border-border hover:bg-accent hover:text-foreground"
          >
            إلغاء
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
