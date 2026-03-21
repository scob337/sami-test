'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, RotateCcw, FastForward, Rewind, 
  ChevronRight, Check, Loader2, Volume1, SkipForward, SkipBack
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  poster?: string
  qualities?: { label: string; url: string }[]
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number) => void
  autoPlay?: boolean
}

export function VideoPlayer({ 
  src, 
  poster, 
  qualities = [], 
  onEnded, 
  onTimeUpdate,
  autoPlay = false 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const [currentQuality, setCurrentQuality] = useState('Auto')
  const [activeSrc, setActiveSrc] = useState(src)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setActiveSrc(src)
    if (videoRef.current) {
        videoRef.current.load()
        if (autoPlay) {
            videoRef.current.play().catch(() => {})
        }
    }
  }, [src, autoPlay])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      onTimeUpdate?.(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  const changeQuality = (label: string, url: string) => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      const playing = !videoRef.current.paused
      setCurrentQuality(label)
      setActiveSrc(url)
      
      // We need to wait for the next render or use a small timeout to load the new src
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = time
          if (playing) videoRef.current.play()
        }
      }, 50)
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative group bg-black rounded-[2rem] overflow-hidden aspect-video shadow-2xl border border-white/5 select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={onEnded}
        onClick={togglePlay}
      />

      {/* Buffering Indicator */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-20 pointer-events-none"
          >
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Play/Pause animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <AnimatePresence>
            {!isPlaying && !isBuffering && (
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    className="w-20 h-20 rounded-full bg-blue-600/80 text-white flex items-center justify-center backdrop-blur-md shadow-2xl border border-white/20"
                >
                    <Play className="w-10 h-10 fill-current translate-x-1" />
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-30"
          >
            {/* Top Bar (Optional, can add title here) */}
            
            {/* Progress Bar */}
            <div className="group/progress relative mb-4">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[10px] font-black text-white/70 tracking-tighter">
                    {formatTime(currentTime)}
                </span>
                <span className="text-[10px] font-black text-white/70 tracking-tighter">
                    {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                </button>

                <div className="flex items-center gap-2">
                    <button onClick={() => skip(-10)} className="text-white/60 hover:text-white transition-colors p-2">
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button onClick={() => skip(10)} className="text-white/60 hover:text-white transition-colors p-2 rotate-180">
                        <RotateCcw className="w-5 h-5 scale-x-[-1]" />
                    </button>
                </div>

                <div className="flex items-center gap-2 group/volume ml-4">
                  <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors p-2">
                    {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : volume < 0.5 ? <Volume1 className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                  <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Quality Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-black backdrop-blur-sm border border-white/10 flex items-center gap-2 transition-all">
                      <Settings className="w-4 h-4 text-blue-400" />
                      {currentQuality}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-900 border-white/10 text-white min-w-[120px] rounded-2xl p-2" align="end">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-500 mb-1 px-3">الجودة</DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={() => { setActiveSrc(src); setCurrentQuality('Auto') }}
                      className={cn("rounded-xl cursor-not-allowed opacity-50 flex items-center justify-between", currentQuality === 'Auto' && "bg-blue-600/20 text-blue-400")}
                    >
                      <span className="font-bold text-sm">تلقائي</span>
                      {currentQuality === 'Auto' && <Check className="w-4 h-4" />}
                    </DropdownMenuItem>
                    
                    {qualities.length > 0 ? (
                        qualities.map(q => (
                            <DropdownMenuItem 
                                key={q.label}
                                onClick={() => changeQuality(q.label, q.url)}
                                className={cn("rounded-xl p-3 flex items-center justify-between", currentQuality === q.label && "bg-blue-600/20 text-blue-400")}
                            >
                                <span className="font-bold text-sm">{q.label}</span>
                                {currentQuality === q.label && <Check className="w-4 h-4" />}
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <DropdownMenuItem className="rounded-xl flex items-center justify-between bg-blue-600/20 text-blue-400">
                            <span className="font-bold text-sm">HD</span>
                            <Check className="w-4 h-4" />
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-500 mb-1 px-3 mt-2">السرعة</DropdownMenuLabel>
                    {[0.5, 1, 1.25, 1.5, 2].map(speed => (
                        <DropdownMenuItem 
                            key={speed}
                            onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.playbackRate = speed
                                    setPlaybackSpeed(speed)
                                }
                            }}
                            className={cn("rounded-xl p-3 flex items-center justify-between", playbackSpeed === speed && "bg-blue-600/20 text-blue-400")}
                        >
                            <span className="font-bold text-sm">{speed}x</span>
                            {playbackSpeed === speed && <Check className="w-4 h-4" />}
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <button 
                  onClick={toggleFullscreen}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center backdrop-blur-sm transition-all active:scale-95"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
