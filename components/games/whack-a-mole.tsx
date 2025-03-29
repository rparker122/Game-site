"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Timer } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WhackAMoleProps {
  onScoreUpdate: (score: number) => void
}

interface Mole {
  id: number
  active: boolean
  whacked: boolean
}

export function WhackAMole({ onScoreUpdate }: WhackAMoleProps) {
  const [moles, setMoles] = useState<Mole[]>(
    Array(9)
      .fill(null)
      .map((_, i) => ({ id: i, active: false, whacked: false })),
  )
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameActive, setGameActive] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const moleIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Difficulty settings
  const difficultySettings = {
    easy: { moleInterval: 1500, moleLifetime: 2000, maxActiveMoles: 2 },
    medium: { moleInterval: 1000, moleLifetime: 1500, maxActiveMoles: 3 },
    hard: { moleInterval: 800, moleLifetime: 1200, maxActiveMoles: 4 },
  }

  // Start game
  const startGame = () => {
    setScore(0)
    setTimeLeft(30)
    setGameActive(true)
    setMoles(
      Array(9)
        .fill(null)
        .map((_, i) => ({ id: i, active: false, whacked: false })),
    )

    // Game timer
    gameIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Mole activation
    activateMoles()
  }

  // End game
  const endGame = () => {
    setGameActive(false)
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current)
    if (moleIntervalRef.current) clearInterval(moleIntervalRef.current)
    onScoreUpdate(score)
  }

  // Activate moles at random intervals
  const activateMoles = () => {
    if (moleIntervalRef.current) clearInterval(moleIntervalRef.current)

    moleIntervalRef.current = setInterval(() => {
      setMoles((prevMoles) => {
        const newMoles = [...prevMoles]
        const activeMoles = newMoles.filter((mole) => mole.active && !mole.whacked)

        // If we have reached max active moles, don't activate more
        if (activeMoles.length >= difficultySettings[difficulty].maxActiveMoles) {
          return newMoles
        }

        // Find inactive moles
        const inactiveMoles = newMoles
          .map((mole, index) => ({ index, mole }))
          .filter(({ mole }) => !mole.active && !mole.whacked)

        // If there are inactive moles, activate one randomly
        if (inactiveMoles.length > 0) {
          const randomIndex = Math.floor(Math.random() * inactiveMoles.length)
          const moleIndex = inactiveMoles[randomIndex].index

          newMoles[moleIndex] = { ...newMoles[moleIndex], active: true }

          // Set a timeout to deactivate this mole
          setTimeout(() => {
            setMoles((currentMoles) => {
              const updatedMoles = [...currentMoles]
              if (updatedMoles[moleIndex].active && !updatedMoles[moleIndex].whacked) {
                updatedMoles[moleIndex] = { ...updatedMoles[moleIndex], active: false }
              }
              return updatedMoles
            })
          }, difficultySettings[difficulty].moleLifetime)
        }

        return newMoles
      })
    }, difficultySettings[difficulty].moleInterval)
  }

  // Whack a mole
  const whackMole = (index: number) => {
    if (!gameActive) return

    setMoles((prevMoles) => {
      const newMoles = [...prevMoles]

      // Only count if mole is active and not already whacked
      if (newMoles[index].active && !newMoles[index].whacked) {
        newMoles[index] = { ...newMoles[index], whacked: true, active: false }
        setScore((prev) => prev + 1)

        // Reset this mole after a short delay
        setTimeout(() => {
          setMoles((currentMoles) => {
            const resetMoles = [...currentMoles]
            resetMoles[index] = { ...resetMoles[index], whacked: false }
            return resetMoles
          })
        }, 300)
      }

      return newMoles
    })
  }

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current)
      if (moleIntervalRef.current) clearInterval(moleIntervalRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <div className="flex items-center gap-2 bg-accent/30 px-3 py-2 rounded-md">
          <Timer className="h-4 w-4" />
          <span>{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 bg-accent/30 px-3 py-2 rounded-md">
          <span>Score: {score}</span>
        </div>
      </div>

      {!gameActive && (
        <div className="mb-6 w-full">
          <h3 className="text-lg font-medium mb-2">Select Difficulty:</h3>
          <div className="flex gap-2 mb-4">
            <Button
              variant={difficulty === "easy" ? "default" : "outline"}
              onClick={() => setDifficulty("easy")}
              className="flex-1"
            >
              Easy
            </Button>
            <Button
              variant={difficulty === "medium" ? "default" : "outline"}
              onClick={() => setDifficulty("medium")}
              className="flex-1"
            >
              Medium
            </Button>
            <Button
              variant={difficulty === "hard" ? "default" : "outline"}
              onClick={() => setDifficulty("hard")}
              className="flex-1"
            >
              Hard
            </Button>
          </div>

          <Button onClick={startGame} className="w-full">
            Start Game
          </Button>
        </div>
      )}

      {gameActive && (
        <>
          <Progress value={(timeLeft / 30) * 100} className="w-full mb-6" />

          <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-6">
            {moles.map((mole, index) => (
              <div
                key={mole.id}
                className="aspect-square relative bg-gradient-to-b from-amber-800 to-amber-900 rounded-full overflow-hidden cursor-pointer"
                onClick={() => whackMole(index)}
              >
                <div className="absolute bottom-0 w-full h-1/2 bg-green-800 rounded-t-full"></div>

                <AnimatePresence>
                  {mole.active && !mole.whacked && (
                    <motion.div
                      className="absolute bottom-0 w-full flex justify-center"
                      initial={{ y: 60 }}
                      animate={{ y: 10 }}
                      exit={{ y: 60 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <div className="relative">
                        <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center">
                          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                            <div className="flex flex-col items-center">
                              <div className="flex space-x-4">
                                <div className="w-2 h-2 bg-black rounded-full"></div>
                                <div className="w-2 h-2 bg-black rounded-full"></div>
                              </div>
                              <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </>
      )}

      {!gameActive && score > 0 && (
        <div className="mb-6 p-4 bg-green-800/20 rounded-md text-center">
          <h3 className="text-xl font-bold mb-2">Game Over!</h3>
          <p className="text-2xl text-amber-400">Final Score: {score}</p>
        </div>
      )}

      {gameActive && (
        <Button variant="outline" onClick={endGame} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" /> End Game
        </Button>
      )}
    </div>
  )
}

