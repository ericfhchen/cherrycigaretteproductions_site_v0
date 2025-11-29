'use client'

import { useSmokingContext } from './SmokingEffect'

interface LogoImageProps {
  src: string
  alt: string
  className?: string
}

export default function LogoImage({ src, alt, className = '' }: LogoImageProps) {
  const { foregroundColor } = useSmokingContext()
  
  // Calculate filter based on foregroundColor
  // If foregroundColor is red (var(--color-red) or rgb(214, 0, 0)), show full brightness
  // If foregroundColor is black (rgb(0, 0, 0) or close), show black
  let brightness = 1
  let saturation = 1
  
  if (foregroundColor.includes('rgb')) {
    // Extract RGB values
    const match = foregroundColor.match(/\d+/g)
    if (match) {
      const r = parseInt(match[0], 10)
      // Calculate brightness based on red component (214 = full red, 0 = black)
      // Normalize to 0-1 range where 214 = 1 and 0 = 0
      brightness = r / 214
      // Keep saturation high when red, reduce as it approaches black
      saturation = Math.max(0.3, brightness)
    }
  } else if (foregroundColor === 'var(--color-red)') {
    // Full red
    brightness = 1
    saturation = 1
  } else {
    // Default to red if unknown
    brightness = 1
    saturation = 1
  }
  
  const filter = `brightness(${brightness}) saturate(${saturation})`
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      style={{
        filter,
        transition: 'filter 0.3s ease-out',
      }}
    />
  )
}

