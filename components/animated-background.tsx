"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function AnimatedBackground() {
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const isDark = theme === "dark"

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Animated bubbles
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const bubbles: {
      x: number
      y: number
      radius: number
      speed: number
      color: string
      opacity: number
      direction: number
    }[] = []

    // Create bubbles
    for (let i = 0; i < 50; i++) {
      const radius = Math.random() * 50 + 10
      bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius,
        speed: Math.random() * 0.5 + 0.1,
        color: getRandomColor(),
        opacity: Math.random() * 0.3 + 0.1,
        direction: Math.random() > 0.5 ? 1 : -1,
      })
    }

    function getRandomColor() {
      const colors = isDark
        ? [
            "#8b5cf6", // Purple
            "#3b82f6", // Blue
            "#ec4899", // Pink
            "#10b981", // Green
            "#f59e0b", // Amber
            "#ef4444", // Red
            "#06b6d4", // Cyan
          ]
        : [
            "#c4b5fd", // Light Purple
            "#93c5fd", // Light Blue
            "#fbcfe8", // Light Pink
            "#a7f3d0", // Light Green
            "#fde68a", // Light Amber
            "#fca5a5", // Light Red
            "#a5f3fc", // Light Cyan
          ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    function drawBubbles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw each bubble
      bubbles.forEach((bubble) => {
        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2)
        ctx.fillStyle = bubble.color
        ctx.globalAlpha = bubble.opacity
        ctx.fill()

        // Move bubble
        bubble.y -= bubble.speed
        bubble.x += bubble.speed * bubble.direction * 0.5

        // Reset if off screen
        if (bubble.y < -bubble.radius) {
          bubble.y = canvas.height + bubble.radius
          bubble.x = Math.random() * canvas.width
        }
        if (bubble.x < -bubble.radius) {
          bubble.x = canvas.width + bubble.radius
        }
        if (bubble.x > canvas.width + bubble.radius) {
          bubble.x = -bubble.radius
        }
      })

      requestAnimationFrame(drawBubbles)
    }

    drawBubbles()

    // Cleanup
    return () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [dimensions, isDark])

  return (
    <>
      <div className="fixed inset-0 z-0">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
              : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100"
          }`}
        ></div>
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      </div>

      {/* Animated shapes */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"
          animate={{
            x: [0, -70, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-pink-500/10 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl"
          animate={{
            x: [0, 120, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 22,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>
    </>
  )
}

