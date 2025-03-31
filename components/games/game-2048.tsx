"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Game2048Props {
  onScoreUpdate: (score: number) => void;
}

type Cell = {
  value: number;
  id: string;
  mergedFrom?: boolean;
  isNew?: boolean;
};

type Direction = "up" | "down" | "left" | "right";

export function Game2048({ onScoreUpdate }: Game2048Props) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver && !keepPlaying) return;
      const keyMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        move(keyMap[e.key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [grid, gameOver, keepPlaying]);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameOver && !keepPlaying) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        move(dx > 0 ? "right" : "left");
      } else if (Math.abs(dy) > 50) {
        move(dy > 0 ? "down" : "up");
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [grid, gameOver, keepPlaying]);

  const startGame = () => {
    const emptyGrid = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => ({
        value: 0,
        id: Math.random().toString(36).substr(2, 9),
      }))
    );
    const gridWithTiles = addRandomTile(addRandomTile(emptyGrid));
    setGrid(gridWithTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
  };

  const addRandomTile = (currentGrid: Cell[][]) => {
    const emptyCells: { row: number; col: number }[] = [];
    currentGrid.forEach((row, rowIndex) =>
      row.forEach((cell, colIndex) => {
        if (cell.value === 0) emptyCells.push({ row: rowIndex, col: colIndex });
      })
    );

    if (emptyCells.length > 0) {
      const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentGrid[row][col] = {
        value: Math.random() < 0.9 ? 2 : 4,
        id: Math.random().toString(36).substr(2, 9),
        isNew: true,
      };
    }

    return currentGrid;
  };

  const move = (direction: Direction) => {
    let newGrid = grid.map((row) => row.map((cell) => ({ ...cell, mergedFrom: false, isNew: false })));
    let moved = false;
    let scoreIncrease = 0;

    const moveRow = (row: Cell[]) => {
      const newRow: Cell[] = row.filter((cell) => cell.value !== 0);
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i].value === newRow[i + 1].value && !newRow[i].mergedFrom) {
          newRow[i].value *= 2;
          newRow[i].mergedFrom = true;
          scoreIncrease += newRow[i].value;
          newRow.splice(i + 1, 1);
          newRow.push({ value: 0, id: Math.random().toString(36).substr(2, 9) });
        }
      }
      while (newRow.length < 4) newRow.push({ value: 0, id: Math.random().toString(36).substr(2, 9) });
      return newRow;
    };

    if (direction === "left") {
      newGrid = newGrid.map(moveRow);
    } else if (direction === "right") {
      newGrid = newGrid.map((row) => moveRow(row.reverse()).reverse());
    } else if (direction === "up" || direction === "down") {
      for (let col = 0; col < 4; col++) {
        let column = newGrid.map((row) => row[col]);
        if (direction === "down") column.reverse();
        column = moveRow(column);
        if (direction === "down") column.reverse();
        for (let row = 0; row < 4; row++) newGrid[row][col] = column[row];
      }
    }

    if (JSON.stringify(grid) !== JSON.stringify(newGrid)) {
      setScore((prev) => {
        const newScore = prev + scoreIncrease;
        onScoreUpdate(newScore);
        return newScore;
      });

      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
    }

    if (isGameOver(newGrid)) {
      setGameOver(true);
      toast({ title: "Game Over!", description: `Your score: ${score + scoreIncrease}` });
    }
  };

  const isGameOver = (grid: Cell[][]) => {
    return !grid.flat().some((cell) => cell.value === 0) &&
      !grid.some((row, r) => row.some((cell, c) => 
        (c < 3 && cell.value === row[c + 1].value) || (r < 3 && cell.value === grid[r + 1][c].value)
      ));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <span>Score: {score}</span>
        <Button onClick={startGame} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" /> New Game
        </Button>
      </div>
      {/* Grid Rendering */}
      {/* UI Components */}
    </div>
  );
}
