'use client'

import { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react'
import BurningLine from './BurningLine'
import Crosshair from './Crosshair'

interface SmokingEffectProps {
  duration: number // in seconds
  burnAccelerationFactor?: number // acceleration multiplier when holding mouse
  children: React.ReactNode
}

type AnimationState = 'initial' | 'smoking' | 'complete' | 'resetting' | 'prompt'

interface SmokingContextType {
  progress: number
  isAccelerating: boolean
  foregroundColor: string
  burningLineElementRef: React.RefObject<HTMLDivElement> | null
  burningLineStyleRef: React.MutableRefObject<{ left: string; width: string } | null>
}

const SmokingContext = createContext<SmokingContextType | null>(null)

export const useSmokingContext = () => {
  const context = useContext(SmokingContext)
  if (!context) {
    throw new Error('useSmokingContext must be used within SmokingEffect')
  }
  return context
}

export default function SmokingEffect({ duration, burnAccelerationFactor = 3, children }: SmokingEffectProps) {
  const [progress, setProgress] = useState(0) // 0 to 1
  const [state, setState] = useState<AnimationState>('initial')
  const [isAccelerating, setIsAccelerating] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const [redRValue, setRedRValue] = useState(214) // Default value, will be read from CSS variable
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(0)
  const accelerationStartRef = useRef<number | null>(null)
  const progressAtAccelerationRef = useRef<number>(0)
  const isAcceleratingRef = useRef<boolean>(false)
  const stateRef = useRef<AnimationState>('initial')
  const progressRef = useRef<number>(0)
  const burningLineElementRef = useRef<HTMLDivElement | null>(null)
  const burningLineStyleRef = useRef<{ left: string; width: string } | null>(null)

  // Read the red RGB component from CSS variable
  useEffect(() => {
    const root = document.documentElement
    const redR = getComputedStyle(root).getPropertyValue('--color-red-r').trim()
    if (redR) {
      setRedRValue(parseInt(redR, 10))
    }
  }, [])

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Keep progressRef in sync with progress
  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  // Store the animation function in a ref to prevent recreation
  const animateFunctionRef = useRef<(() => void) | null>(null)
  const durationRef = useRef(duration)
  const accelerationFactorRef = useRef(burnAccelerationFactor)
  
  // Update duration ref when it changes
  useEffect(() => {
    durationRef.current = duration
  }, [duration])
  
  // Update acceleration factor ref when it changes
  useEffect(() => {
    accelerationFactorRef.current = burnAccelerationFactor
  }, [burnAccelerationFactor])

  // Create the animation function - this should only be created once per animation start
  const createAnimateFunction = useCallback(() => {
    // Cancel any existing animation to prevent duplicates
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = undefined
    }
    
    let frameCount = 0
    const animate = () => {
      frameCount++
      
      // Check if animation should continue (state might have changed)
      const currentState = stateRef.current
      if (currentState !== 'smoking' && currentState !== 'complete') {
        animationRef.current = undefined
        return
      }

      const elapsed = (Date.now() - startTimeRef.current) / 1000
      let adjustedProgress = Math.min(1, elapsed / durationRef.current)
    
      // If accelerating, speed up from current progress
      if (isAcceleratingRef.current && accelerationStartRef.current === null) {
        accelerationStartRef.current = Date.now()
        progressAtAccelerationRef.current = adjustedProgress
      }
      
      if (isAcceleratingRef.current && accelerationStartRef.current !== null) {
        const accelerationElapsed = (Date.now() - accelerationStartRef.current) / 1000
        const remainingProgress = 1 - progressAtAccelerationRef.current
        const accelerationFactor = accelerationFactorRef.current
        const acceleratedProgress = Math.min(
          remainingProgress,
          (accelerationElapsed * accelerationFactor) / durationRef.current
        )
        adjustedProgress = Math.min(1, progressAtAccelerationRef.current + acceleratedProgress)
      }
      
      // Update progress state (for other components that depend on it)
      if (Math.abs(adjustedProgress - progressRef.current) > 0.001) {
        progressRef.current = adjustedProgress
        setProgress(adjustedProgress)
      }
      
      // Direct DOM update for Chrome - bypass React completely for visual updates
      if (burningLineElementRef.current && burningLineStyleRef.current) {
        const baseWidth = parseFloat(burningLineStyleRef.current.width)
        const widthPercent = Math.max(0, 100 - adjustedProgress * 100)
        const actualWidth = (baseWidth * widthPercent) / 100
        burningLineElementRef.current.style.width = `${actualWidth}px`
      }

      if (adjustedProgress >= 1) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = undefined
        }
        animateFunctionRef.current = null
        setState('complete')
        setProgress(1) // Keep progress at 1 (line stays empty)
        // After completion, fade back to initial state
        setTimeout(() => {
          setState('resetting')
          // Fade back animation (but keep progress at 1 - line stays empty)
          const resetStart = Date.now()
          const resetDuration = 2000 // 2 seconds to fade back
          
          const resetAnimate = () => {
            const resetElapsed = (Date.now() - resetStart) / 1000
            const resetProgress = Math.min(1, resetElapsed / (resetDuration / 1000))
            // Keep progress at 1 - don't animate the line back
            setProgress(1)
            
            if (resetProgress >= 1) {
              setState('prompt')
              setProgress(1) // Keep line empty in prompt state
            } else {
              animationRef.current = requestAnimationFrame(resetAnimate)
            }
          }
          
          resetAnimate()
        }, 500)
      } else {
        // Continue animation loop - always schedule next frame
        const rafId = requestAnimationFrame(animate)
        animationRef.current = rafId
      }
    }
    
    animateFunctionRef.current = animate
    return animate
  }, [])

  const startAnimation = useCallback(() => {
    // Cancel any existing animation FIRST
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = undefined
    }
    
    setState('smoking')
    progressRef.current = 0
    setProgress(0) // Set progress to 0 immediately so line fills to 100%
    setIsAccelerating(false)
    isAcceleratingRef.current = false
    accelerationStartRef.current = null
    progressAtAccelerationRef.current = 0

    // Delay the start of the burning animation by 1 second
    setTimeout(() => {
      // Double-check no animation is running
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
      
      startTimeRef.current = Date.now()
      const animate = createAnimateFunction()
      const rafId = requestAnimationFrame(animate)
      animationRef.current = rafId
    }, 1000) // 1 second delay before starting to burn
  }, [createAnimateFunction])

  useEffect(() => {
    // Start animation on mount
    startAnimation()
  }, [])

  // Monitor animation health - detect if it stops running
  useEffect(() => {
    if (state !== 'smoking') return
    
    let lastProgress = progress
    const checkInterval = setInterval(() => {
      const currentProgress = progress
      const hasRAF = !!animationRef.current
      
      // If progress hasn't changed in 200ms and we should be animating, something's wrong
      if (Math.abs(currentProgress - lastProgress) < 0.001 && hasRAF && currentProgress < 1) {
        // Try to restart if stuck
        if (hasRAF) {
          const animate = createAnimateFunction()
          animationRef.current = requestAnimationFrame(animate)
        }
      }
      lastProgress = currentProgress
    }, 200)
    
    return () => clearInterval(checkInterval)
  }, [state, progress, createAnimateFunction])

  // Update acceleration state in animation loop
  useEffect(() => {
    if (isAccelerating && state === 'smoking') {
      // Acceleration is handled in the animation loop
    }
  }, [isAccelerating, state])

  const handleMouseDown = useCallback(() => {
    setIsHolding(true)
    // Use stateRef to avoid closure issues and ensure we check current state
    const currentState = stateRef.current
    if (currentState === 'smoking' || currentState === 'complete') {
      setIsAccelerating(true)
      isAcceleratingRef.current = true
      // Don't cancel or restart animation - just let it continue and accelerate
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsHolding(false)
    
    // When acceleration stops, adjust startTimeRef so the animation continues
    // from the current progress without resetting
    if (isAcceleratingRef.current && stateRef.current === 'smoking') {
      // Calculate the actual progress reached during acceleration
      const currentProgress = progress
      // Adjust startTimeRef so that elapsed / duration equals currentProgress
      // This ensures the animation continues from where it left off
      const adjustedElapsed = currentProgress * duration
      startTimeRef.current = Date.now() - (adjustedElapsed * 1000)
      // Reset acceleration tracking
      accelerationStartRef.current = null
      progressAtAccelerationRef.current = currentProgress
      
      // Don't cancel the animation - let it continue naturally with updated timing
      // The animation loop will pick up the new startTimeRef on the next frame
    }
    
    setIsAccelerating(false)
    isAcceleratingRef.current = false
  }, [progress, duration])

  const handlePromptClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState('initial')
    setProgress(0)
    setIsAccelerating(false)
    isAcceleratingRef.current = false
    setTimeout(() => {
      startAnimation()
    }, 100)
  }, [startAnimation])

  const handleClick = useCallback((e: MouseEvent | TouchEvent) => {
    // Handle prompt clicks from event listeners (for touch)
    if (stateRef.current === 'prompt') {
      e.preventDefault()
      e.stopPropagation()
      setState('initial')
      setProgress(0)
      setIsAccelerating(false)
      isAcceleratingRef.current = false
      setTimeout(() => {
        startAnimation()
      }, 100)
    }
  }, [startAnimation])

  useEffect(() => {
    const handleClickWrapper = (e: MouseEvent) => handleClick(e)
    const handleTouchStartWrapper = (e: TouchEvent) => handleMouseDown()
    const handleTouchEndWrapper = (e: TouchEvent) => {
      handleMouseUp()
      if (stateRef.current === 'prompt') {
        handleClick(e)
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchstart', handleTouchStartWrapper, { passive: true })
    window.addEventListener('touchend', handleTouchEndWrapper)
    window.addEventListener('click', handleClickWrapper)

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchstart', handleTouchStartWrapper)
      window.removeEventListener('touchend', handleTouchEndWrapper)
      window.removeEventListener('click', handleClickWrapper)
    }
  }, [handleMouseDown, handleMouseUp, handleClick])

  // Monitor page visibility to detect if Chrome is pausing the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && stateRef.current === 'smoking' && !animationRef.current) {
        const animate = createAnimateFunction()
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [createAnimateFunction])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Calculate colors based on progress
  const bgColor = progress < 0.5 
    ? `rgb(${Math.round(progress * 2 * redRValue)}, 0, 0)` 
    : 'var(--color-red)'
  const textColor = `rgb(${Math.round((1 - progress) * redRValue)}, 0, 0)`

  // During reset, fade back
  const finalBgColor = state === 'resetting' || state === 'prompt' 
    ? '#000000' 
    : bgColor
  const finalTextColor = state === 'resetting' || state === 'prompt' 
    ? 'var(--color-red)' 
    : textColor

  return (
    <SmokingContext.Provider value={{ 
      progress, 
      isAccelerating, 
      foregroundColor: finalTextColor,
      burningLineElementRef,
      burningLineStyleRef
    }}>
      <div
        className="relative w-full min-h-screen transition-colors"
        style={{
          backgroundColor: finalBgColor,
          color: finalTextColor,
          transitionDuration: state === 'resetting' || state === 'prompt' ? '2s' : '0.3s',
          transitionTimingFunction: 'ease-out',
        }}
      >
        <Crosshair isActive={isHolding} />
        {children}
        {state === 'prompt' && (
          <div
            className="fixed top-4 left-4 text-red cursor-pointer z-[1001] animate-fadeIn uppercase"
            onClick={handlePromptClick}
          >
            LIGHT ANOTHER?
          </div>
        )}
      </div>
    </SmokingContext.Provider>
  )
}

export function TopLeftCellWithLine({ children }: { children: React.ReactNode }) {
  const { foregroundColor } = useSmokingContext()
  const cellRef = useRef<HTMLDivElement>(null)
  const [lineStyle, setLineStyle] = useState<{ left: string; width: string }>({ left: '0', width: '0' })

  useEffect(() => {
    const updateLinePosition = () => {
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect()
        const leftEdge = 0 // Start from left edge of screen
        const rightEdge = rect.right // End at right edge of cell (before gap)
        const totalWidth = rightEdge - leftEdge
        
        setLineStyle({
          left: `${leftEdge}px`,
          width: `${totalWidth}px`,
        })
      }
    }

    updateLinePosition()
    window.addEventListener('resize', updateLinePosition)
    return () => window.removeEventListener('resize', updateLinePosition)
  }, [])

  return (
    <>
      <div
        className="fixed top-0 z-[1000] transition-colors"
        style={{
          ...lineStyle,
          height: '2px',
          backgroundColor: foregroundColor,
          transitionDuration: '0.3s',
          transitionTimingFunction: 'ease-out',
          pointerEvents: 'none',
        }}
      />
      <div
        ref={cellRef}
        className="flex flex-row items-end justify-start"
        style={{ minWidth: 0 }}
      >
        {children}
      </div>
    </>
  )
}

export function TopRightCellWithBurningLine({ children }: { children: React.ReactNode }) {
  const { progress, isAccelerating } = useSmokingContext()
  const cellRef = useRef<HTMLDivElement>(null)
  const [lineStyle, setLineStyle] = useState<{ left: string; width: string } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const updateLinePosition = () => {
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect()
        const screenWidth = window.innerWidth
        const leftEdge = rect.left
        const rightEdge = screenWidth
        const totalWidth = rightEdge - leftEdge
        
        setLineStyle({
          left: `${leftEdge}px`,
          width: `${totalWidth}px`,
        })
        setIsInitialized(true)
      }
    }

    // Calculate initial position immediately
    updateLinePosition()
    window.addEventListener('resize', updateLinePosition)
    return () => window.removeEventListener('resize', updateLinePosition)
  }, [])

  // Don't render the line until we have the initial dimensions
  if (!lineStyle) {
    return (
      <div
        ref={cellRef}
        className="relative"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          minWidth: 0,
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <>
      <BurningLine 
        progress={progress} 
        isAccelerating={isAccelerating} 
        position="fixed" 
        style={lineStyle}
        isInitialized={isInitialized}
      />
      <div
        ref={cellRef}
        className="relative"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </>
  )
}

