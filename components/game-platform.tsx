"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import { TicTacToe } from "@/components/games/tic-tac-toe"
import { MemoryGame } from "@/components/games/memory-game"
import { SnakeGame } from "@/components/games/snake-game"
import { WhackAMole } from "@/components/games/whack-a-mole"
import { WordScramble } from "@/components/games/word-scramble"
import { Game2048 } from "@/components/games/game-2048"
import { HangmanGame } from "@/components/games/hangman-game"
import { GameCard } from "@/components/game-card"
import { ArrowLeft, Trophy, Search, Gamepad2, Brain, Zap, Clock } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import confetti from "canvas-confetti"

type GameCategory = "all" | "arcade" | "puzzle" | "strategy" | "reflex"

type Game = {
  id: string
  title: string
  description: string
  component: React.ReactNode
  category: GameCategory[]
  icon: React.ReactNode
  highScore?: number
  difficulty: "easy" | "medium" | "hard"
  playCount: number
}

export function GamePlatform() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<GameCategory>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    // Load high scores from localStorage if available
    if (typeof window !== "undefined") {
      const savedScores = localStorage.getItem("gameHighScores")
      return savedScores
        ? JSON.parse(savedScores)
        : {
            memory: 0,
            snake: 0,
            whackamole: 0,
            wordscramble: 0,
            game2048: 0,
            hangman: 0,
          }
    }
    return {
      memory: 0,
      snake: 0,
      whackamole: 0,
      wordscramble: 0,
      game2048: 0,
      hangman: 0,
    }
  })

  const [playCount, setPlayCount] = useState<Record<string, number>>(() => {
    // Load play counts from localStorage if available
    if (typeof window !== "undefined") {
      const savedCounts = localStorage.getItem("gamePlayCounts")
      return savedCounts ? JSON.parse(savedCounts) : {}
    }
    return {}
  })

  // Save high scores to localStorage when they change
  useEffect(() => {
    localStorage.setItem("gameHighScores", JSON.stringify(highScores))
  }, [highScores])

  // Save play counts to localStorage when they change
  useEffect(() => {
    localStorage.setItem("gamePlayCounts", JSON.stringify(playCount))
  }, [playCount])

  const updateHighScore = (gameId: string, score: number) => {
    if (!highScores[gameId] || score > highScores[gameId]) {
      setHighScores((prev) => ({
        ...prev,
        [gameId]: score,
      }))

      // Trigger confetti for new high score
      triggerConfetti()
    }
  }

  const incrementPlayCount = (gameId: string) => {
    setPlayCount((prev) => ({
      ...prev,
      [gameId]: (prev[gameId] || 0) + 1,
    }))
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const games: Game[] = [
    {
      id: "tictactoe",
      title: "Tic Tac Toe",
      description: "The classic game of X's and O's. Play against a friend!",
      component: <TicTacToe />,
      category: ["strategy", "puzzle"],
      icon: (
        <div className="text-blue-500">
          <Gamepad2 className="h-6 w-6" />
        </div>
      ),
      difficulty: "easy",
      playCount: playCount.tictactoe || 0,
    },
    {
      id: "memory",
      title: "Memory Match",
      description: "Test your memory by matching pairs of cards.",
      component: <MemoryGame onScoreUpdate={(score) => updateHighScore("memory", score)} />,
      category: ["puzzle", "reflex"],
      icon: (
        <div className="text-purple-500">
          <Brain className="h-6 w-6" />
        </div>
      ),
      highScore: highScores.memory,
      difficulty: "medium",
      playCount: playCount.memory || 0,
    },
    {
      id: "snake",
      title: "Snake Game",
      description: "Control the snake to eat food and grow without hitting the walls or yourself.",
      component: <SnakeGame onScoreUpdate={(score) => updateHighScore("snake", score)} />,
      category: ["arcade", "reflex"],
      icon: (
        <div className="text-green-500">
          <Zap className="h-6 w-6" />
        </div>
      ),
      highScore: highScores.snake,
      difficulty: "medium",
      playCount: playCount.snake || 0,
    },
    {
      id: "whackamole",
      title: "Whack-a-Mole",
      description: "Test your reflexes by whacking moles as they pop up!",
      component: <WhackAMole onScoreUpdate={(score) => updateHighScore("whackamole", score)} />,
      category: ["arcade", "reflex"],
      icon: (
        <div className="text-amber-500">
          <Clock className="h-6 w-6" />
        </div>
      ),
      highScore: highScores.whackamole,
      difficulty: "easy",
      playCount: playCount.whackamole || 0,
    },
    {
      id: "wordscramble",
      title: "Word Scramble",
      description: "Unscramble letters to form words before time runs out.",
      component: <WordScramble onScoreUpdate={(score) => updateHighScore("wordscramble", score)} />,
      category: ["puzzle", "strategy"],
      icon: (
        <div className="text-indigo-500">
          <Brain className="h-6 w-6" />
        </div>
      ),
      highScore: highScores.wordscramble,
      difficulty: "medium",
      playCount: playCount.wordscramble || 0,
    },
    {
      id: "game2048",
      title: "2048",
      description: "Combine tiles to reach 2048 in this addictive sliding puzzle game.",
      component: <Game2048 onScoreUpdate={(score) => updateHighScore("game2048", score)} />,
      category: ["puzzle", "strategy"],
      icon: (
        <div className="text-rose-500">
          <Brain className="h-6 w-6" />
        </div>
      ),
      highScore: highScores.game2048,
      difficulty: "hard",
      playCount: playCount.game2048 || 0,
    },
    {
      id: "hangman",
      title: "Hangman",
      description: "Guess the word one letter at a time before the hangman is complete.",
      component: <HangmanGame onScoreUpdate={(score) => updateHighScore("hangman", score)} />,
      category: ["puzzle", "strategy"],
      icon: (
        <div className="text-cyan-500">
          <Brain className="h-6 w-6" />
        </div>
      ),
      highScore: highScores.hangman,
      difficulty: "medium",
      playCount: playCount.hangman || 0,
    },
  ]

  const filteredGames = games.filter((game) => {
    const matchesCategory = activeCategory === "all" || game.category.includes(activeCategory)
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const activeGameData = games.find((game) => game.id === activeGame)

  const handleGameSelect = (gameId: string) => {
    setActiveGame(gameId)
    incrementPlayCount(gameId)
  }

  if (activeGame && activeGameData) {
    return (
      <motion.div
        className="container mx-auto py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" className="hover:bg-accent" onClick={() => setActiveGame(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
          </Button>
          <div className="flex items-center gap-4">
            {activeGameData.highScore !== undefined && (
              <div className="flex items-center text-amber-500 dark:text-amber-400">
                <Trophy className="mr-2 h-5 w-5" />
                <span>High Score: {activeGameData.highScore}</span>
              </div>
            )}
            <ModeToggle />
          </div>
        </div>
        <Card className="border-accent/20 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              {activeGameData.icon}
              <div>
                <CardTitle className="text-2xl">{activeGameData.title}</CardTitle>
                <CardDescription>{activeGameData.description}</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeGameData.category.map((cat) => (
                <Badge key={cat} variant="secondary" className="capitalize">
                  {cat}
                </Badge>
              ))}
              <Badge
                variant={
                  activeGameData.difficulty === "easy"
                    ? "outline"
                    : activeGameData.difficulty === "medium"
                      ? "secondary"
                      : "destructive"
                }
                className="capitalize"
              >
                {activeGameData.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>{activeGameData.component}</CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500"
            animate={{
              backgroundPosition: ["0% center", "100% center"],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            Arcade Hub
          </motion.h1>
          <ModeToggle />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Choose a game from our collection and start playing! Challenge yourself or compete with friends.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search games..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs
            defaultValue="all"
            value={activeCategory}
            onValueChange={(value) => setActiveCategory(value as GameCategory)}
          >
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full max-w-md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="arcade">Arcade</TabsTrigger>
              <TabsTrigger value="puzzle">Puzzle</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="reflex">Reflex</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      <AnimatePresence>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GameCard
                title={game.title}
                description={game.description}
                icon={game.icon}
                categories={game.category}
                difficulty={game.difficulty}
                highScore={game.highScore}
                playCount={game.playCount}
                onClick={() => handleGameSelect(game.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No games found matching your criteria.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("")
              setActiveCategory("all")
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}

