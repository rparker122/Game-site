"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

type Player = "X" | "O" | null
type BoardState = Player[]

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
]

export function TicTacToe() {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X")
  const [winner, setWinner] = useState<Player>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [xWins, setXWins] = useState(0)
  const [oWins, setOWins] = useState(0)

  useEffect(() => {
    checkGameState()
  }, [board])

  const checkGameState = () => {
    // Check for winner
    for (const combo of winningCombinations) {
      const [a, b, c] = combo
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a])
        setWinningLine(combo)

        if (board[a] === "X") setXWins((prev) => prev + 1)
        else setOWins((prev) => prev + 1)

        return
      }
    }

    // Check for draw
    if (!board.includes(null) && !winner) {
      setIsDraw(true)
    }
  }

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setIsDraw(false)
    setWinningLine(null)
  }

  const renderCell = (index: number) => {
    const isWinningCell = winningLine?.includes(index)

    return (
      <div
        key={index}
        className={`flex items-center justify-center h-20 text-4xl font-bold border-2 border-slate-600 cursor-pointer transition-colors
          ${isWinningCell ? "bg-green-800 text-white" : "hover:bg-slate-700"}`}
        onClick={() => handleCellClick(index)}
      >
        {board[index]}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-xs mb-4">
        <div className="text-center px-4 py-2 bg-blue-900 rounded-md">
          <div className="font-bold">Player X</div>
          <div className="text-xl">{xWins}</div>
        </div>
        <div className="text-center px-4 py-2 bg-red-900 rounded-md">
          <div className="font-bold">Player O</div>
          <div className="text-xl">{oWins}</div>
        </div>
      </div>

      <div className="mb-6 h-8 text-center">
        {winner ? (
          <div className="text-xl font-bold text-green-400">Player {winner} wins!</div>
        ) : isDraw ? (
          <div className="text-xl font-bold text-yellow-400">It's a draw!</div>
        ) : (
          <div className="text-xl">
            Current player:{" "}
            <span className={currentPlayer === "X" ? "text-blue-400" : "text-red-400"}>{currentPlayer}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-xs mb-6">
        {Array(9)
          .fill(null)
          .map((_, index) => renderCell(index))}
      </div>

      <Button onClick={resetGame} className="flex items-center">
        <RefreshCw className="mr-2 h-4 w-4" /> New Game
      </Button>
    </div>
  )
}

