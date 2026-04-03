'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { motion, useScroll, useTransform } from 'framer-motion'

const HeroCanvas = () => {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const totalFrames = 240
  
  // Connect scroll to container distance
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Frame calculation based on scroll
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

  // Preload images with Promise.all for speed and stability
  useEffect(() => {
    let active = true
    
    const loadImages = async () => {
      const promises = []
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image()
        img.src = `/frames/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`
        promises.push(new Promise((resolve) => {
          img.onload = () => resolve(img)
          img.onerror = () => resolve(null) // Continue even if one fails
        }))
      }
      
      const loaded = await Promise.all(promises)
      if (active) {
        setImages(loaded.filter(Boolean) as HTMLImageElement[])
        setIsLoading(false)
      }
    }

    loadImages()
    return () => { active = false }
  }, [])

  // Canvas Drawing using requestAnimationFrame for 60fps
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) return

    const context = canvas.getContext('2d', { alpha: false })
    if (!context) return

    let renderId: number

    const render = () => {
      const index = Math.floor(frameIndex.get()) - 1
      const img = images[index] || images[0]
      
      if (img) {
        const canvasWidth = canvas.width
        const canvasHeight = canvas.height
        const imgWidth = img.width
        const imgHeight = img.height

        // Calculate object-fit: cover logic
        const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight)
        const x = (canvasWidth / 2) - (imgWidth / 2) * scale
        const y = (canvasHeight / 2) - (imgHeight / 2) * scale

        context.drawImage(img, x, y, imgWidth * scale, imgHeight * scale)
      }
      renderId = requestAnimationFrame(render)
    }

    renderId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(renderId)
  }, [images, frameIndex])

  // Responsive Resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div ref={containerRef} className="relative h-[500vh] w-full bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="h-full w-full grayscale brightness-75 contrast-125 transition-opacity duration-1000"
          style={{ opacity: isLoading ? 0 : 1 }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        )}

        {/* Scroll-Synced Luxury Content */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
          
          {/* Phase 1: Main Title */}
          <motion.div 
            style={{ opacity: titleOpacity, y: titleY }}
            className="flex flex-col items-center gap-4 px-6 text-center"
          >
            <h1 className="text-6xl md:text-9xl font-arabic gold-text-gradient drop-shadow-2xl">
              {t('hero_title')}
            </h1>
            <p className="text-xl md:text-3xl text-white/60 tracking-[0.4em] uppercase font-light">
              {t('hero_subtitle')}
            </p>
          </motion.div>

          {/* Phase 2: Quality Focus */}
          <motion.div 
            style={{ opacity: feature1Opacity, y: feature1Y }}
            className="absolute flex flex-col items-center gap-6 px-6 text-center max-w-4xl"
          >
            <span className="text-gold text-xs font-bold tracking-[0.5em] uppercase">{t('new_arrivals')}</span>
            <h2 className="text-4xl md:text-7xl font-arabic text-white drop-shadow-lg">
              {t('quality_title')}
            </h2>
            <p className="text-lg md:text-xl text-white/40 font-light leading-relaxed">
              {t('quality_desc')}
            </p>
          </motion.div>

          {/* Phase 3: Brand Promise */}
          <motion.div 
            style={{ opacity: feature2Opacity, y: feature2Y }}
            className="absolute flex flex-col items-center gap-8 px-6 text-center"
          >
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-gold to-transparent" />
            <h2 className="text-5xl md:text-8xl font-arabic gold-text-gradient">
              {t('luxury_collection')}
            </h2>
            <div className="flex gap-4">
               <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
               <div className="w-2 h-2 rounded-full bg-gold/50 animate-pulse delay-75" />
               <div className="w-2 h-2 rounded-full bg-gold/20 animate-pulse delay-150" />
            </div>
          </motion.div>
          
          {/* Constant Progress Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
             <motion.div 
               style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
               className="flex flex-col items-center gap-4 animate-bounce"
             >
                <span className="text-[10px] tracking-[0.5em] uppercase font-black text-gold/50">{t('scroll_explore')}</span>
                <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
             </motion.div>
             
             {/* Progress Bar */}
             <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gold"
                  style={{ scaleX: scrollYProgress, originX: 0 }}
                />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroCanvas

