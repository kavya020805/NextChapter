import { useEffect, useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 })
  const [hoverState, setHoverState] = useState({ 
    type: null, 
    element: null,
    isClicking: false 
  })
  const [isVisible, setIsVisible] = useState(false)
  const { isDark } = useTheme()
  const rafRef = useRef(null)
  const cursorRef = useRef(null)
  const glowRef = useRef(null)
  const hoveredElementRef = useRef(null)
  const hoverStateRef = useRef({ type: null, element: null, isClicking: false })
  const targetX = useRef(0)
  const targetY = useRef(0)
  const currentX = useRef(0)
  const currentY = useRef(0)

  // Detect element type
  const detectElementType = (element) => {
    if (!element) return null
    
    // Buttons
    if (element.tagName === 'BUTTON' || 
        element.closest('button') ||
        element.getAttribute('role') === 'button' ||
        (element.tagName === 'A' && (element.classList.contains('btn') || element.classList.contains('button')))) {
      return 'button'
    }
    
    // Form inputs
    if (element.tagName === 'INPUT' || 
        element.tagName === 'TEXTAREA' ||
        element.tagName === 'SELECT') {
      return 'input'
    }
    
    // Images/Book covers
    if (element.tagName === 'IMG' || 
        element.closest('img') ||
        element.classList.contains('book-cover') ||
        element.closest('.book-cover') ||
        element.closest('[class*="cover"]')) {
      return 'image'
    }
    
    // Cards
    if (element.classList.contains('card') ||
        element.closest('.card') ||
        element.closest('[class*="Card"]') ||
        element.closest('[class*="card"]') ||
        element.closest('[class*="book"]')) {
      return 'card'
    }
    
    // Links/Icons
    if (element.tagName === 'A' ||
        element.closest('a') ||
        element.classList.contains('icon') ||
        element.closest('.icon') ||
        element.closest('svg') ||
        element.tagName === 'SVG') {
      return 'link'
    }
    
    return null
  }

  // Get accent color from element - improved color extraction
  const getAccentColor = (element) => {
    if (!element) return '#D47249'
    const styles = window.getComputedStyle(element)
    
    // Try multiple color sources
    const bgColor = styles.backgroundColor
    const borderColor = styles.borderColor
    const textColor = styles.color
    const outlineColor = styles.outlineColor
    
    // Helper to check if color is valid
    const isValidColor = (color) => {
      if (!color) return false
      if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return false
      if (color === 'rgb(0, 0, 0)' || color === 'rgba(0, 0, 0, 0)') return false
      // Check if it's a very dark/black color that won't work well
      if (color.startsWith('rgb(0, 0, 0') || color.startsWith('rgba(0, 0, 0')) return false
      return true
    }
    
    // Priority: background color > border color > text color > outline
    if (isValidColor(bgColor)) {
      // Convert RGB to RGBA with opacity for glow effect
      return convertToGlowColor(bgColor)
    }
    if (isValidColor(borderColor)) {
      return convertToGlowColor(borderColor)
    }
    if (isValidColor(textColor)) {
      return convertToGlowColor(textColor)
    }
    if (isValidColor(outlineColor)) {
      return convertToGlowColor(outlineColor)
    }
    
    // Fallback to coral accent
    return '#D47249'
  }
  
  // Convert color to appropriate glow color with opacity
  const convertToGlowColor = (color) => {
    if (!color) return '#D47249'
    
    // If already rgba/rgb, extract and return RGB
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g)
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0])
        const g = parseInt(matches[1])
        const b = parseInt(matches[2])
        return `rgb(${r}, ${g}, ${b})`
      }
    }
    
    // If hex color, return as-is
    if (color.startsWith('#')) {
      return color
    }
    
    return color
  }
  
  // Convert RGB/Hex to RGBA with different opacity levels
  const convertToRGBA = (color, opacity) => {
    if (!color) return `rgba(212, 114, 73, ${opacity})`
    
    // Handle RGB/RGBA
    if (color.startsWith('rgb')) {
      const matches = color.match(/\d+/g)
      if (matches && matches.length >= 3) {
        const r = parseInt(matches[0])
        const g = parseInt(matches[1])
        const b = parseInt(matches[2])
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
      }
    }
    
    // Handle hex
    if (color.startsWith('#')) {
      const hex = color.replace('#', '')
      let r, g, b
      
      if (hex.length === 3) {
        // 3-digit hex
        r = parseInt(hex[0] + hex[0], 16)
        g = parseInt(hex[1] + hex[1], 16)
        b = parseInt(hex[2] + hex[2], 16)
      } else {
        // 6-digit hex
        r = parseInt(hex.substring(0, 2), 16)
        g = parseInt(hex.substring(2, 4), 16)
        b = parseInt(hex.substring(4, 6), 16)
      }
      
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    
    return `rgba(212, 114, 73, ${opacity})`
  }

  useEffect(() => {
    // Check if device supports mouse (not touch-only)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) {
      return
    }

    setIsVisible(true)

    const updateCursor = (e) => {
      targetX.current = e.clientX
      targetY.current = e.clientY
      
      // Update glow position to element center if hovering
      if (hoveredElementRef.current) {
        const rect = hoveredElementRef.current.getBoundingClientRect()
        setGlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })
      } else {
        setGlowPosition({ x: e.clientX, y: e.clientY })
      }
    }

    const animate = () => {
      // Smooth lag motion (inertia effect) - 120fps responsive
      const lagFactor = 0.08 // Lower = more lag
      currentX.current += (targetX.current - currentX.current) * lagFactor
      currentY.current += (targetY.current - currentY.current) * lagFactor
      setPosition({ x: currentX.current, y: currentY.current })
      
      // Update glow position if hovering over element
      if (hoveredElementRef.current) {
        const rect = hoveredElementRef.current.getBoundingClientRect()
        setGlowPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        })
      }
      
      rafRef.current = requestAnimationFrame(animate)
    }

    const handleMouseOver = (e) => {
      const target = e.target
      const elementType = detectElementType(target)
      const element = elementType ? (target.closest('button, a, input, textarea, select, img, .card, .book-cover, .icon, svg, [class*="card"], [class*="book"]') || target) : null
      
      hoveredElementRef.current = element
      const newState = { type: elementType, element, isClicking: false }
      hoverStateRef.current = newState
      setHoverState(newState)
      
      // Update CSS variables
      if (cursorRef.current) {
        const accentColor = getAccentColor(element)
        cursorRef.current.style.setProperty('--hover-type', elementType || 'none')
        cursorRef.current.style.setProperty('--accent-color', accentColor)
        
        // Set multiple opacity levels for glow effects (will be applied when glow renders)
        if (glowRef.current) {
          glowRef.current.style.setProperty('--accent-color', accentColor)
          glowRef.current.style.setProperty('--accent-color-rgba-60', convertToRGBA(accentColor, 0.6))
          glowRef.current.style.setProperty('--accent-color-rgba-50', convertToRGBA(accentColor, 0.5))
          glowRef.current.style.setProperty('--accent-color-rgba-40', convertToRGBA(accentColor, 0.4))
          glowRef.current.style.setProperty('--accent-color-rgba-35', convertToRGBA(accentColor, 0.35))
          glowRef.current.style.setProperty('--accent-color-rgba-30', convertToRGBA(accentColor, 0.3))
        }
      }
    }

    const handleMouseOut = (e) => {
      // Check if moving to child element
      if (e.relatedTarget && hoveredElementRef.current?.contains(e.relatedTarget)) {
        return
      }
      hoveredElementRef.current = null
      const newState = { type: null, element: null, isClicking: false }
      hoverStateRef.current = newState
      setHoverState(newState)
      if (cursorRef.current) {
        cursorRef.current.style.setProperty('--hover-type', 'none')
      }
    }

    const handleMouseDown = (e) => {
      if (hoverStateRef.current.type === 'button' || hoverStateRef.current.type === 'image') {
        const newState = { ...hoverStateRef.current, isClicking: true }
        hoverStateRef.current = newState
        setHoverState(newState)
        if (glowRef.current) {
          glowRef.current.classList.add('glow-pulse')
          setTimeout(() => {
            if (glowRef.current) {
              glowRef.current.classList.remove('glow-pulse')
            }
            const resetState = { ...hoverStateRef.current, isClicking: false }
            hoverStateRef.current = resetState
            setHoverState(resetState)
          }, 300)
        }
      }
    }

    // Removed focus/blur handlers for form inputs - no special cursor effect

    window.addEventListener('mousemove', updateCursor)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    document.addEventListener('mousedown', handleMouseDown)

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', updateCursor)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      document.removeEventListener('mousedown', handleMouseDown)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  if (!isVisible) {
    return null
  }

  const hoverType = hoverState.type || 'none'

  return (
    <>
      {/* Glow shadow behind hovered element */}
      {hoverType !== 'none' && hoverType !== 'input' && (
        <div
          ref={glowRef}
          className={`cursor-glow cursor-glow-${hoverType} ${isDark ? 'cursor-glow-dark' : ''}`}
          style={{
            left: `${glowPosition.x}px`,
            top: `${glowPosition.y}px`,
            '--accent-color': hoverState.element ? getAccentColor(hoverState.element) : '#D47249',
            '--accent-color-rgba-60': hoverState.element ? convertToRGBA(getAccentColor(hoverState.element), 0.6) : 'rgba(212, 114, 73, 0.6)',
            '--accent-color-rgba-50': hoverState.element ? convertToRGBA(getAccentColor(hoverState.element), 0.5) : 'rgba(212, 114, 73, 0.5)',
            '--accent-color-rgba-40': hoverState.element ? convertToRGBA(getAccentColor(hoverState.element), 0.4) : 'rgba(212, 114, 73, 0.4)',
            '--accent-color-rgba-35': hoverState.element ? convertToRGBA(getAccentColor(hoverState.element), 0.35) : 'rgba(212, 114, 73, 0.35)',
            '--accent-color-rgba-30': hoverState.element ? convertToRGBA(getAccentColor(hoverState.element), 0.3) : 'rgba(212, 114, 73, 0.3)',
          }}
        />
      )}
      
      {/* Main cursor with noisy texture */}
      <div
        ref={cursorRef}
        className={`custom-cursor cursor-${hoverType} ${isDark ? 'cursor-dark' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          '--hover-type': hoverType,
        }}
      />
    </>
  )
}

export default CustomCursor

