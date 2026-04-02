'use client'

import React, { useEffect, useRef, useState } from 'react'

const HeroCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [images, setImages] = useState<HTMLImageElement[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const totalFrames = 240

  // Preload images
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = []
    let loadedCount = 0

    const preloadImages = () => {
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image()
        img.src = `/frames/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`
        img.onload = () => {
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

  // Draw current frame
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || images.length === 0) return

    const context = canvas.getContext('2d')
    if (!context) return

    const img = images[currentFrame]
    if (!img) return

    // Scale to cover
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const imgWidth = img.width
    const imgHeight = img.height

    const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight)
    const x = (canvasWidth / 2) - (imgWidth / 2) * scale
    const y = (canvasHeight / 2) - (imgHeight / 2) * scale

    context.clearRect(0, 0, canvasWidth, canvasHeight)
    context.drawImage(img, x, y, imgWidth * scale, imgHeight * scale)
  }, [currentFrame, images])

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
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
          <h1 className="text-5xl md:text-8xl font-arabic gold-text-gradient mb-4 animate-fade-in">
            ينبع للعطور
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl font-light tracking-widest uppercase animate-slide-up">
            Elite B2B Fragrance Experience
          </p>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
            <span className="text-xs tracking-widest uppercase">Scroll to Explore</span>
            <div className="w-px h-12 bg-gold" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroCanvas
