"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Game2048Props {
  onScoreUpdate: (score: number) => void
}

type Cell = {
  value: number
  id: string
  mergedFrom?: boolean
  isNew?: boolean
}

type Direction = "up" | "down" | "left" | "right"

export function Game2048({ onScoreUpdate }: Game2048Props) {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [keepPlaying, setKeepPlaying] = useState(false)
  const { toast } = useToast()

  // Initialize game
  useEffect(() => {
    startGame()
  }, [])

  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver && !keepPlaying) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          move("up")
          break
        case "ArrowDown":
          e.preventDefault()
          move("down")
          break
        case "ArrowLeft":
          e.preventDefault()
          move("left")
          break
        case "ArrowRight":
          e.preventDefault()
          move("right")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [grid, gameOver, keepPlaying])

  // Touch controls
  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameOver && !keepPlaying) return

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY

      const dx = touchEndX - touchStartX
      const dy = touchEndY - touchStartY

      // Determine the direction of the swipe
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 50) {
          move("right")
        } else if (dx < -50) {
          move("left")
        }
      } else {
        // Vertical swipe
        if (dy > 50) {
          move("down")
        } else if (dy < -50) {
          move("up")
        }
      }
    }

    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [grid, gameOver, keepPlaying])

  const startGame = () => {
    // Initialize empty grid
    const emptyGrid = Array(4)
      .fill(null)
      .map(() =>
        Array(4)
          .fill(null)
          .map(() => ({
            value: 0,
            id: Math.random().toString(36).substr(2, 9),
          })),
      )

    // Add two initial tiles
    const gridWithTiles = addRandomTile(addRandomTile(emptyGrid))

    setGrid(gridWithTiles)
    setScore(0)
    setGameOver(false)
    setWon(false)
    setKeepPlaying(false)
  }

  const addRandomTile = (currentGrid: Cell[][]) => {
    const newGrid = JSON.parse(JSON.stringify(currentGrid))
    const emptyCells: { row: number; col: number }[] = []

    // Find all empty cells
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (newGrid[row][col].value === 0) {
          emptyCells.push({ row, col })
        }
      }
    }

    // If there are empty cells, add a new tile
    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      newGrid[row][col] = {
        value: Math.random() < 0.9 ? 2 : 4,
        id: Math.random().toString(36).substr(2, 9),
        isNew: true,
      }
    }

    return newGrid
  }

  const move = (direction: Direction) => {
    // Clone the grid
    let newGrid = JSON.parse(JSON.stringify(grid))

    // Reset merged flags
    newGrid = newGrid.map((row: Cell[]) =>
      row.map((cell: Cell) => ({
        ...cell,
        mergedFrom: false,
        isNew: false,
      })),
    )

    let moved = false
    let scoreIncrease = 0

    // Process the grid based on direction
    if (direction === "left") {
      for (let row = 0; row < 4; row++) {
        const result = processTiles(newGrid[row])
        newGrid[row] = result.tiles
        moved = moved || result.moved
        scoreIncrease += result.score
      }
    } else if (direction === "right") {
      for (let row = 0; row < 4; row++) {
        const reversedRow = [...newGrid[row]].reverse()
        const result = processTiles(reversedRow)
        newGrid[row] = result.tiles.reverse()
        moved = moved || result.moved
        scoreIncrease += result.score
      }
    } else if (direction === "up") {
      for (let col = 0; col < 4; col++) {
        const column = [newGrid[0][col], newGrid[1][col], newGrid[2][col], newGrid[3][col]]
        const result = processTiles(column)
        for (let row = 0; row < 4; row++) {
          newGrid[row][col] = result.tiles[row]
        }
        moved = moved || result.moved
        scoreIncrease += result.score
      }
    } else if (direction === "down") {
      for (let col = 0; col < 4; col++) {
        const column = [newGrid[0][col], newGrid[1][col], newGrid[2][col], newGrid[3][col]]
        const reversedColumn = [...column].reverse()
        const result = processTiles(reversedColumn)
        const processedColumn = result.tiles.reverse()
        for (let row = 0; row < 4; row++) {
          newGrid[row][col] = processedColumn[row]
        }
        moved = moved || result.moved
        scoreIncrease += result.score
      }
    }

    // If the grid changed, add a new tile
    if (moved) {
      newGrid = addRandomTile(newGrid)
      setScore((prev) => {
        const newScore = prev + scoreIncrease
        onScoreUpdate(newScore)
        return newScore
      })

      // Check for 2048 tile
      if (!won && !keepPlaying) {
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (newGrid[row][col].value === 2048) {
              setWon(true)
              toast({
                title: "You won!",
                description: "You reached 2048! Continue playing to reach higher scores.",
              })
              break
            }
          }
        }
      }

      // Check if game is over
      if (isGameOver(newGrid)) {
        setGameOver(true)
        toast({
          title: "Game Over!",
          description: `Your score: ${score + scoreIncrease}`,
        })
      }
    }

    setGrid(newGrid)
  }

  const processTiles = (tiles: Cell[]) => {
    const newTiles: Cell[] = Array(4)
      .fill(null)
      .map(() => ({
        value: 0,
        id: Math.random().toString(36).substr(2, 9),
      }))

    let moved = false
    let score = 0
    let position = 0

    // Move all non-zero tiles to the left
    for (let i = 0; i < 4; i++) {
      if (tiles[i].value !== 0) {
        newTiles[position] = { ...tiles[i] }
        if (i !== position) {
          moved = true
        }
        position++
      }
    }

    // Merge tiles
    for (let i = 0; i < 3; i++) {
      if (newTiles[i].value !== 0 && newTiles[i].value === newTiles[i + 1].value) {
        newTiles[i].value *= 2
        newTiles[i].mergedFrom = true
        score += newTiles[i].value

        // Shift remaining tiles
        for (let j = i + 1; j < 3; j++) {
          newTiles[j] = newTiles[j + 1]
        }
        newTiles[3] = { value: 0, id: Math.random().toString(36).substr(2, 9) }
        moved = true
      }
    }

    return { tiles: newTiles, moved, score }
  }

  const isGameOver = (currentGrid: Cell[][]) => {
    // Check if there are any empty cells
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentGrid[row][col].value === 0) {
          return false
        }
      }
    }

    // Check if there are any possible merges
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const value = currentGrid[row][col].value

        // Check right
        if (col < 3 && value === currentGrid[row][col + 1].value) {
          return false
        }

        // Check down
        if (row < 3 && value === currentGrid[row + 1][col].value) {
          return false
        }
      }
    }

    return true
  }

  const continueGame = () => {
    setKeepPlaying(true)
  }

  const getTileColor = (value: number) => {
    switch (value) {
      case 2:
        return "bg-amber-100 text-slate-800"
      case 4:
        return "bg-amber-200 text-slate-800"
      case 8:
        return "bg-orange-300 text-white"
      case 16:
        return "bg-orange-400 text-white"
      case 32:
        return "bg-orange-500 text-white"
      case 64:
        return "bg-orange-600 text-white"
      case 128:
        return "bg-yellow-300 text-white"
      case 256:
        return "bg-yellow-400 text-white"
      case 512:
        return "bg-yellow-500 text-white"
      case 1024:
        return "bg-yellow-600 text-white"
      case 2048:
        return "bg-yellow-700 text-white"
      case 4096:
        return "bg-red-500 text-white"
      case 8192:
        return "bg-red-600 text-white"
      default:
        return "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
    }
  }

  const getTileFontSize = (value: number) => {
    if (value < 100) return "text-3xl"
    if (value < 1000) return "text-2xl"
    return "text-xl"
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <div className="flex items-center gap-2 bg-accent/30 px-3 py-2 rounded-md">
          <span>Score: {score}</span>
        </div>
        <Button variant="outline" onClick={startGame} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" /> New Game
        </Button>
      </div>

      <div className="relative w-full max-w-md aspect-square mb-6 bg-slate-300 dark:bg-slate-800 rounded-md p-2">
        {/* Grid background */}
        <div className="grid grid-cols-4 gap-2 h-full">
          {Array(16)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="bg-slate-200 dark:bg-slate-700 rounded-md"></div>
            ))}
        </div>

        {/* Tiles */}
        <div className="absolute inset-0 p-2">
          <div className="relative h-full">
            <AnimatePresence>
              {grid.flatMap((row, rowIndex) =>
                row.map(
                  (cell, colIndex) =>
                    cell.value !== 0 && (
                      <motion.div
                        key={cell.id}
                        initial={{ scale: cell.isNew ? 0 : 1 }}
                        animate={{
                          scale: 1,
                          x: colIndex * 25 + "%",
                          y: rowIndex * 25 + "%",
                        }}
                        exit={{ scale: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        className={`absolute w-[23.5%] h-[23.5%] flex items-center justify-center rounded-md font-bold ${getTileColor(cell.value)} ${getTileFontSize(cell.value)}`}
                      >
                        {cell.value}

                        {cell.mergedFrom && (
                          <motion.div
                            initial={{ scale: 1.2, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 rounded-md bg-white/30 pointer-events-none"
                          />
                        )}
                      </motion.div>
                    ),
                ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Game controls for mobile */}
      <div className="grid grid-cols-3 gap-2 mb-4 w-40">
        <div></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => move("up")}
          disabled={gameOver && !keepPlaying}
          className="flex justify-center"
        >
          ↑
        </Button>
        <div></div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => move("left")}
          disabled={gameOver && !keepPlaying}
          className="flex justify-center"
        >
          ←
        </Button>
        <div></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => move("right")}
          disabled={gameOver && !keepPlaying}
          className="flex justify-center"
        >
          →
        </Button>

        <div></div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => move("down")}
          disabled={gameOver && !keepPlaying}
          className="flex justify-center"
        >
          ↓
        </Button>
        <div></div>
      </div>

      {won && !keepPlaying && (
        <div className="mb-6 p-4 bg-green-800/20 rounded-md text-center">
          <h3 className="text-xl font-bold mb-2">You Won!</h3>
          <p className="mb-4">You reached 2048! Continue playing?</p>
          <Button onClick={continueGame}>Keep Playing</Button>
        </div>
      )}

      {gameOver && (
        <div className="mb-6 p-4 bg-red-800/20 rounded-md text-center">
          <h3 className="text-xl font-bold mb-2">Game Over!</h3>
          <p className="text-2xl text-amber-400">Final Score: {score}</p>
        </div>
      )}
    </div>
  )
}

