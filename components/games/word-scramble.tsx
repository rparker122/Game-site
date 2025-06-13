"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Timer, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface WordScrambleProps {
  onScoreUpdate: (score: number) => void
}

// Word lists by difficulty
const wordLists = {
  easy: [
    "apple",
    "banana",
    "orange",
    "grape",
    "melon",
    "peach",
    "lemon",
    "cherry",
    "plum",
    "kiwi",
    "house",
    "mouse",
    "chair",
    "table",
    "phone",
    "water",
    "plant",
    "smile",
    "happy",
    "light",
  ],
  medium: [
    "computer",
    "keyboard",
    "monitor",
    "speaker",
    "printer",
    "elephant",
    "giraffe",
    "penguin",
    "dolphin",
    "octopus",
    "mountain",
    "waterfall",
    "forest",
    "desert",
    "island",
    "birthday",
    "holiday",
    "weekend",
    "morning",
    "evening",
  ],
  hard: [
    "algorithm",
    "developer",
    "interface",
    "database",
    "framework",
    "psychology",
    "philosophy",
    "chemistry",
    "biology",
    "physics",
    "restaurant",
    "university",
    "government",
    "community",
    "environment",
    "experience",
    "opportunity",
    "technology",
    "information",
    "communication",
  ],
}

export function WordScramble({ onScoreUpdate }: WordScrambleProps) {
  const [currentWord, setCurrentWord] = useState("")
  const [scrambledWord, setScrambledWord] = useState("")
  const [userInput, setUserInput] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameActive, setGameActive] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [wordHistory, setWordHistory] = useState<string[]>([])
  const [showAnswer, setShowAnswer] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start game
  const startGame = () => {
    setScore(0)
    setTimeLeft(60)
    setGameActive(true)
    setWordHistory([])
    setFeedback(null)
    setShowAnswer(false)
    getNewWord()

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // End game
  const endGame = () => {
    setGameActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    setShowAnswer(true)
    onScoreUpdate(score)
  }

  // Get a new word based on difficulty
  const getNewWord = () => {
    const wordList = wordLists[difficulty]
    let newWord

    // Try to get a word that hasn't been used yet
    const unusedWords = wordList.filter((word) => !wordHistory.includes(word))

    if (unusedWords.length > 0) {
      newWord = unusedWords[Math.floor(Math.random() * unusedWords.length)]
    } else {
      // If all words have been used, reset history and pick any word
      setWordHistory([])
      newWord = wordList[Math.floor(Math.random() * wordList.length)]
    }

    setCurrentWord(newWord)
    setScrambledWord(scrambleWord(newWord))
    setUserInput("")
    setWordHistory((prev) => [...prev, newWord])
  }

  // Scramble a word
  const scrambleWord = (word: string) => {
    const wordArray = word.split("")
    let scrambled = word

    // Keep scrambling until we get a different arrangement
    while (scrambled === word) {
      for (let i = wordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]]
      }
      scrambled = wordArray.join("")
    }

    return scrambled
  }

  // Check user's answer
  const checkAnswer = () => {
    if (userInput.toLowerCase() === currentWord.toLowerCase()) {
      // Correct answer
      setScore((prev) => prev + getScoreForWord())
      setFeedback("correct")

      // Show feedback briefly then get new word
      setTimeout(() => {
        setFeedback(null)
        getNewWord()
      }, 1000)
    } else {
      // Incorrect answer
      setFeedback("incorrect")

      // Clear feedback after a moment
      setTimeout(() => {
        setFeedback(null)
      }, 1000)
    }
  }

  // Calculate score based on word length and difficulty
  const getScoreForWord = () => {
    const baseScore = currentWord.length
    const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3

    return baseScore * difficultyMultiplier
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userInput.trim() && gameActive) {
      checkAnswer()
    }
  }

  // Skip current word
  const skipWord = () => {
    getNewWord()
    // Penalty for skipping
    setScore((prev) => Math.max(0, prev - 1))
  }

  // Auto focus input when scrambledWord changes or game starts
  useEffect(() => {
    if (gameActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [scrambledWord, gameActive])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
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

      {!gameActive && !showAnswer && (
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
          <Progress value={(timeLeft / 60) * 100} className="w-full mb-6" />

          <div className="w-full max-w-md mb-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-medium mb-2">Unscramble this word:</h3>
              <div className="flex justify-center mb-2">
                {scrambledWord.split("").map((letter, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-10 h-12 m-1 bg-primary/20 rounded-md flex items-center justify-center text-xl font-bold"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>

              <Badge variant="outline" className="mb-4">
                {difficulty === "easy" ? "Easy" : difficulty === "medium" ? "Medium" : "Hard"}
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your answer..."
                  className="pr-10"
                  autoComplete="off"
                  inputMode="text"
                  spellCheck={false}
                  aria-label="Unscrambled word input"
                />
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      aria-live="polite"
                    >
                      {feedback === "correct" ? (
                        <Check className="text-green-500 h-5 w-5" />
                      ) : (
                        <X className="text-red-500 h-5 w-5" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Check
                </Button>
                <Button type="button" variant="outline" onClick={skipWord}>
                  Skip
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {!gameActive && showAnswer && (
        <div className="mb-6 p-4 bg-red-800/20 rounded-md text-center max-w-md w-full">
          <h3 className="text-xl font-bold mb-2">Game Over!</h3>
          <p className="text-lg mb-4">
            Time's up! The correct answer was:{" "}
            <span className="font-semibold text-amber-400">{currentWord}</span>
          </p>
          <p className="text-2xl text-amber-400 mb-4">Final Score: {score}</p>
          <Button onClick={startGame} className="w-full" leftIcon={<RefreshCw />}>
            Restart Game
          </Button>
        </div>
      )}

      {gameActive && (
        <Button variant="outline" onClick={endGame} className="flex items-center mt-4">
          <RefreshCw className="mr-2 h-4 w-4" /> End Game
        </Button>
      )}
    </div>
  )
}
