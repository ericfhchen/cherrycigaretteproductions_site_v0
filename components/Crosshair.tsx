'use client'

import { useEffect, useState } from 'react'
import { useSmokingContext } from './SmokingEffect'

interface CrosshairProps {
  isActive: boolean
}

export default function Crosshair({ isActive }: CrosshairProps) {
  const { foregroundColor } = useSmokingContext()
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  })

  // Hide/show default cursor based on isActive
  useEffect(() => {
    if (isActive) {
      // Hide the default cursor using both inline styles and class
      document.body.style.cursor = 'none'
      document.documentElement.style.cursor = 'none'
      document.body.classList.add('cursor-none')
      document.documentElement.classList.add('cursor-none')
    } else {
      // Restore default cursor
      document.body.style.cursor = ''
      document.documentElement.style.cursor = ''
      document.body.classList.remove('cursor-none')
      document.documentElement.classList.remove('cursor-none')
    }

    return () => {
      // Cleanup: restore cursor when component unmounts
      document.body.style.cursor = ''
      document.documentElement.style.cursor = ''
      document.body.classList.remove('cursor-none')
      document.documentElement.classList.remove('cursor-none')
    }
  }, [isActive])

  // Always set up dimensions listener
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }

    // Set dimensions immediately
    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Always track mouse/touch position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseDown = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        setPosition({ x: touch.clientX, y: touch.clientY })
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        setPosition({ x: touch.clientX, y: touch.clientY })
      }
    }

    // Use capture phase to catch events early
    window.addEventListener('mousedown', handleMouseDown, true)
    window.addEventListener('mousemove', handleMouseMove, true)
    window.addEventListener('touchstart', handleTouchStart, { passive: true, capture: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true, capture: true })

    return () => {
      window.removeEventListener('mousedown', handleMouseDown, true)
      window.removeEventListener('mousemove', handleMouseMove, true)
      window.removeEventListener('touchstart', handleTouchStart, true)
      window.removeEventListener('touchmove', handleTouchMove, true)
    }
  }, [])

  // When isActive becomes true, try to get current mouse position
  useEffect(() => {
    if (isActive && position.x === 0 && position.y === 0 && dimensions.width > 0 && dimensions.height > 0) {
      // If position is still (0,0), set a default center position
      // This ensures the crosshair is visible even if mouse hasn't moved
      setPosition({ 
        x: dimensions.width / 2, 
        y: dimensions.height / 2 
      })
    }
  }, [isActive, dimensions.width, dimensions.height])

  // Debug logging (remove in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Crosshair state:', { 
        isActive, 
        dimensions, 
        position, 
        willRender: isActive && dimensions.width > 0 && dimensions.height > 0 
      })
    }
  }, [isActive, dimensions, position])

  // Don't render if not active or dimensions not ready
  if (!isActive || dimensions.width === 0 || dimensions.height === 0) {
    return null
  }

  // Calculate cross size based on viewport height (e.g., 20vh = 20% of viewport height)
  const crossSizeVh = 40 // Percentage of viewport height (adjust this value as needed)
  const crossSize = (dimensions.height * crossSizeVh) / 100
  const crossHalf = crossSize / 2
  // Get 1rem in pixels to match grid gap
  const remInPixels = typeof window !== 'undefined' 
    ? parseFloat(getComputedStyle(document.documentElement).fontSize) 
    : 16
  const extensionGap = remInPixels // 1rem to match grid gap
  // Round positions to avoid sub-pixel rendering issues
  const x = Math.round(position.x)
  const y = Math.round(position.y)
  const { width, height } = dimensions

  // Center cross - always crossSize x crossSize, can overflow screen edges
  // Vertical line of the cross (crossHalf above + crossHalf below cursor)
  const centerVerticalTop = y - crossHalf
  const centerVerticalHeight = crossSize

  // Horizontal line of the cross (crossHalf left + crossHalf right of cursor)
  const centerHorizontalLeft = x - crossHalf
  const centerHorizontalWidth = crossSize

  // Extension lines - from (crossHalf + extensionGap) to screen edges
  // Top extension: from (y - crossHalf - extensionGap) to top edge (0)
  const topExtensionStart = y - crossHalf - extensionGap
  const topExtensionHeight = Math.max(0, topExtensionStart)

  // Right extension: from (x + crossHalf + extensionGap) to right edge (width)
  const rightExtensionStart = x + crossHalf + extensionGap
  const rightExtensionWidth = Math.max(0, width - rightExtensionStart)

  // Bottom extension: from (y + crossHalf + extensionGap) to bottom edge (height)
  const bottomExtensionStart = y + crossHalf + extensionGap
  const bottomExtensionHeight = Math.max(0, height - bottomExtensionStart)

  // Left extension: from (x - crossHalf - extensionGap) to left edge (0)
  const leftExtensionStart = x - crossHalf - extensionGap
  const leftExtensionWidth = Math.max(0, leftExtensionStart)

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Center cross - vertical line */}
      <div
        className="absolute"
        style={{
          left: `${x}px`,
          top: `${centerVerticalTop}px`,
          width: '1px',
          height: `${centerVerticalHeight}px`,
          backgroundColor: foregroundColor,
          transform: 'translateX(-50%)',
        }}
      />

      {/* Center cross - horizontal line */}
      <div
        className="absolute"
        style={{
          left: `${centerHorizontalLeft}px`,
          top: `${y}px`,
          width: `${centerHorizontalWidth}px`,
          height: '1px',
          backgroundColor: foregroundColor,
          transform: 'translateY(-50%)',
        }}
      />

      {/* Top extension line */}
      {topExtensionHeight > 0 && (
        <div
          className="absolute"
          style={{
            left: `${x}px`,
            top: '0px',
            width: '1px',
            height: `${topExtensionHeight}px`,
            backgroundColor: foregroundColor,
            transform: 'translateX(-50%)',
          }}
        />
      )}

      {/* Right extension line */}
      {rightExtensionWidth > 0 && (
        <div
          className="absolute"
          style={{
            left: `${rightExtensionStart}px`,
            top: `${y}px`,
            width: `${rightExtensionWidth}px`,
            height: '1px',
            backgroundColor: foregroundColor,
            transform: 'translateY(-50%)',
          }}
        />
      )}

      {/* Bottom extension line */}
      {bottomExtensionHeight > 0 && (
        <div
          className="absolute"
          style={{
            left: `${x}px`,
            top: `${bottomExtensionStart}px`,
            width: '1px',
            height: `${bottomExtensionHeight}px`,
            backgroundColor: foregroundColor,
            transform: 'translateX(-50%)',
          }}
        />
      )}

      {/* Left extension line */}
      {leftExtensionWidth > 0 && (
        <div
          className="absolute"
          style={{
            left: '0px',
            top: `${y}px`,
            width: `${leftExtensionWidth}px`,
            height: '1px',
            backgroundColor: foregroundColor,
            transform: 'translateY(-50%)',
          }}
        />
      )}
    </div>
  )
}

