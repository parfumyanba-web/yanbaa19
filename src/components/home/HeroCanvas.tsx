'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

const HeroCanvas = () => {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadedCount, setLoadedCount] = useState(0)
  const [isCriticalLoaded, setIsCriticalLoaded] = useState(false)
  const lastDrawnIndex = useRef<number>(-1)
  
  const totalFrames = 240
  const keyframeInterval = 8 // Load every 8th frame first for rough animation
  
  // Connect scroll to container distance
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Frame calculation based on scroll (1 to totalFrames)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, totalFrames])
  
  // Text Animation Transforms
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.3], [0, 1, 1, 0])
  const titleY = useTransform(scrollYProgress, [0, 0.2], [40, 0])
  
  const subtitleOpacity = useTransform(scrollYProgress, [0.05, 0.15, 0.25, 0.35], [0, 1, 1, 0])
  const subtitleY = useTransform(scrollYProgress, [0.05, 0.25], [30, 0])

  const feature1Opacity = useTransform(scrollYProgress, [0.4, 0.5, 0.6, 0.7], [0, 1, 1, 0])
  const feature1Y = useTransform(scrollYProgress, [0.4, 0.6], [50, 0])

  const feature2Opacity = useTransform(scrollYProgress, [0.75, 0.85, 0.95], [0, 1, 1])
  const feature2Y = useTransform(scrollYProgress, [0.75, 0.95], [50, 0])

  // Helper to find nearest loaded frame to avoid flickering to frame 0
  const getNearestLoadedFrame = useCallback((index: number) => {
    if (imagesRef.current[index]) return imagesRef.current[index]
    
    // Search outwards from the target index
    for (let offset = 1; offset < totalFrames / 2; offset++) {
      const prev = index - offset
      const next = index + offset
      
      if (prev >= 0 && imagesRef.current[prev]) return imagesRef.current[prev]
      if (next < totalFrames && imagesRef.current[next]) return imagesRef.current[next]
    }
    
    return imagesRef.current[0] // Last resort
  }, [totalFrames])

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return

    const img = getNearestLoadedFrame(index)
    if (!img) return

    // Cache dimensions to avoid recalculating on every scroll if possible
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const imgWidth = img.width
    const imgHeight = img.height

    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight)
    const x = (canvasWidth / 2) - (imgWidth / 2) * scale
    const y = (canvasHeight / 2) - (imgHeight / 2) * scale

    context.drawImage(img, x, y, imgWidth * scale, imgHeight * scale)
    lastDrawnIndex.current = index
  }, [getNearestLoadedFrame])

  // Reactive Rendering: Only draw when frameIndex moves to a new integer
  useMotionValueEvent(frameIndex, "change", (latest) => {
    const index = Math.floor(latest) - 1
    if (index !== lastDrawnIndex.current && !isLoading) {
      drawFrame(index)
    }
  })

  // Preload images with priority
  useEffect(() => {
    let active = true
    imagesRef.current = new Array(totalFrames).fill(null)
    
    const loadImage = (i: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.src = `/frames/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`
        img.onload = () => {
          if (active) {
            imagesRef.current[i - 1] = img
            setLoadedCount(prev => prev + 1)
          }
          resolve()
        }
        img.onerror = () => resolve()
      })
    }

    const loadSequence = async () => {
      // 1. Load the very first frame (Hero start)
      await loadImage(1)
      if (active) drawFrame(0)

      // 2. Load Keyframes (every Nth frame) for base trajectory
      const keyframes = []
      for (let i = 1; i <= totalFrames; i += keyframeInterval) {
        if (i === 1) continue
        keyframes.push(loadImage(i))
      }
      
      // Load enough to show initial interaction
      const criticalPoint = Math.floor(keyframes.length * 0.4)
      await Promise.all(keyframes.slice(0, criticalPoint))
      
      if (active) {
        setIsCriticalLoaded(true)
        setIsLoading(false)
      }

      // 3. Load remaining keyframes then fill all gaps
      await Promise.all(keyframes.slice(criticalPoint))
      
      const remaining = []
      for (let i = 1; i <= totalFrames; i++) {
        if (!imagesRef.current[i - 1]) {
          remaining.push(loadImage(i))
        }
      }
      await Promise.all(remaining)
    }

    loadSequence()
    return () => { active = false }
  }, [totalFrames, drawFrame])

  // Responsive Resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
      if (lastDrawnIndex.current !== -1) {
        drawFrame(lastDrawnIndex.current)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawFrame])

  return (
    <div ref={containerRef} className="relative h-[350vh] sm:h-[400vh] md:h-[500vh] w-full bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Cinematic Noise Overlay */}
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03] noise-overlay" />
        
        {/* Soft Ambient Glow */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60" />

        <canvas
          ref={canvasRef}
          className="h-full w-full grayscale brightness-[0.8] contrast-[1.1] transition-opacity duration-1000"
          style={{ opacity: isLoading ? 0 : 1 }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-black">
             <div className="flex flex-col items-center gap-2">
                <h2 className="text-gold text-xs tracking-[0.5em] uppercase font-bold animate-pulse">{t('loading')}</h2>
                <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     className="h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]" 
                     initial={{ width: 0 }}
                     animate={{ width: `${(loadedCount / (totalFrames / keyframeInterval * 0.4)) * 100}%` }}
                   />
                </div>
             </div>
             <div className="w-12 h-12 border border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        )}

        {/* Scroll-Synced Luxury Content */}
        <div className="absolute inset-0 z-[2] pointer-events-none flex flex-col items-center justify-center">
          
          <motion.div style={{ opacity: titleOpacity, y: titleY }} className="flex flex-col items-center gap-4 px-8 md:px-6 text-center">
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-arabic gold-text-gradient drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-tight">{t('hero_title')}</h1>
            <p className="text-xs sm:text-xl md:text-3xl text-white/60 tracking-[0.3em] md:tracking-[0.4em] uppercase font-light drop-shadow-lg">{t('hero_subtitle')}</p>
          </motion.div>

          <motion.div style={{ opacity: feature1Opacity, y: feature1Y }} className="absolute flex flex-col items-center gap-4 md:gap-6 px-10 md:px-6 text-center max-w-4xl">
            <span className="text-gold text-[9px] md:text-xs font-bold tracking-[0.5em] uppercase">{t('new_arrivals')}</span>
            <h2 className="text-4xl md:text-7xl font-arabic text-white drop-shadow-2xl">{t('quality_title')}</h2>
            <p className="text-sm md:text-xl text-white/40 font-light leading-relaxed max-w-2xl">{t('quality_desc')}</p>
          </motion.div>

          <motion.div style={{ opacity: feature2Opacity, y: feature2Y }} className="absolute flex flex-col items-center gap-6 md:gap-8 px-8 md:px-6 text-center">
            <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-gold to-transparent" />
            <h2 className="text-4xl md:text-8xl font-arabic gold-text-gradient drop-shadow-2xl">{t('luxury_collection')}</h2>
            <div className="flex gap-4">
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold animate-pulse" />
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold/50 animate-pulse delay-75" />
               <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold/20 animate-pulse delay-150" />
            </div>
          </motion.div>
          
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
             <motion.div style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }} className="flex flex-col items-center gap-4 animate-bounce">
                <span className="text-[10px] tracking-[0.5em] uppercase font-black text-gold/50">{t('scroll_explore')}</span>
                <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
             </motion.div>
             
             <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gold" style={{ scaleX: scrollYProgress, originX: 0 }} />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroCanvas
