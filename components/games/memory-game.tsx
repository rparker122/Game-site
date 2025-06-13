"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Clock, Award } from "lucide-react"

interface MemoryGameProps {
  onScoreUpdate: (score: number) => void
}

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const EMOJIS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🦁", "🐯", "🐨", "🐮"]

// Toggle this to true when the game is ready
const IS_GAME_ENABLED = false

export function MemoryGame({ onScoreUpdate }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [score, setScore] = useState(0)
  const [disableClick, setDisableClick] = useState(false)

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, gameCompleted])

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setGameCompleted(true)
      calculateScore()
    }
  }, [cards])

  useEffect(() => {
    if (flippedCards.length === 2) {
      setDisableClick(true)
      const [firstIndex, secondIndex] = flippedCards

      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        setCards((prevCards) =>
          prevCards.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, isMatched: true }
              : card,
          ),
        )
      }

      const timeout = setTimeout(() => {
        setFlippedCards([])
        setDisableClick(false)
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [flippedCards, cards])

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const initializeGame = () => {
    const shuffledEmojis = shuffleArray([...EMOJIS, ...EMOJIS])
    const initialCards: Card[] = shuffledEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }))

    setCards(initialCards)
    setFlippedCards([])
    setMoves(0)
    setTimer(0)
    setGameStarted(false)
    setGameCompleted(false)
    setScore(0)
    setDisableClick(false)
  }

  const handleCardClick = (index: number) => {
    if (
      disableClick ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedCards.length >= 2
    ) {
      return
    }

    if (!gameStarted) {
      setGameStarted(true)
    }

    setCards((prevCards) =>
      prevCards.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card,
      ),
    )

    setFlippedCards((prev) => [...prev, index])

    if (flippedCards.length === 1) {
      setMoves((prev) => prev + 1)
    }
  }

  const calculateScore = () => {
    const calculatedScore = Math.max(100, 1000 - moves * 10 - timer * 5)
    setScore(calculatedScore)
    onScoreUpdate(calculatedScore)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!IS_GAME_ENABLED) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        <div className="bg-yellow-100 text-yellow-800 px-6 py-4 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-2">🚧 Memory Game</h2>
          <p>This game is currently in development. Please check back later!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <div className="flex items-center bg-slate-700 px-3 py-2 rounded-md">
          <Clock className="mr-2 h-4 w-4" />
          <span>{formatTime(timer)}</span>
        </div>
        <div className="flex items-center bg-slate-700 px-3 py-2 rounded-md">
          <span>Moves: {moves}</span>
        </div>
      </div>

      {gameCompleted && (
        <div className="mb-4 p-4 bg-green-800 rounded-md text-center">
          <h3 className="text-xl font-bold mb-2">Game Completed!</h3>
          <div className="flex items-center justify-center text-amber-400 text-2xl">
            <Award className="mr-2 h-6 w-6" />
            <span>{score} points</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 w-full max-w-md mb-6">
        {cards.map((card, index) => (
          <button
            key={card.id}
            aria-label={`Card ${index + 1}`}
            onClick={() => handleCardClick(index)}
            onKeyDown={(e) => e.key === "Enter" && handleCardClick(index)}
            className={`aspect-square flex items-center justify-center text-3xl transition-all duration-300 rounded-md select-none
              ${card.isMatched ? "bg-green-800 animate-pulse" : ""}
              ${card.isFlipped || card.isMatched ? "bg-slate-600" : "bg-slate-700"}
            `}
          >
            {(card.isFlipped || card.isMatched) && card.emoji}
          </button>
        ))}
      </div>

      <Button onClick={initializeGame} className="flex items-center">
        <RefreshCw className="mr-2 h-4 w-4" /> New Game
      </Button>
    </div>
  )
}
