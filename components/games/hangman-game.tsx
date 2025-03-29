"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

interface HangmanGameProps {
  onScoreUpdate: (score: number) => void
}

// Word lists by category
const wordLists = {
  animals: ["elephant", "giraffe", "penguin", "dolphin", "tiger", "zebra", "kangaroo", "octopus"],
  countries: ["canada", "brazil", "australia", "japan", "germany", "egypt", "mexico", "sweden"],
  fruits: ["banana", "strawberry", "pineapple", "watermelon", "orange", "blueberry", "kiwi", "mango"],
  sports: ["basketball", "tennis", "swimming", "volleyball", "soccer", "hockey", "baseball", "cycling"],
}

type Category = keyof typeof wordLists

export function HangmanGame({ onScoreUpdate }: HangmanGameProps) {
  const [word, setWord] = useState("")
  const [category, setCategory] = useState<Category>("animals")
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const maxWrongGuesses = 6

  // Start a new game
  const startGame = (selectedCategory: Category) => {
    setCategory(selectedCategory)
    const words = wordLists[selectedCategory]
    const randomWord = words[Math.floor(Math.random() * words.length)]
    setWord(randomWord)
    setGuessedLetters([])
    setWrongGuesses(0)
    setGameStatus("playing")
    setGameStarted(true)
  }

  // Handle letter guess
  const guessLetter = (letter: string) => {
    if (gameStatus !== "playing" || guessedLetters.includes(letter)) return

    const newGuessedLetters = [...guessedLetters, letter]
    setGuessedLetters(newGuessedLetters)

    // Check if the letter is in the word
    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1
      setWrongGuesses(newWrongGuesses)

      // Check if game is lost
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus("lost")
        setStreak(0)
        onScoreUpdate(score)
      }
    } else {
      // Check if all letters have been guessed
      const isWordGuessed = word.split("").every((char) => newGuessedLetters.includes(char))

      if (isWordGuessed) {
        const wordScore = calculateWordScore()
        const newScore = score + wordScore
        const newStreak = streak + 1

        setScore(newScore)
        setStreak(newStreak)
        setGameStatus("won")
        onScoreUpdate(newScore)
      }
    }
  }

  // Calculate score for the current word
  const calculateWordScore = () => {
    // Base score is word length
    const baseScore = word.length

    // Bonus for fewer wrong guesses
    const wrongGuessMultiplier = 1 - (wrongGuesses / maxWrongGuesses) * 0.5

    // Streak bonus
    const streakBonus = streak > 0 ? streak * 5 : 0

    return Math.floor(baseScore * 10 * wrongGuessMultiplier + streakBonus)
  }

  // Get the display word with guessed letters revealed
  const getDisplayWord = () => {
    return word
      .split("")
      .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
      .join(" ")
  }

  // Get keyboard letters
  const getKeyboardRows = () => {
    return [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
    ]
  }

  // Next word
  const nextWord = () => {
    startGame(category)
  }

  // Draw hangman
  const drawHangman = () => {
    switch (wrongGuesses) {
      case 0:
        return (
          <svg width="160" height="180" viewBox="0 0 160 180" className="mx-auto">
            <line x1="40" y1="160" x2="120" y2="160" stroke="currentColor" strokeWidth="4" />
          </svg>
        )
      case 1:
        return (
          <svg width="160" height="180" viewBox="0 0 160 180" className="mx-auto">
            <line x1="40" y1="160" x2="120" y2="160" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="160" x2="60" y2="20" stroke="currentColor" strokeWidth="4" />
          </svg>
        )
      case 2:
        return (
          <svg width="160" height="180" viewBox="0 0 160 180" className="mx-auto">
            <line x1="40" y1="160" x2="120" y2="160" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="160" x2="60" y2="20" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="4" />
          </svg>
        )
      case 3:
        return (
          <svg width="160" height="180" viewBox="0 0 160 180" className="mx-auto">
            <line x1="40" y1="160" x2="120" y2="160" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="160" x2="60" y2="20" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="20" x2="100" y2="40" stroke="currentColor" strokeWidth="4" />
          </svg>
        )
      case 4:
        return (
          <svg width="160" height="180" viewBox="0 0 160 180" className="mx-auto">
            <line x1="40" y1="160" x2="120" y2="160" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="160" x2="60" y2="20" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="20" x2="100" y2="40" stroke="currentColor" strokeWidth="4" />
            <circle cx="100" cy="50" r="10" fill="currentColor" />
          </svg>
        )
      case 5:
        return (
          <svg width="160" height="180" viewBox="0 0 160 180" className="mx-auto">
            <line x1="40" y1="160" x2="120" y2="160" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="160" x2="60" y2="20" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="20" x2="100" y2="40" stroke="currentColor" strokeWidth="4" />
            <circle cx="100" cy="50" r="10" fill="currentColor" />
            <line x1="100" y1="60" x2="100" y2="100" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="70" x2="80" y2="90" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="70" x2="120" y2="90" stroke="currentColor" strokeWidth="4" />
          </svg>
        )
      case 6:
        return (
          <svg width="160" height="180" viewBox="0 0 160 180" className="mx-auto">
            <line x1="40" y1="160" x2="120" y2="160" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="160" x2="60" y2="20" stroke="currentColor" strokeWidth="4" />
            <line x1="60" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="20" x2="100" y2="40" stroke="currentColor" strokeWidth="4" />
            <circle cx="100" cy="50" r="10" fill="currentColor" />
            <line x1="100" y1="60" x2="100" y2="100" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="70" x2="80" y2="90" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="70" x2="120" y2="90" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="100" x2="80" y2="130" stroke="currentColor" strokeWidth="4" />
            <line x1="100" y1="100" x2="120" y2="130" stroke="currentColor" strokeWidth="4" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <div className="flex items-center gap-2 bg-accent/30 px-3 py-2 rounded-md">
          <span>Score: {score}</span>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-2 rounded-md">
            <span>Streak: {streak}</span>
          </div>
        )}
      </div>

      {!gameStarted ? (
        <div className="mb-6 w-full">
          <h3 className="text-lg font-medium mb-4">Select a category:</h3>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(wordLists) as Category[]).map((cat) => (
              <Button key={cat} onClick={() => startGame(cat)} className="capitalize">
                {cat}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 w-full">
            <Badge variant="outline" className="mb-2 capitalize">
              {category}
            </Badge>

            <div className="flex justify-center mb-6">{drawHangman()}</div>

            <div className="text-center mb-6">
              <div className="text-2xl font-mono tracking-widest mb-2">{getDisplayWord()}</div>

              <div className="text-sm text-muted-foreground">
                {wrongGuesses} / {maxWrongGuesses} wrong guesses
              </div>
            </div>

            {gameStatus === "won" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-800/20 rounded-md text-center"
              >
                <h3 className="text-lg font-bold mb-1">You won!</h3>
                <p className="text-amber-400">+{calculateWordScore()} points</p>
                <Button onClick={nextWord} className="mt-2">
                  Next Word
                </Button>
              </motion.div>
            )}

            {gameStatus === "lost" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-800/20 rounded-md text-center"
              >
                <h3 className="text-lg font-bold mb-1">Game Over!</h3>
                <p>
                  The word was: <span className="font-bold">{word}</span>
                </p>
                <Button onClick={() => startGame(category)} className="mt-2">
                  Try Again
                </Button>
              </motion.div>
            )}

            {gameStatus === "playing" && (
              <div className="mb-4">
                {getKeyboardRows().map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-1 mb-1">
                    {row.map((letter) => {
                      const isGuessed = guessedLetters.includes(letter)
                      const isCorrect = word.includes(letter) && isGuessed

                      return (
                        <Button
                          key={letter}
                          variant={isGuessed ? (isCorrect ? "default" : "destructive") : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0 font-medium uppercase"
                          disabled={isGuessed || gameStatus !== "playing"}
                          onClick={() => guessLetter(letter)}
                        >
                          {letter}
                        </Button>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setGameStarted(false)
              setScore(0)
              setStreak(0)
            }}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Change Category
          </Button>
        </>
      )}
    </div>
  )
}

