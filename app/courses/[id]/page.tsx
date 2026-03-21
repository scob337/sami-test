'use client'

import { useState, useEffect, useMemo, use } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Play, Lock, ChevronRight, Star, MessageCircle, Share2, User, X, Send, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { VideoPlayer } from '@/components/course/video-player'

interface Episode {
  id: number
  title: string
  description: string
  videoUrl: string
  videoUrl720?: string
  videoUrl1080?: string
  thumbnail: string
  duration: string
  isFree: boolean
  sortOrder: number
}

interface Rating {
  id: number
  value: number
  comment: string
  user: { name: string, avatarUrl?: string }
  createdAt: string
}

interface Course {
  id: number
  title: string
  description: string
  price: number
  image: string
  introVideoUrl: string
  videoUrl720?: string
  videoUrl1080?: string
  introThumbnailUrl: string
  episodes: Episode[]
  ratings: Rating[]
  _count: { enrollments: number }
}

export default function CourseSinglePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuthStore()

  const { data: course, isLoading, mutate } = useSWR<Course>(`/api/courses/${id}`, fetcher)
  const { data: enrollmentData } = useSWR<{ isEnrolled: boolean }>(user ? `/api/courses/${id}/check-enrollment` : null, fetcher)
  const { data: ratingData, mutate: mutateRating } = useSWR<{ userRating: any }>(user ? `/api/courses/${id}/ratings` : null, fetcher)

  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [showIntro, setShowIntro] = useState(false)

  const { data: comments, mutate: mutateComments } = useSWR<any[]>(currentEpisode ? `/api/episodes/${currentEpisode.id}/comments` : null, fetcher)

  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Rating popup state
  const [showRatingPopup, setShowRatingPopup] = useState(false)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  // Share popup state
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load user's existing rating
  useEffect(() => {
    if (ratingData?.userRating) {
      setRatingValue(ratingData.userRating.value)
      setRatingComment(ratingData.userRating.comment || '')
    }
  }, [ratingData])

  const handlePostComment = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول للتعليق')
      return
    }
    if (!commentText.trim() || !currentEpisode) return

    setIsSubmittingComment(true)
    try {
      const res = await fetch(`/api/episodes/${currentEpisode.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText })
      })

      if (!res.ok) throw new Error('Failed to post')

      setCommentText('')
      toast.success('تم إضافة تعليقك')
      mutateComments()
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة التعليق')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const isAdmin = !!(user as any)?.isAdmin

  useEffect(() => {
    if (enrollmentData && course) {
      setIsEnrolled(enrollmentData.isEnrolled || isAdmin)
      if (!enrollmentData.isEnrolled && !isAdmin && course.introVideoUrl) {
        setShowIntro(true)
      }
    }
  }, [enrollmentData, course, isAdmin])

  useEffect(() => {
    if (course?.episodes?.length && !currentEpisode && !showIntro) {
      const firstAvailable = course.episodes.find(e => e.isFree) || course.episodes[0]
      setCurrentEpisode(firstAvailable)
    }
  }, [course, currentEpisode, showIntro])

  const handleEpisodeSelect = (episode: Episode) => {
    if (!episode.isFree && !isEnrolled && !isAdmin) {
      toast.error('هذه الحلقة مدفوعة. يرجى الاشتراك في الكورس للمشاهدة.')
      return
    }
    setShowIntro(false)
    setCurrentEpisode(episode)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleVideoEnd = async () => {
    if (!user || !currentEpisode || showIntro) return
    try {
       await fetch('/api/user/progress', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           episodeId: currentEpisode.id,
           isWatched: true
         })
       })
    } catch (error) {
       console.error('Failed to save progress')
    }
  }

  const handleTimeUpdate = (e: any) => {
     // Optional: throttle and save intermediate progress
  }

  // Rating popup handlers
  const openRatingPopup = (starValue: number) => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول للتقييم')
      return
    }
    setHoverRating(0)
    if (!ratingData?.userRating) {
      setRatingValue(starValue)
      setRatingComment('')
    }
    setShowRatingPopup(true)
  }

  const handleSubmitRating = async () => {
    if (!ratingValue) {
      toast.error('يرجى اختيار عدد النجوم')
      return
    }
    setIsSubmittingRating(true)
    try {
      const res = await fetch(`/api/courses/${course?.id}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: ratingValue, comment: ratingComment.trim() || null })
      })

      if (!res.ok) throw new Error()
      toast.success('شكرًا لتقييمك!')
      setShowRatingPopup(false)
      mutate()
      mutateRating()
    } catch {
      toast.error('فشل حفظ التقييم')
    } finally {
      setIsSubmittingRating(false)
    }
  }

  // Share handlers
  const courseUrl = typeof window !== 'undefined' ? `${window.location.origin}/courses/${id}` : ''
  const shareText = course ? `شاهد كورس "${course.title}" على منصة Sami-Test` : ''

  const shareLinks = [
    { name: 'واتساب', color: 'bg-green-500 hover:bg-green-600', url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + courseUrl)}` },
    { name: 'تويتر', color: 'bg-sky-500 hover:bg-sky-600', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(courseUrl)}` },
    { name: 'فيسبوك', color: 'bg-blue-600 hover:bg-blue-700', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(courseUrl)}` },
    { name: 'تيليجرام', color: 'bg-sky-600 hover:bg-sky-700', url: `https://t.me/share/url?url=${encodeURIComponent(courseUrl)}&text=${encodeURIComponent(shareText)}` },
  ]

  const handleCopyLink = () => {
    navigator.clipboard.writeText(courseUrl)
    setCopied(true)
    toast.success('تم نسخ الرابط!')
    setTimeout(() => setCopied(false), 2000)
  }

  const avgRating = useMemo(() => {
    if (!course?.ratings?.length) return 0
    return course.ratings.reduce((a, b: any) => a + b.value, 0) / course.ratings.length
  }, [course?.ratings])

  if (isLoading) return <div className="flex justify-center p-20"><LoadingSpinner /></div>
  if (!course) return <div className="text-center p-20 font-bold">الكورس غير موجود</div>

  return (
    <div className="min-h-screen bg-white dark:bg-[#050B1A] pb-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group rounded-[2.5rem] overflow-hidden bg-slate-900 aspect-video shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/5 group/video">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
            <VideoPlayer
              key={showIntro ? course.introVideoUrl : currentEpisode?.id}
              src={showIntro ? course.introVideoUrl : currentEpisode?.videoUrl || ''}
              poster={showIntro ? course.introThumbnailUrl : currentEpisode?.thumbnail || course.image}
              autoPlay={!showIntro}
              onEnded={handleVideoEnd}
              onTimeUpdate={(time) => {
                // Optional: handle duration progress save here
              }}
              qualities={(() => {
                const q = []
                if (showIntro) {
                    if (course.introVideoUrl) q.push({ label: 'أساسي', url: course.introVideoUrl })
                    if (course.videoUrl720) q.push({ label: '720p', url: course.videoUrl720 })
                    if (course.videoUrl1080) q.push({ label: '1080p', url: course.videoUrl1080 })
                } else if (currentEpisode) {
                    if (currentEpisode.videoUrl) q.push({ label: 'أساسي', url: currentEpisode.videoUrl })
                    if (currentEpisode.videoUrl720) q.push({ label: '720p', url: currentEpisode.videoUrl720 })
                    if (currentEpisode.videoUrl1080) q.push({ label: '1080p', url: currentEpisode.videoUrl1080 })
                }
                return q
              })()}
            />
            {!currentEpisode && !showIntro && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-20">
                <div className="text-center p-8 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md">
                   <Play className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
                   <p className="text-white font-black text-xl">اختر حلقة لبدء المشاهدة</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
                  {showIntro ? 'مقدمة الكورس' : currentEpisode?.title}
                </h1>
                <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
                  <span className="flex items-center gap-1.5"><Play className="w-4 h-4" /> {course.episodes.length} حلقة</span>
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    {course?.ratings?.length ? avgRating.toFixed(1) : 'جديد'}
                    <span className="text-xs opacity-60">({course?.ratings?.length || 0} تقييم)</span>
                  </span>
                </div>
              </div>
              {!isEnrolled && !isAdmin && (
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">سعر الكورس</p>
                  <p className="text-3xl font-black text-blue-500">{course.price} ر.س</p>
                </div>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-400 font-medium leading-loose text-lg">
              {showIntro ? course.description : currentEpisode?.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-200 dark:border-white/5">
              {!isEnrolled && !isAdmin && (
                <Link href={`/checkout?type=course&id=${course.id}`}>
                  <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg gap-2 shadow-xl shadow-blue-500/20">
                    اشترك الآن للوصول الكامل
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                className="h-14 px-8 rounded-2xl gap-2 font-black border-2 border-slate-200 dark:border-white/10"
                onClick={() => setShowSharePopup(true)}
              >
                <Share2 className="w-5 h-5" /> شارك الكورس
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 space-y-8">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-black">التعليقات والمناقشات</h2>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center font-black text-blue-500 shrink-0 overflow-hidden border border-white/10">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : user?.user_metadata?.full_name?.[0] || user?.email?.[0] || <User className="w-6 h-6" />}
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="اكتب تعليقك هنا..."
                  className="w-full bg-white dark:bg-[#0A1120] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px]"
                />
                <Button
                  onClick={handlePostComment}
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-8 font-bold gap-2"
                >
                  نشر التعليق
                </Button>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              {comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-4 group/comment">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0 overflow-hidden border border-white/5">
                    {comment.user.avatarUrl ? (
                      <img src={comment.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      comment.user.name?.[0] || comment.user.email?.[0] || 'U'
                    )}
                  </div>
                  <div className="flex-1 bg-white dark:bg-[#0A1120] border border-slate-200 dark:border-white/5 p-5 rounded-3xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm">{comment.user.name || 'مستخدم'}</span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(comment.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Episodes List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 sticky top-28">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-blue-500" /> محتوى الكورس
            </h3>

            <div className="space-y-3">
              {/* Intro Button */}
              {course.introVideoUrl && (
                <button
                  onClick={() => setShowIntro(true)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-3xl transition-all border group relative overflow-hidden",
                    showIntro
                      ? "bg-blue-600 border-transparent text-white shadow-xl shadow-blue-600/20"
                      : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-blue-500/50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 transition-all duration-300",
                    showIntro ? "bg-white/20 scale-110" : "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
                  )}>
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="font-black text-sm">مقدمة الكورس</p>
                    <p className={cn("text-[10px] font-bold opacity-60 uppercase", showIntro ? "text-white" : "text-blue-500")}>نبذة تعريفية</p>
                  </div>
                  {showIntro && <div className="absolute left-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              )}

              {/* Episodes Map */}
              {course.episodes.map((episode, idx) => {
                const isLocked = !episode.isFree && !isEnrolled && !isAdmin
                const isActive = currentEpisode?.id === episode.id && !showIntro

                return (
                  <button
                    key={episode.id}
                    onClick={() => handleEpisodeSelect(episode)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group relative overflow-hidden text-right",
                      isActive
                        ? "bg-blue-600/10 border-blue-500/50 text-blue-500 dark:text-blue-400"
                        : "bg-white dark:bg-slate-900/40 border-slate-100 dark:border-white/5 hover:border-blue-500/30",
                      isLocked && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-full" />}
                    
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/5">
                      <img
                        src={episode.thumbnail || course.image}
                        alt=""
                        className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-white" />
                        ) : (
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-all", isActive ? "bg-blue-500 shadow-lg shadow-blue-500/40" : "bg-white/20 group-hover:bg-blue-500")}>
                            <Play className={cn("w-3 h-3 fill-current", isActive || "text-white")} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-blue-500" : "text-slate-400")}>الحلقة {idx + 1}</span>
                      </div>
                      <p className="font-black text-sm md:text-base truncate leading-tight group-hover:text-blue-500 transition-colors">{episode.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                         {episode.duration && (
                           <div className="flex items-center gap-1">
                             <div className="w-1 h-1 rounded-full bg-slate-400" />
                             <p className="text-[10px] font-bold text-slate-500">{episode.duration}</p>
                           </div>
                         )}
                         {isActive && (
                           <div className="flex items-center gap-1.5 ml-auto">
                              <span className="text-[10px] font-black text-blue-500 animate-pulse">مشاهدة الآن</span>
                              <div className="flex gap-0.5"><div className="w-0.5 h-2 bg-blue-500 animate-bounce" style={{animationDelay:'0s'}}></div><div className="w-0.5 h-2 bg-blue-500 animate-bounce" style={{animationDelay:'0.1s'}}></div><div className="w-0.5 h-2 bg-blue-500 animate-bounce" style={{animationDelay:'0.2s'}}></div></div>
                           </div>
                         )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Rating Section */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h4 className="font-black text-sm">تقييم الكورس</h4>
                  <p className="text-[10px] font-bold text-slate-500">
                    {ratingData?.userRating ? 'تقييمك الحالي' : 'شاركنا رأيك ليستفيد الآخرون'}
                  </p>
                </div>
              </div>

              {ratingData?.userRating ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <div key={s} className="aspect-square flex-1 rounded-xl flex items-center justify-center bg-amber-500/10 border-2 border-amber-500">
                        <Star className={cn("w-5 h-5", s <= ratingData.userRating.value ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
                      </div>
                    ))}
                  </div>
                  {ratingData.userRating.comment && (
                    <p className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-white/5 p-3 rounded-xl">
                      "{ratingData.userRating.comment}"
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRatingPopup(true)}
                    className="text-blue-500 font-bold text-xs"
                  >
                    تعديل التقييم
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => openRatingPopup(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={cn(
                        "aspect-square rounded-xl transition-all group flex items-center justify-center border-2",
                        (hoverRating || 0) >= s
                          ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10"
                          : "bg-slate-100 dark:bg-white/5 border-transparent hover:border-amber-500/50"
                      )}
                    >
                      <Star className={cn(
                        "w-5 h-5 transition-colors",
                        (hoverRating || 0) >= s ? "text-amber-500 fill-amber-500" : "text-slate-400 group-hover:text-amber-500"
                      )} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rating Popup */}
      <AnimatePresence>
        {showRatingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRatingPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10 space-y-6"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">تقييم الكورس</h3>
                    <p className="text-xs font-bold text-slate-500">{course.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowRatingPopup(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Star Selection */}
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setRatingValue(s)}
                    className={cn(
                      "w-14 h-14 rounded-2xl transition-all flex items-center justify-center border-2",
                      ratingValue >= s
                        ? "bg-amber-500/10 border-amber-500 scale-110 shadow-lg shadow-amber-500/10"
                        : "bg-slate-100 dark:bg-white/5 border-transparent hover:border-amber-500/50 hover:scale-105"
                    )}
                  >
                    <Star className={cn(
                      "w-7 h-7 transition-colors",
                      ratingValue >= s ? "text-amber-500 fill-amber-500" : "text-slate-400"
                    )} />
                  </button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-amber-500">
                  {ratingValue === 1 && 'ضعيف'}
                  {ratingValue === 2 && 'مقبول'}
                  {ratingValue === 3 && 'جيد'}
                  {ratingValue === 4 && 'جيد جداً'}
                  {ratingValue === 5 && 'ممتاز!'}
                  {!ratingValue && 'اختر عدد النجوم'}
                </p>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">رأيك (اختياري)</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="اكتب رأيك في الكورس..."
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleSubmitRating}
                disabled={isSubmittingRating || !ratingValue}
                className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-lg gap-2 shadow-xl shadow-amber-500/20"
              >
                {isSubmittingRating ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
                {ratingData?.userRating ? 'تحديث التقييم' : 'إرسال التقييم'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Popup */}
      <AnimatePresence>
        {showSharePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSharePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-white/10 space-y-6"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-black text-lg">مشاركة الكورس</h3>
                </div>
                <button onClick={() => setShowSharePopup(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {shareLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "h-14 rounded-2xl text-white font-black flex items-center justify-center gap-2 transition-all active:scale-95",
                      link.color
                    )}
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full h-14 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl font-black flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-white/10"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                {copied ? 'تم النسخ!' : 'نسخ الرابط'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
