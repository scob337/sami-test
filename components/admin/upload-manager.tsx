'use client'

import { useUploadStore, UploadItem } from '@/lib/store/upload-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { X, CheckCircle2, AlertCircle, Loader2, FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function UploadManager() {
  const { uploads, removeUpload, cancelUpload } = useUploadStore()
  const uploadList = Object.values(uploads)

  if (uploadList.length === 0) return null

  return (
    <div className="fixed bottom-6 left-6 z-[100] w-full max-w-sm pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        <AnimatePresence>
          {uploadList.map((upload) => (
            <UploadCard 
              key={upload.id} 
              upload={upload} 
              onRemove={() => removeUpload(upload.id)}
              onCancel={() => cancelUpload(upload.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function UploadCard({ upload, onRemove, onCancel }: { 
  upload: UploadItem, 
  onRemove: () => void,
  onCancel: () => void 
}) {
  const isCompleted = upload.status === 'completed'
  const isError = upload.status === 'error'
  const isCancelled = upload.status === 'cancelled'
  const isUploading = upload.status === 'uploading'

  return (
    <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden bg-white dark:bg-slate-900 border-2 rounded-2xl p-4 shadow-2xl transition-colors duration-300",
        isCompleted ? "border-emerald-500/20" : 
        isError ? "border-destructive/20" : 
        "border-slate-100 dark:border-slate-800"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          isCompleted ? "bg-emerald-500/10 text-emerald-500" :
          isError ? "bg-destructive/10 text-destructive" :
          "bg-blue-500/10 text-blue-500"
        )}>
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> :
           isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
           isError ? <AlertCircle className="w-5 h-5" /> :
           <FileUp className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate leading-none mb-1">
            {upload.fileName}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isUploading ? `${upload.progress}% متبقي` :
             isCompleted ? 'تم الرفع بنجاح' :
             isError ? 'فشل الرفع' :
             'تم الإلغاء'}
          </p>
        </div>

        <button 
          onClick={isUploading ? onCancel : onRemove}
          className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {(isUploading || isCompleted) && (
        <div className="mt-3">
          <Progress 
            value={upload.progress} 
            className={cn(
              "h-1.5 bg-slate-100 dark:bg-slate-800",
              isCompleted ? "[&>div]:bg-emerald-500" : "[&>div]:bg-blue-500"
            )}
          />
        </div>
      )}

      {isError && upload.error && (
        <p className="mt-2 text-[10px] text-destructive font-medium line-clamp-1 italic">
          {upload.error}
        </p>
      )}
    </motion.div>
  )
}
