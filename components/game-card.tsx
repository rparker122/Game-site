"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, PlayCircle } from "lucide-react"
import { motion } from "framer-motion"

interface GameCardProps {
  title: string
  description: string
  icon: React.ReactNode
  categories: string[]
  difficulty: "easy" | "medium" | "hard"
  highScore?: number
  playCount: number
  onClick: () => void
}

export function GameCard({
  title,
  description,
  icon,
  categories,
  difficulty,
  highScore,
  playCount,
  onClick,
}: GameCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const difficultyColor =
    difficulty === "easy"
      ? "from-green-500/30 to-green-500/10"
      : difficulty === "medium"
        ? "from-amber-500/30 to-amber-500/10"
        : "from-red-500/30 to-red-500/10"

  const difficultyBadge =
    difficulty === "easy"
      ? "bg-green-500/10 text-green-500 border-green-500/20"
      : difficulty === "medium"
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-red-500/10 text-red-500 border-red-500/20"

  return (
    <motion.div
      whileHover={{ scale: 1.03, rotate: isHovered ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card
        className={`backdrop-blur-sm bg-white/10 dark:bg-black/20 border-2 border-white/20 dark:border-white/10 overflow-hidden flex flex-col h-full shadow-xl hover:shadow-2xl transition-all duration-300`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative overflow-hidden h-40 bg-gradient-to-br ${difficultyColor}`}>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={
              isHovered
                ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl transform transition-transform duration-300 scale-100">{icon}</div>
          </motion.div>

          {/* Animated particles */}
          {isHovered && (
            <>
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-white/30"
                  initial={{
                    x: "50%",
                    y: "50%",
                    opacity: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    delay: Math.random() * 0.5,
                  }}
                />
              ))}
            </>
          )}

          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                className="gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
                onClick={onClick}
              >
                <PlayCircle className="h-5 w-5" /> Play Now
              </Button>
            </motion.div>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <motion.h3
                className="text-xl font-bold"
                animate={
                  isHovered
                    ? {
                        color: ["#ffffff", "#f5f5f5", "#ffffff"],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                {title}
              </motion.h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-2 flex-grow">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {categories.map((category) => (
              <Badge key={category} variant="outline" className="capitalize text-xs">
                {category}
              </Badge>
            ))}
            <Badge className={`capitalize text-xs ${difficultyBadge}`}>{difficulty}</Badge>
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex justify-between items-center border-t border-white/10">
          {highScore !== undefined ? (
            <div className="flex items-center text-amber-500 dark:text-amber-400 text-sm">
              <Trophy className="mr-1 h-3.5 w-3.5" />
              <span>{highScore}</span>
            </div>
          ) : (
            <div></div>
          )}
          <div className="text-xs text-muted-foreground">
            {playCount > 0 ? `Played ${playCount} ${playCount === 1 ? "time" : "times"}` : "New!"}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

