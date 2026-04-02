'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

const HeroCanvas = () => {
  const { t } = useLanguage()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const totalFrames = 240
  const [firstImage, setFirstImage] = useState<HTMLImageElement | null>(null)

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = []
    let loadedCount = 0

    const preloadImages = () => {
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image()
        img.src = `/frames/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`
        img.onload = () => {
          if (i === 1) setFirstImage(img)
          loadedCount++
          if (loadedCount === totalFrames) {
            setImages(loadedImages)
          }
        }
        loadedImages.push(img)
      }
    }

    preloadImages()
  }, [])

  // Handle scroll and draw
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollFraction = scrollY / maxScroll
      const frameIndex = Math.min(
        totalFrames - 1,
        Math.floor(scrollFraction * totalFrames)
      )
      
      setCurrentFrame(frameIndex)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const drawFrame = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, img: HTMLImageElement) => {
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const imgWidth = img.width
    const imgHeight = img.height

    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight)
    const x = (canvasWidth / 2) - (imgWidth / 2) * scale
    const y = (canvasHeight / 2) - (imgHeight / 2) * scale

    context.clearRect(0, 0, canvasWidth, canvasHeight)
    context.drawImage(img, x, y, imgWidth * scale, imgHeight * scale)
  }

  // Draw current frame
  useEffect(() => {
    const canvas = canvasRef.current
    const img = images[currentFrame] || firstImage
    if (!canvas || !img) return

    const context = canvas.getContext('2d')
    if (!context) return

    drawFrame(canvas, context, img)
  }, [currentFrame, images, firstImage])

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Re-draw immediately after resize
      if (images.length > 0 || firstImage) {
        const context = canvas.getContext('2d')
        const img = images[currentFrame] || firstImage
        if (context && img) drawFrame(canvas, context, img)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative h-[400vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover grayscale brightness-75 contrast-125"
        />
        
        {/* Luxury Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/30 pointer-events-none">
          <h1 className="text-5xl md:text-8xl font-arabic gold-text-gradient mb-4 animate-fade-in drop-shadow-2xl">
            {t('hero_title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl font-light tracking-[0.3em] uppercase animate-slide-up">
            {t('hero_subtitle')}
          </p>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-50">
            <span className="text-[10px] tracking-[0.5em] uppercase font-bold text-gold">{t('scroll_explore')}</span>
            <div className="w-px h-16 bg-gradient-to-b from-gold to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroCanvas
