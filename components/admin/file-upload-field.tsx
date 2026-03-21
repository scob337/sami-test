'use client'

import { useRef, useState, useEffect } from 'react'
import { useUploadStore } from '@/lib/store/upload-store'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Upload, X, FileUp, CheckCircle2, AlertCircle, Video, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  onDurationChange?: (duration: string) => void
  accept: 'video/*' | 'image/*' | '.pdf'
  bucket?: string
  icon?: 'video' | 'image' | 'file'
}

export function FileUploadField({ 
  label, 
  value, 
  onChange, 
  onDurationChange,
  accept, 
  bucket = 'general',
  icon = 'file'
}: FileUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addUpload, uploads } = useUploadStore()
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const activeUpload = currentUploadId ? uploads[currentUploadId] : null

  useEffect(() => {
    if (activeUpload?.status === 'completed' && activeUpload.url) {
      onChange(activeUpload.url)
    }
  }, [activeUpload?.status, activeUpload?.url, onChange])

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Calculate duration for videos if requested
    if (accept.includes('video') && onDurationChange) {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        onDurationChange(formatDuration(video.duration))
      }
      video.src = URL.createObjectURL(file)
    }

    try {
      const id = await addUpload(file, bucket)
      setCurrentUploadId(id)
    } catch (err) {
      console.error('Upload field error:', err)
    }
  }

  const IconComponent = icon === 'video' ? Video : icon === 'image' ? ImageIcon : FileUp

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>
        {value && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { onChange(''); setCurrentUploadId(null); }}
            className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs font-bold"
          >
            إزالة الملف
          </Button>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={accept} 
        className="hidden" 
      />

      {!activeUpload && !value && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-white dark:group-hover:bg-slate-900 transition-all mb-2 shadow-sm">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-500 group-hover:text-blue-500">
            اضغط لرفع {accept.includes('video') ? 'فيديو' : accept.includes('image') ? 'صورة' : 'ملف'}
          </span>
        </button>
      )}

      {activeUpload && activeUpload.status === 'uploading' && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 space-y-3">
          <div className="flex justify-between items-center text-xs font-black text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>جاري الرفع...</span>
            </div>
            <span>{activeUpload.progress}%</span>
          </div>
          <Progress value={activeUpload.progress} className="h-1.5 [&>div]:bg-blue-500" />
        </div>
      )}

      {(value || (activeUpload && activeUpload.status === 'completed')) && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 flex flex-col gap-3">
          {(accept.includes('image') && (value || activeUpload?.url)) ? (
            <img src={value || activeUpload?.url} alt="Preview" className="w-full h-32 object-cover rounded-xl" />
          ) : (accept.includes('video') && (value || activeUpload?.url)) ? (
            <video src={value || activeUpload?.url} controls className="w-full h-32 object-cover rounded-xl bg-black" />
          ) : null}
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mb-0.5">تم الرفع بنجاح</span>
              <p className="text-[10px] font-bold text-emerald-500/60 truncate" dir="ltr">
                {value}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeUpload && activeUpload.status === 'error' && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">فشل الرفع، حاول مرة أخرى</span>
            <Button 
                variant="link" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                className="h-auto p-0 text-rose-500 font-black text-[10px]"
            >
                إعادة المحاولة
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
