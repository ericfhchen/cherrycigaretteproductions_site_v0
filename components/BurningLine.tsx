'use client'

import { useEffect, useState, useRef } from 'react'
import { useSmokingContext } from './SmokingEffect'

interface BurningLineProps {
  progress: number // 0 to 1
  isAccelerating: boolean
  position?: 'fixed' | 'absolute'
  className?: string
  style?: React.CSSProperties
  isInitialized?: boolean
}

export default function BurningLine({ progress, isAccelerating, position = 'fixed', className = '', style, isInitialized = true }: BurningLineProps) {
  const { foregroundColor, burningLineElementRef, burningLineStyleRef } = useSmokingContext()
  const [widthPercent, setWidthPercent] = useState(100)
  const [hasStarted, setHasStarted] = useState(false)
  const [isNewAnimation, setIsNewAnimation] = useState(false)
  const prevProgressRef = useRef<number>(0)
  const elementRef = useRef<HTMLDivElement>(null)
  const lastDirectUpdateRef = useRef<number>(0)
  
  // Expose element and style refs to parent for direct DOM updates
  useEffect(() => {
    if (burningLineElementRef && elementRef.current) {
      (burningLineElementRef as React.MutableRefObject<HTMLDivElement | null>).current = elementRef.current
    }
    if (burningLineStyleRef && style) {
      (burningLineStyleRef as React.MutableRefObject<{ left: string; width: string } | null>).current = {
        left: style.left?.toString() || '0',
        width: style.width?.toString() || '0'
      }
    }
  }, [burningLineElementRef, burningLineStyleRef, style])

  useEffect(() => {
    if (!isInitialized || !style?.width) {
      // Don't update if not initialized or no style width yet
      return
    }

    // Detect when progress resets from 1 (or high) to 0 - this means a new animation started
    const detectedNewAnimation = prevProgressRef.current >= 0.9 && progress < 0.1
    
    prevProgressRef.current = progress

    if (!hasStarted || detectedNewAnimation) {
      // First render with valid style OR new animation - start at full width (100%) immediately
      if (detectedNewAnimation) {
        // Disable transition for instant fill
        setIsNewAnimation(true)
        setWidthPercent(100)
        setHasStarted(true)
        // Keep transition disabled and line at 100% for 1 second (burning will start after delay)
        // Don't sync with progress yet - wait for the 1 second delay to pass
        return // Exit early to keep line at 100%
      } else {
        // Initial render - start at full width
        setWidthPercent(100)
        setHasStarted(true)
        // On next frame, sync with actual progress
        requestAnimationFrame(() => {
          const newWidth = Math.max(0, 100 - progress * 100)
          setWidthPercent(newWidth)
        })
        return
      }
    }
    
    // Subsequent updates - animate based on progress
    // If isNewAnimation is true and progress is still 0, keep line at 100% (waiting for delay)
    if (isNewAnimation && progress === 0) {
      return // Keep line at 100% during the 1 second delay
    }
    
    // Once progress starts (after delay) or for normal updates, animate based on progress
    const newWidth = Math.max(0, 100 - progress * 100)
    setWidthPercent(newWidth)
    
    // Once progress starts increasing, re-enable transitions
    if (progress > 0 && isNewAnimation) {
      setIsNewAnimation(false)
    }
  }, [progress, isInitialized, hasStarted, style?.width])

  const positionClasses = position === 'fixed' ? 'fixed top-0' : 'absolute top-0'

  // If custom style is provided, calculate width based on the base width and progress
  let calculatedWidth: string
  if (style?.width) {
    // Extract numeric value from width string (e.g., "500px" -> 500)
    const baseWidth = parseFloat(style.width.toString())
    const actualWidth = (baseWidth * widthPercent) / 100
    calculatedWidth = `${actualWidth}px`
  } else {
    calculatedWidth = `${widthPercent}%`
  }

  // Disable transition on initial render or when starting a new animation (instant fill)
  const transition = (!hasStarted || isNewAnimation) ? 'none' : (isAccelerating ? 'width 0.1s linear' : 'width 0.3s ease-out')

  // Extract RGB values from foregroundColor for box shadow
  const getRGBValues = (color: string) => {
    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g)
      return match ? match.map(Number) : [214, 0, 0]
    }
    // For CSS variables, use default red RGB
    return [214, 0, 0]
  }
  const [r, g, b] = getRGBValues(foregroundColor)

  const finalStyle: React.CSSProperties = style 
    ? {
        ...style,
        width: calculatedWidth,
        height: '2px',
        backgroundColor: foregroundColor,
        transition: `${transition}, background-color 0.3s ease-out, box-shadow 0.3s ease-out`,
        // boxShadow: `0 0 4px rgba(${r}, ${g}, ${b}, 0.8), 0 0 8px rgba(${r}, ${g}, ${b}, 0.5)`,
        pointerEvents: 'none',
      }
    : {
        left: 0,
        width: calculatedWidth,
        height: '2px',
        backgroundColor: foregroundColor,
        transition: `${transition}, background-color 0.3s ease-out, box-shadow 0.3s ease-out`,
        boxShadow: `0 0 4px rgba(${r}, ${g}, ${b}, 0.8), 0 0 8px rgba(${r}, ${g}, ${b}, 0.5)`,
        pointerEvents: 'none',
      }

  return (
    <div
      ref={elementRef}
      className={`${positionClasses} z-[1000] ${className}`}
      style={finalStyle}
    />
  )
}

