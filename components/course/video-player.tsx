'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, Loader2, Volume1, Check
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
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const [showControls, setShowControls] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const [currentQuality, setCurrentQuality] = useState('Auto')
  const [activeSrc, setActiveSrc] = useState(src)
  
  const [showPlayAnimation, setShowPlayAnimation] = useState<'play' | 'pause' | null>(null)

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setActiveSrc(src)
    if (videoRef.current) {
        videoRef.current.load()
        if (autoPlay) {
            videoRef.current.play().catch(() => {})
        }
    }
  }, [src, autoPlay])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'arrowright':
          e.preventDefault()
          skip(10)
          break
        case 'arrowleft':
          e.preventDefault()
          skip(-10)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, isFullscreen, isMuted])

  const triggerCenterAnimation = (state: 'play' | 'pause') => {
    setShowPlayAnimation(state)
    if (playAnimationTimeoutRef.current) clearTimeout(playAnimationTimeoutRef.current)
    playAnimationTimeoutRef.current = setTimeout(() => setShowPlayAnimation(null), 500)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        triggerCenterAnimation('pause')
      } else {
        videoRef.current.play()
        triggerCenterAnimation('play')
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      onTimeUpdate?.(videoRef.current.currentTime)

      // Calculate buffered amount
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
        setBuffered(bufferedEnd)
      }
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
      if (isMuted && volume === 0) {
          setVolume(1)
          videoRef.current.volume = 1
      }
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
    }, 2500)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
      triggerCenterAnimation('play') // Just to flash the icon
    }
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x < rect.width / 2) {
      skip(-10)
    } else {
      skip(10)
    }
  }

  const changeQuality = (label: string, url: string) => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      const playing = !videoRef.current.paused
      setCurrentQuality(label)
      setActiveSrc(url)
      
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
      className="relative group bg-black md:rounded-2xl rounded-xl overflow-hidden aspect-video shadow-2xl border border-white/5 select-none w-full h-full flex items-center justify-center font-sans"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onDoubleClick={handleDoubleClick}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={onEnded}
      />

      {/* Buffering Indicator */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/10 z-20 pointer-events-none"
          >
            <Loader2 className="w-16 h-16 text-white animate-spin drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Play/Pause Flash Animation */}
      <AnimatePresence>
        {showPlayAnimation && !isBuffering && (
            <motion.div 
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
                <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    {showPlayAnimation === 'play' ? (
                        <Play className="w-10 h-10 text-white fill-white translate-x-1" />
                    ) : (
                        <Pause className="w-10 h-10 text-white fill-white" />
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* YouTube-style Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent z-30"
            onClick={(e) => e.stopPropagation()} // Prevent clicking controls from playing/pausing video
            dir="ltr"
          >
            <div className="w-full px-4 pb-2">
                {/* Progress Bar (YouTube Style) */}
                <div className="group/progress relative h-1.5 md:h-2 flex items-center cursor-pointer mb-2" 
                    onClick={(e) => {
                        if (videoRef.current && duration) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            videoRef.current.currentTime = pos * duration;
                        }
                    }}>
                    
                    {/* Hover hit area (invisible but larger for easier clicking) */}
                    <div className="absolute inset-y-[-10px] inset-x-0 z-10" />

                    {/* Background track */}
                    <div className="absolute inset-x-0 h-1 md:h-1.5 bg-white/20 group-hover/progress:h-1.5 md:group-hover/progress:h-2 transition-all rounded-full" />
                    
                    {/* Buffered track */}
                    <div 
                        className="absolute left-0 h-1 md:h-1.5 bg-white/40 group-hover/progress:h-1.5 md:group-hover/progress:h-2 transition-all rounded-full" 
                        style={{ width: `${(buffered / duration) * 100}%` }}
                    />
                    
                    {/* Red progress track */}
                    <div 
                        className="absolute left-0 h-1 md:h-1.5 bg-[#ff0000] group-hover/progress:h-1.5 md:group-hover/progress:h-2 transition-all rounded-full" 
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    
                    {/* Scrubber thumb */}
                    <div 
                        className="absolute h-3 w-3 md:h-4 md:w-4 bg-[#ff0000] rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-md z-20 pointer-events-none"
                        style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
                    />
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between mt-1">
                {/* Left side: Play, Volume, Time */}
                <div className="flex items-center gap-2 md:gap-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        className="text-white hover:text-white/80 transition-colors p-1 md:p-2"
                    >
                    {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
                    </button>

                    <div className="flex items-center gap-1 group/volume">
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }} 
                            className="text-white hover:text-white/80 transition-colors p-1 md:p-2"
                        >
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : volume < 0.5 ? <Volume1 className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
                        </button>
                        <div className="w-0 group-hover/volume:w-16 md:group-hover/volume:w-20 overflow-hidden transition-all duration-300 flex items-center" onClick={e => e.stopPropagation()}>
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                max={1}
                                step={0.01}
                                onValueChange={handleVolumeChange}
                                className="w-16 md:w-20 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="text-white text-xs md:text-sm font-medium tracking-wide">
                        <span>{formatTime(currentTime)}</span>
                        <span className="text-white/50 mx-1">/</span>
                        <span className="text-white/80">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Right side: Settings, Fullscreen */}
                <div className="flex items-center gap-1 md:gap-3">
                    {/* Quality Selector (Settings Icon) */}
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="text-white hover:text-white/80 transition-colors p-1 md:p-2">
                            <Settings className="w-4 h-4 md:w-5 md:h-5 hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-black/90 backdrop-blur-md border-white/10 text-white min-w-[150px] rounded-xl p-2 mb-2" align="end" onClick={e => e.stopPropagation()}>
                        <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 mb-1 px-3">الجودة (Quality)</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={() => { setActiveSrc(src); setCurrentQuality('Auto') }}
                            className={cn("rounded-lg cursor-pointer flex items-center justify-between py-2 focus:bg-white/10", currentQuality === 'Auto' && "text-[#ff0000]")}
                        >
                        <span className="font-bold text-xs">تلقائي (Auto)</span>
                        {currentQuality === 'Auto' && <Check className="w-4 h-4" />}
                        </DropdownMenuItem>
                        
                        {qualities.length > 0 && (
                            qualities.map(q => (
                                <DropdownMenuItem 
                                    key={q.label}
                                    onClick={() => changeQuality(q.label, q.url)}
                                    className={cn("rounded-lg cursor-pointer flex items-center justify-between py-2 focus:bg-white/10", currentQuality === q.label && "text-[#ff0000]")}
                                >
                                    <span className="font-bold text-xs">{q.label}</span>
                                    {currentQuality === q.label && <Check className="w-4 h-4" />}
                                </DropdownMenuItem>
                            ))
                        )}

                        <DropdownMenuSeparator className="bg-white/10 my-2" />
                        <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 mb-1 px-3">السرعة (Speed)</DropdownMenuLabel>
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => (
                            <DropdownMenuItem 
                                key={speed}
                                onClick={() => {
                                    if (videoRef.current) {
                                        videoRef.current.playbackRate = speed
                                        setPlaybackSpeed(speed)
                                    }
                                }}
                                className={cn("rounded-lg cursor-pointer flex items-center justify-between py-1.5 focus:bg-white/10", playbackSpeed === speed && "text-[#ff0000]")}
                            >
                                <span className="font-bold text-xs">{speed === 1 ? 'العادي (Normal)' : speed}</span>
                                {playbackSpeed === speed && <Check className="w-4 h-4" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                    </DropdownMenu>

                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                        className="text-white hover:text-white/80 transition-colors p-1 md:p-2"
                    >
                    {isFullscreen ? <Minimize className="w-5 h-5 md:w-6 md:h-6" /> : <Maximize className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>
                </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
