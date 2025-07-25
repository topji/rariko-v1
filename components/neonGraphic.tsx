"use client"

import type React from "react"
import { useEffect, useRef } from "react"

const NeonIsometricMaze: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const x = canvas.getContext("2d")
    if (!x) return

    let t = 0
    let animationFrameId: number

    const r = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      d()
    }

    const d = () => {
      if (!canvas || !x) return
      const w = canvas.width
      const h = canvas.height
      const centerX = w / 2
      const centerY = h / 2
      
      // Create multiple layers of circles for depth
      const layers = [
        { numCircles: 12, radius: Math.min(w, h) * 0.25, speed: 0.3, size: 25 },
        { numCircles: 8, radius: Math.min(w, h) * 0.4, speed: 0.2, size: 35 },
        { numCircles: 6, radius: Math.min(w, h) * 0.55, speed: 0.15, size: 45 }
      ]
      
      interface Circle {
        x: number
        y: number
        size: number
        angle: number
        layer: number
        pulse: number
      }
      
      const allCircles: Circle[] = []
      
      // Generate circles for each layer
      layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.numCircles; i++) {
          const angle = (i / layer.numCircles) * Math.PI * 2 + t * layer.speed
          const x = centerX + Math.cos(angle) * layer.radius
          const y = centerY + Math.sin(angle) * layer.radius
          const size = layer.size + Math.sin(angle * 2 + t * 2) * 8
          
          allCircles.push({ 
            x, y, size, angle, 
            layer: layerIndex,
            pulse: Math.sin(t * 1.5 + i * 0.8) * 0.4 + 0.6
          })
        }
      })
      
      // Draw connecting lines with enhanced effects
      allCircles.forEach((circle, index) => {
        // Connect to nearest circles
        const connections = 3
        for (let j = 1; j <= connections; j++) {
          const targetIndex = (index + j) % allCircles.length
          const target = allCircles[targetIndex]
          
          const distance = Math.sqrt(
            Math.pow(circle.x - target.x, 2) + Math.pow(circle.y - target.y, 2)
          )
          
          if (distance < Math.min(w, h) * 0.3) {
            const opacity = Math.max(0, 0.4 - distance / (Math.min(w, h) * 0.3) * 0.3)
            
            // Create animated gradient line
            const gradient = x.createLinearGradient(circle.x, circle.y, target.x, target.y)
            gradient.addColorStop(0, `rgba(29, 191, 115, ${opacity * 0.8})`)
            gradient.addColorStop(0.3, `rgba(29, 191, 115, ${opacity * 0.3})`)
            gradient.addColorStop(0.7, `rgba(29, 191, 115, ${opacity * 0.1})`)
            gradient.addColorStop(1, `rgba(29, 191, 115, ${opacity * 0.8})`)
            
            x.strokeStyle = gradient
            x.lineWidth = 1.5
            x.beginPath()
            x.moveTo(circle.x, circle.y)
            x.lineTo(target.x, target.y)
            x.stroke()
          }
        }
      })
      
      // Draw circles with enhanced effects
      allCircles.forEach((circle, index) => {
        const size = circle.size * circle.pulse
        
        // Multiple glow layers for depth
        const glowLayers = [
          { radius: size * 3, opacity: 0.15 },
          { radius: size * 2, opacity: 0.25 },
          { radius: size * 1.5, opacity: 0.35 }
        ]
        
        glowLayers.forEach(glow => {
          const glowGradient = x.createRadialGradient(
            circle.x, circle.y, 0,
            circle.x, circle.y, glow.radius
          )
          glowGradient.addColorStop(0, `rgba(29, 191, 115, ${glow.opacity})`)
          glowGradient.addColorStop(0.6, `rgba(29, 191, 115, ${glow.opacity * 0.3})`)
          glowGradient.addColorStop(1, "rgba(29, 191, 115, 0)")
          
          x.fillStyle = glowGradient
          x.beginPath()
          x.arc(circle.x, circle.y, glow.radius, 0, Math.PI * 2)
          x.fill()
        })
        
        // Main circle with enhanced gradient
        const circleGradient = x.createRadialGradient(
          circle.x, circle.y, 0,
          circle.x, circle.y, size
        )
        circleGradient.addColorStop(0, "rgba(29, 191, 115, 0.9)")
        circleGradient.addColorStop(0.4, "rgba(29, 191, 115, 0.6)")
        circleGradient.addColorStop(0.8, "rgba(29, 191, 115, 0.2)")
        circleGradient.addColorStop(1, "rgba(29, 191, 115, 0)")
        
        x.fillStyle = circleGradient
        x.beginPath()
        x.arc(circle.x, circle.y, size, 0, Math.PI * 2)
        x.fill()
        
        // Inner highlight with animation
        const highlightSize = size * 0.3
        const highlightX = circle.x - highlightSize * 0.8
        const highlightY = circle.y - highlightSize * 0.8
        
        x.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(t * 3 + index) * 0.1})`
        x.beginPath()
        x.arc(highlightX, highlightY, highlightSize, 0, Math.PI * 2)
        x.fill()
        
        // Subtle border
        x.strokeStyle = `rgba(29, 191, 115, ${0.4 + Math.sin(t + index) * 0.2})`
        x.lineWidth = 1
        x.beginPath()
        x.arc(circle.x, circle.y, size, 0, Math.PI * 2)
        x.stroke()
      })
      
      // Enhanced floating particles with trails
      for (let i = 0; i < 12; i++) {
        const angle = t * 0.2 + i * Math.PI / 6
        const radius = Math.min(w, h) * 0.45
        const particleX = centerX + Math.cos(angle) * radius
        const particleY = centerY + Math.sin(angle) * radius
        const size = 3 + Math.sin(t * 2 + i) * 1.5
        
        // Particle trail
        for (let trail = 0; trail < 5; trail++) {
          const trailAngle = angle - trail * 0.1
          const trailRadius = radius - trail * 2
          const trailX = centerX + Math.cos(trailAngle) * trailRadius
          const trailY = centerY + Math.sin(trailAngle) * trailRadius
          const trailSize = size * (1 - trail * 0.2)
          const trailOpacity = (0.3 - trail * 0.05) * (0.5 + Math.sin(t + i) * 0.3)
          
          x.fillStyle = `rgba(29, 191, 115, ${trailOpacity})`
          x.beginPath()
          x.arc(trailX, trailY, trailSize, 0, Math.PI * 2)
          x.fill()
        }
        
        // Main particle
        x.fillStyle = `rgba(29, 191, 115, ${0.6 + Math.sin(t * 2 + i) * 0.3})`
        x.beginPath()
        x.arc(particleX, particleY, size, 0, Math.PI * 2)
        x.fill()
      }
      
      // Add subtle background grid effect
      const gridSize = 50
      x.strokeStyle = "rgba(29, 191, 115, 0.05)"
      x.lineWidth = 0.5
      
      for (let i = 0; i < w; i += gridSize) {
        x.beginPath()
        x.moveTo(i, 0)
        x.lineTo(i, h)
        x.stroke()
      }
      
      for (let i = 0; i < h; i += gridSize) {
        x.beginPath()
        x.moveTo(0, i)
        x.lineTo(w, i)
        x.stroke()
      }
    }

    const a = () => {
      if (!canvas || !x) return
      x.fillStyle = "rgba(0,0,0,.1)"
      x.fillRect(0, 0, canvas.width, canvas.height)
      d()
      t += 0.02
      animationFrameId = requestAnimationFrame(a)
    }

    window.addEventListener("resize", r)
    r()
    a()

    return () => {
      window.removeEventListener("resize", r)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="block" />
}

export default NeonIsometricMaze

