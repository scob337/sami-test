'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { MessageCircle, Send, User, Search, CheckCheck, Loader2, BookOpen, Image as ImageIcon, Video, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useUploadStore } from '@/lib/store/upload-store'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminSupportPage() {
  const { data: sessions, mutate: mutateSessions, isLoading: loadingSessions } = useSWR<any[]>('/api/chat/session', fetcher, { refreshInterval: 5000 })
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { addUpload, uploads, removeUpload } = useUploadStore()
  const activeUpload = currentUploadId ? uploads[currentUploadId] : null

  const { data: messages, mutate: mutateMessages } = useSWR<any[]>(
    selectedSession ? `/api/chat/messages?sessionId=${selectedSession.id}` : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    if (selectedSession) {
      fetch('/api/chat/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: selectedSession.id })
      }).then(() => mutateSessions())
    }
  }, [messages, selectedSession])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
       toast.error('يرجى اختيار صور أو فيديوهات فقط')
       return
    }

    try {
      const id = await addUpload(file, 'books')
      setCurrentUploadId(id)
    } catch (err) {
      toast.error('فشل تجهيز الملف')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const hasContent = message.trim() || (activeUpload && activeUpload.status === 'completed')
    if (!hasContent || !selectedSession || sending) return

    setSending(true)
    try {
      const payload = {
        sessionId: selectedSession.id,
        content: message.trim(),
        isAdmin: true,
        fileUrl: activeUpload?.url,
        fileType: activeUpload?.url ? (activeUpload.fileName.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image') : undefined
      }

      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      
      setMessage('')
      if (currentUploadId) {
        removeUpload(currentUploadId)
        setCurrentUploadId(null)
      }
      mutateMessages()
      mutateSessions()
    } catch (error) {
      toast.error('فشل إرسال الرد')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      
      {/* Sessions Sidebar */}
      <div className="w-80 border-l border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/30">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black mb-4">المحادثات</h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              placeholder="بحث عن مستخدم..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loadingSessions ? (
            <div className="flex justify-center p-8"><LoadingSpinner /></div>
          ) : sessions?.map((session) => (
            <button
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className={cn(
                "w-full text-right p-4 rounded-2xl transition-all border border-transparent",
                selectedSession?.id === session.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                  selectedSession?.id === session.id ? "bg-white/20" : "bg-slate-200 dark:bg-slate-800"
                )}>
                  {session.user.name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold truncate text-sm">{session.user.name}</span>
                    {session._count.messages > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black">
                        {session._count.messages}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-[10px] truncate opacity-70",
                    selectedSession?.id === session.id ? "text-white" : "text-slate-500"
                  )}>
                    {session.user.email}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {!sessions?.length && (
            <div className="text-center py-20 opacity-40">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="text-sm font-bold">لا توجد محادثات نشطة</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black border border-blue-500/20">
                  {selectedSession.user.name?.[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white leading-tight">{selectedSession.user.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedSession.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button 
                   variant="ghost" 
                   size="sm"
                   className={cn(
                     "rounded-xl gap-2 font-bold",
                     selectedSession.isActive ? "text-rose-500 hover:bg-rose-500/5" : "text-emerald-500 hover:bg-emerald-500/5"
                   )}
                   onClick={async () => {
                     try {
                       const res = await fetch(`/api/chat/session/${selectedSession.id}/toggle`, { method: 'PATCH' })
                       if (!res.ok) throw new Error()
                       mutateSessions()
                       setSelectedSession({ ...selectedSession, isActive: !selectedSession.isActive })
                       toast.success(selectedSession.isActive ? 'تم إغلاق المحادثة' : 'تم إعادة فتح المحادثة')
                     } catch {
                       toast.error('فشل تغيير حالة المحادثة')
                     }
                   }}
                 >
                   {selectedSession.isActive ? 'إغلاق المحادثة' : 'إعادة فتح'}
                 </Button>
                 <div className={cn("w-2 h-2 rounded-full animate-pulse", selectedSession.isActive ? "bg-emerald-500" : "bg-slate-500")} />
                 <span className={cn("text-[10px] font-black uppercase tracking-widest", selectedSession.isActive ? "text-emerald-500" : "text-slate-500")}>
                   {selectedSession.isActive ? 'مباشر' : 'مغلق'}
                 </span>
              </div>
            </div>

            {/* Messages history */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 dark:bg-slate-950/20"
            >
              {messages?.map((msg: any) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    msg.isAdmin ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  {msg.fileUrl && (
                    <div className="mb-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden max-w-sm">
                      {msg.fileType === 'video' ? (
                        <video src={msg.fileUrl} controls className="w-full h-auto" />
                      ) : (
                        <img src={msg.fileUrl} alt="Attached" className="w-full h-auto cursor-zoom-in" onClick={() => window.open(msg.fileUrl, '_blank')} />
                      )}
                    </div>
                  )}

                  {msg.content && (
                    <div className={cn(
                      "p-4 rounded-3xl text-sm font-medium shadow-sm",
                      msg.isAdmin 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700"
                    )}>
                      {msg.content}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 opacity-40 text-[9px] font-bold">
                    {msg.isRead && msg.isAdmin && <CheckCheck className="w-3 h-3 text-blue-500" />}
                    {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <AnimatePresence>
                {activeUpload && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between"
                   >
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                          {activeUpload.status === 'uploading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-black truncate max-w-[200px]">{activeUpload.fileName}</p>
                          <p className="text-[10px] font-bold text-slate-500">{activeUpload.status === 'uploading' ? `جاري الرفع ${activeUpload.progress}%` : 'جاهز للإرسال'}</p>
                        </div>
                     </div>
                     <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-500/10 rounded-xl" onClick={() => { removeUpload(currentUploadId!); setCurrentUploadId(null); }}>
                        <Trash2 className="w-4 h-4" />
                     </Button>
                   </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendMessage} className="flex gap-4">
                <div className="relative flex-1">
                  <input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    disabled={sending || !!(activeUpload && activeUpload.status === 'uploading')}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pr-6 pl-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="image/*,video/*"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={activeUpload !== null}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-20"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
                <Button 
                  type="submit" 
                  disabled={(!message.trim() && !activeUpload) || sending || !!(activeUpload && activeUpload.status === 'uploading')}
                  className="h-14 px-8 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black shadow-xl shadow-blue-500/20 gap-3 transition-all active:scale-95"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rotate-180" />}
                  إرسال الرد
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30">
            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
               <MessageCircle className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black mb-2">ابدأ المحادثة</h3>
            <p className="max-w-xs font-bold">اختر مستخدماً من القائمة الجانبية لبدء التواصل معه وتقديم الدعم.</p>
          </div>
        )}
      </div>

      {/* User Bio Sidebar */}
      {selectedSession && (
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 overflow-y-auto hidden xl:block">
          <div className="p-8">
            <div className="text-center mb-8">
               <div className="w-24 h-24 rounded-[2rem] bg-blue-600 mx-auto mb-4 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-500/20">
                 {selectedSession.user.name?.[0]}
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{selectedSession.user.name}</h3>
               <p className="text-sm font-bold text-slate-500 mt-1 mb-4">{selectedSession.user.email}</p>
               <Button asChild variant="outline" size="sm" className="rounded-xl font-bold w-full gap-2 hover:bg-blue-600 hover:text-white transition-all">
                 <Link href={`/admin/users/${selectedSession.user.id}`}>
                   <User className="w-4 h-4" />
                   ملف المستخدم بالكامل
                 </Link>
               </Button>
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-4">بيانات التواصل</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">الاسم بالكامل</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{selectedSession.user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                      <Send className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">بيانات إضافية</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{selectedSession.user.phone || 'غير مسجل'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] mb-4">الكورسات المشترك بها</h4>
                <div className="space-y-2">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group hover:border-blue-500 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">كورس فعال</span>
                    </div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">الكورس الشامل لاختبار الشخصية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
