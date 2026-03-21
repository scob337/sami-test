'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { MessageCircle, Send, X, Loader2, Image as ImageIcon, Video, Trash2, FileUp, History, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/store/auth-store'
import { useUploadStore } from '@/lib/store/upload-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function SupportButton() {
  const { user } = useAuthStore()
  const { addUpload, uploads, removeUpload } = useUploadStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [allSessions, setAllSessions] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeUpload = currentUploadId ? uploads[currentUploadId] : null
  
  const { data: messages, mutate: mutateMessages } = useSWR<any[]>(
    session ? `/api/chat/messages?sessionId=${session.id}` : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  const unreadCount = messages?.filter(m => m.isAdmin && !m.isRead).length || 0

  useEffect(() => {
    if (unreadCount > 0 && !isOpen) {
      toast.info('لديك رسالة جديدة من الدعم الفني', {
        action: {
          label: 'عرض',
          onClick: () => setIsOpen(true)
        }
      })
    }
    if (isOpen && session) {
      fetch('/api/chat/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id })
      }).then(() => mutateMessages())
    }
  }, [unreadCount, isOpen, session])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Load ALL sessions (active + closed) for history
  useEffect(() => {
    if (user && !user.isAdmin) {
      fetch('/api/chat/session').then(res => res.json()).then(data => {
        if (Array.isArray(data)) {
          setAllSessions(data)
          const active = data.find((s: any) => s.isActive) || data[0]
          if (active) setSession(active)
        }
      })
    }
  }, [user])

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

  const startSession = async () => {
    if (session) {
      setIsOpen(true)
      return
    }
    try {
      const res = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSession(data)
      setAllSessions(prev => [data, ...prev])
      setIsOpen(true)
    } catch (error) {
      toast.error('لم نتمكن من بدء محادثة الدعم حالياً')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const hasContent = message.trim() || (activeUpload && activeUpload.status === 'completed')
    if (!hasContent || !session || sending || !session?.isActive) return

    setSending(true)
    try {
      const payload = {
        sessionId: session.id,
        content: message.trim(),
        isAdmin: false,
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
    } catch (error) {
      toast.error('فشل إرسال الرسالة')
    } finally {
      setSending(false)
    }
  }

  const selectSession = (s: any) => {
    setSession(s)
    setShowHistory(false)
  }

  if (!user || user.isAdmin) return null

  const isClosed = session?.isActive === false

  return (
    <div className="fixed bottom-8 left-8 z-[9999] flex flex-col items-end gap-4 pointer-events-auto">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-[400px] h-[600px] bg-[#050B1A] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            <div className="p-6 bg-[#0D1B36] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showHistory ? (
                  <Button variant="ghost" size="icon" className="text-white opacity-60 hover:opacity-100" onClick={() => setShowHistory(false)}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-black text-white leading-tight">
                    {showHistory ? 'المحادثات السابقة' : 'الدعم الفني'}
                  </h3>
                  {!showHistory && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                       <span className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         session?.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                       )} />
                       <span className={cn(session?.isActive ? "text-emerald-500" : "text-slate-500")}>
                          {session?.isActive ? 'متصل الآن' : 'المحادثة مغلقة'}
                       </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!showHistory && allSessions.length > 1 && (
                  <Button variant="ghost" size="icon" className="text-white opacity-40 hover:opacity-100" onClick={() => setShowHistory(true)}>
                    <History className="w-5 h-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-white opacity-40 hover:opacity-100" onClick={() => setIsOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Session History List */}
            {showHistory ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {allSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectSession(s)}
                    className={cn(
                      "w-full text-right p-4 rounded-2xl transition-all border",
                      session?.id === s.id
                        ? "bg-blue-600 text-white border-transparent shadow-lg shadow-blue-600/20"
                        : "bg-white/5 border-white/5 hover:border-blue-500/50 text-white"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        s.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"
                      )}>
                        {s.isActive ? 'مفتوحة' : 'مغلقة'}
                      </span>
                      <span className="text-[10px] font-bold opacity-50">
                        {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <p className="text-xs font-bold opacity-60 truncate">
                      محادثة #{s.id}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20"
                >
                  {messages?.map((msg: any) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.isAdmin ? "self-start items-start" : "self-end items-end"
                      )}
                    >
                      <span className="text-[9px] font-black opacity-40 mb-1 px-1 uppercase tracking-tighter">
                        {msg.isAdmin ? (msg.sender?.name || 'الأدمن') : (user?.name || 'أنت')}
                      </span>
                      
                      {msg.fileUrl && (
                        <div className="mb-2 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                          {msg.fileType === 'video' ? (
                            <video src={msg.fileUrl} controls className="max-w-full h-auto rounded-xl" />
                          ) : (
                            <img src={msg.fileUrl} alt="Attached" className="max-w-full h-auto rounded-xl shadow-lg" onClick={() => window.open(msg.fileUrl, '_blank')} />
                          )}
                        </div>
                      )}

                      {msg.content && (
                        <div className={cn(
                          "p-3.5 rounded-2xl text-[13px] font-bold shadow-sm leading-relaxed",
                          msg.content.startsWith('⛔')
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-center text-[11px]"
                            : msg.isAdmin 
                              ? "bg-white/10 text-white rounded-tl-none border border-white/5" 
                              : "bg-blue-600 text-white rounded-tr-none"
                        )}>
                          {msg.content}
                        </div>
                      )}
                      <span className="text-[8px] font-black opacity-20 mt-1 uppercase tracking-widest px-1">
                        {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  
                  {!messages?.length && (
                     <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                        <MessageCircle className="w-16 h-16 mb-4" />
                        <p className="font-bold text-white">كيف يمكننا مساعدتك اليوم؟</p>
                     </div>
                  )}
                </div>

                {/* Input & Previews */}
                <div className="p-6 bg-[#0D1B36] border-t border-white/5 space-y-4">
                  {isClosed && (
                    <div className="text-center py-2">
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                        تم إنهاء هذه المحادثة ولا يمكن إرسال رسائل جديدة
                      </span>
                    </div>
                  )}
                  
                  {!isClosed && (
                    <>
                      <AnimatePresence>
                        {activeUpload && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                                {activeUpload.status === 'uploading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-black text-white truncate max-w-[150px]">{activeUpload.fileName}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                  {activeUpload.status === 'uploading' ? `جاري الرفع ${activeUpload.progress}%` : 'جاهز للإرسال'}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-rose-500 hover:bg-rose-500/10 rounded-xl"
                              onClick={() => {
                                removeUpload(currentUploadId!);
                                setCurrentUploadId(null);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <div className="relative flex-1">
                          <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="اكتب رسالتك هنا..."
                            disabled={!!(activeUpload && activeUpload.status === 'uploading')}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                            dir="rtl"
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
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-white opacity-40 hover:opacity-100 disabled:opacity-10 transition-all"
                          >
                            <ImageIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={(!message.trim() && !activeUpload) || sending || !!(activeUpload && activeUpload.status === 'uploading')}
                          className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 p-0 shrink-0 shadow-lg shadow-blue-600/20"
                        >
                          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rotate-180" />}
                        </Button>
                      </form>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => isOpen ? setIsOpen(false) : startSession()}
        className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8 group-hover:animate-bounce" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-4 border-[#050B1A] animate-bounce">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  )
}
