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

export function MemoryGame({ onScoreUpdate }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [timer, setTimer] = useState(0)
  const [score, setScore] = useState(0)

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [gameStarted, gameCompleted])

  // Check for game completion
  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setGameCompleted(true)
      calculateScore()
    }
  }, [cards])

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards

      if (cards[firstIndex].emoji === cards[secondIndex].emoji) {
        // Match found
        setCards((prevCards) =>
          prevCards.map((card, index) =>
            index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card,
          ),
        )
      }

      // Reset flipped cards after a delay
      const timeout = setTimeout(() => {
        setFlippedCards([])
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [flippedCards, cards])

  const initializeGame = () => {
    // Create pairs of cards with emojis
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))

    setCards(shuffledEmojis)
    setFlippedCards([])
    setMoves(0)
    setTimer(0)
    setGameStarted(false)
    setGameCompleted(false)
    setScore(0)
  }

  const handleCardClick = (index: number) => {
    // Ignore if card is already flipped or matched
    if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length >= 2) {
      return
    }

    // Start game on first card click
    if (!gameStarted) {
      setGameStarted(true)
    }

    // Flip the card
    setCards((prevCards) => prevCards.map((card, i) => (i === index ? { ...card, isFlipped: true } : card)))

    // Add to flipped cards
    setFlippedCards((prev) => [...prev, index])

    // Increment moves if this is the second card
    if (flippedCards.length === 1) {
      setMoves((prev) => prev + 1)
    }
  }

  const calculateScore = () => {
    // Score formula: 1000 - (moves * 10) - (seconds * 5)
    // With minimum score of 100
    const calculatedScore = Math.max(100, 1000 - moves * 10 - timer * 5)
    setScore(calculatedScore)
    onScoreUpdate(calculatedScore)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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
          <div
            key={card.id}
            className={`aspect-square flex items-center justify-center text-3xl cursor-pointer transition-all duration-300 transform ${
              card.isFlipped || card.isMatched ? "bg-slate-600 rotate-y-0" : "bg-slate-700 rotate-y-180"
            } ${card.isMatched ? "bg-green-800" : ""} rounded-md`}
            onClick={() => handleCardClick(index)}
          >
            {(card.isFlipped || card.isMatched) && card.emoji}
          </div>
        ))}
      </div>

      <Button onClick={initializeGame} className="flex items-center">
        <RefreshCw className="mr-2 h-4 w-4" /> New Game
      </Button>
    </div>
  )
}

