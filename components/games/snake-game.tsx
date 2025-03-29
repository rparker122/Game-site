"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Position = { x: number; y: number }

const GRID_SIZE = 20
const CELL_SIZE = 20
const GAME_SPEED = 150

export function SnakeGame({ onScoreUpdate }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  // Initialize game
  useEffect(() => {
    resetGame()
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [])

  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP")
          break
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN")
          break
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT")
          break
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT")
          break
        case " ":
          togglePause()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [direction, isPaused])

  // Game loop
  useEffect(() => {
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED)
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [snake, food, direction, gameOver, isPaused])

  // Draw game
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw snake
        ctx.fillStyle = "#4ade80" // Green
        snake.forEach((segment, index) => {
          // Head is a different color
          if (index === 0) {
            ctx.fillStyle = "#22c55e" // Darker green
          } else {
            ctx.fillStyle = "#4ade80" // Green
          }

          ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)

          // Add eyes to the head
          if (index === 0) {
            ctx.fillStyle = "white"

            // Position eyes based on direction
            if (direction === "RIGHT" || direction === "LEFT") {
              ctx.fillRect(segment.x * CELL_SIZE + (direction === "RIGHT" ? 15 : 2), segment.y * CELL_SIZE + 5, 3, 3)
              ctx.fillRect(segment.x * CELL_SIZE + (direction === "RIGHT" ? 15 : 2), segment.y * CELL_SIZE + 12, 3, 3)
            } else {
              ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + (direction === "DOWN" ? 15 : 2), 3, 3)
              ctx.fillRect(segment.x * CELL_SIZE + 12, segment.y * CELL_SIZE + (direction === "DOWN" ? 15 : 2), 3, 3)
            }
          }
        })

        // Draw food
        ctx.fillStyle = "#f87171" // Red
        ctx.beginPath()
        ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2, 0, Math.PI * 2)
        ctx.fill()

        // Draw grid (optional)
        ctx.strokeStyle = "#334155" // Slate 700
        ctx.lineWidth = 0.5

        for (let i = 0; i <= GRID_SIZE; i++) {
          ctx.beginPath()
          ctx.moveTo(i * CELL_SIZE, 0)
          ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(0, i * CELL_SIZE)
          ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
          ctx.stroke()
        }

        // Draw game over or paused overlay
        if (gameOver || isPaused) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          ctx.fillStyle = "white"
          ctx.font = "24px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(gameOver ? "Game Over" : "Paused", canvas.width / 2, canvas.height / 2)
        }
      }
    }
  }, [snake, food, direction, gameOver, isPaused])

  const moveSnake = () => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] }

      // Move head based on direction
      switch (direction) {
        case "UP":
          head.y -= 1
          break
        case "DOWN":
          head.y += 1
          break
        case "LEFT":
          head.x -= 1
          break
        case "RIGHT":
          head.x += 1
          break
      }

      // Check for collisions
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE ||
        prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true)
        onScoreUpdate(score)
        toast({
          title: "Game Over!",
          description: `Your score: ${score}`,
        })
        return prevSnake
      }

      // Create new snake array with new head
      const newSnake = [head, ...prevSnake]

      // Check if snake ate food
      if (head.x === food.x && head.y === food.y) {
        // Generate new food
        generateFood(newSnake)
        // Increase score
        setScore((prev) => prev + 10)
      } else {
        // Remove tail if no food was eaten
        newSnake.pop()
      }

      return newSnake
    })
  }

  const generateFood = (snakeBody: Position[] = snake) => {
    let newFood: Position
    let foodOnSnake = true

    // Generate food until it's not on the snake
    while (foodOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }

      foodOnSnake = snakeBody.some((segment) => segment.x === newFood.x && segment.y === newFood.y)

      if (!foodOnSnake) {
        setFood(newFood)
      }
    }
  }

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    generateFood([{ x: 10, y: 10 }])
    setDirection("RIGHT")
    setGameOver(false)
    setIsPaused(false)
    setScore(0)
  }

  const togglePause = () => {
    setIsPaused((prev) => !prev)
  }

  const handleDirectionClick = (newDirection: Direction) => {
    // Prevent 180-degree turns
    if (
      (direction === "UP" && newDirection === "DOWN") ||
      (direction === "DOWN" && newDirection === "UP") ||
      (direction === "LEFT" && newDirection === "RIGHT") ||
      (direction === "RIGHT" && newDirection === "LEFT")
    ) {
      return
    }

    setDirection(newDirection)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <div className="bg-slate-700 px-3 py-2 rounded-md">
          <span>Score: {score}</span>
        </div>
        <Button variant="outline" size="sm" onClick={togglePause} disabled={gameOver}>
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </div>

      <div className="relative mb-6 border border-slate-600 rounded-md overflow-hidden">
        <canvas ref={canvasRef} width={GRID_SIZE * CELL_SIZE} height={GRID_SIZE * CELL_SIZE} className="bg-slate-900" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 w-40">
        <div></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDirectionClick("UP")}
          disabled={gameOver}
          className="flex justify-center"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div></div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDirectionClick("LEFT")}
          disabled={gameOver}
          className="flex justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDirectionClick("RIGHT")}
          disabled={gameOver}
          className="flex justify-center"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDirectionClick("DOWN")}
          disabled={gameOver}
          className="flex justify-center"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <div></div>
      </div>

      <Button onClick={resetGame} className="flex items-center">
        <RefreshCw className="mr-2 h-4 w-4" /> New Game
      </Button>
    </div>
  )
}

