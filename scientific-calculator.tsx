"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calculator,
  RotateCcw,
  Delete,
  Percent,
  SquareIcon as SquareRoot,
  X,
  Divide,
  Plus,
  Minus,
  Equal,
  History,
} from "lucide-react"

export default function ScientificCalculator() {
  const [display, setDisplay] = useState("0")
  const [secondaryDisplay, setSecondaryDisplay] = useState("")
  const [memory, setMemory] = useState<number>(0)
  const [history, setHistory] = useState<string[]>([])
  const [waitingForOperand, setWaitingForOperand] = useState(true)
  const [pendingOperator, setPendingOperator] = useState<string | null>(null)
  const [pendingOperand, setPendingOperand] = useState<number | null>(null)
  const [calculationFinished, setCalculationFinished] = useState(false)

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key)
      } else if (e.key === ".") {
        inputDecimal()
      } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
        performOperation(e.key)
      } else if (e.key === "Enter" || e.key === "=") {
        calculateResult()
      } else if (e.key === "Escape") {
        clearAll()
      } else if (e.key === "Backspace") {
        backspace()
      } else if (e.key === "%") {
        percentage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [display, pendingOperand, pendingOperator, waitingForOperand])

  const inputDigit = (digit: string) => {
    if (calculationFinished) {
      setDisplay(digit)
      setSecondaryDisplay("")
      setCalculationFinished(false)
    } else if (waitingForOperand) {
      setDisplay(digit)
      setWaitingForOperand(false)
    } else {
      setDisplay(display === "0" ? digit : display + digit)
    }
  }

  const inputDecimal = () => {
    if (calculationFinished) {
      setDisplay("0.")
      setSecondaryDisplay("")
      setWaitingForOperand(false)
      setCalculationFinished(false)
      return
    }

    if (waitingForOperand) {
      setDisplay("0.")
      setWaitingForOperand(false)
    } else if (!display.includes(".")) {
      setDisplay(display + ".")
    }
  }

  const clearAll = () => {
    setDisplay("0")
    setSecondaryDisplay("")
    setPendingOperand(null)
    setPendingOperator(null)
    setWaitingForOperand(true)
    setCalculationFinished(false)
  }

  const clearEntry = () => {
    setDisplay("0")
    setWaitingForOperand(true)
  }

  const backspace = () => {
    if (waitingForOperand) return

    if (display.length > 1) {
      setDisplay(display.substring(0, display.length - 1))
    } else {
      setDisplay("0")
      setWaitingForOperand(true)
    }
  }

  const changeSign = () => {
    const value = Number.parseFloat(display)
    if (value !== 0) {
      setDisplay((-value).toString())
    }
  }

  const performOperation = (operator: string) => {
    const operand = Number.parseFloat(display)

    if (pendingOperand === null) {
      setPendingOperand(operand)
    } else if (pendingOperator) {
      const result = calculate(pendingOperand, operand, pendingOperator)
      setPendingOperand(result)
      setDisplay(result.toString())
    }

    setWaitingForOperand(true)
    setPendingOperator(operator)
    setSecondaryDisplay(`${pendingOperand === null ? operand : pendingOperand} ${operator}`)
  }

  const calculate = (firstOperand: number, secondOperand: number, operator: string): number => {
    switch (operator) {
      case "+":
        return firstOperand + secondOperand
      case "-":
        return firstOperand - secondOperand
      case "*":
        return firstOperand * secondOperand
      case "/":
        return firstOperand / secondOperand
      case "^":
        return Math.pow(firstOperand, secondOperand)
      case "root":
        return Math.pow(firstOperand, 1 / secondOperand)
      default:
        return secondOperand
    }
  }

  const calculateResult = () => {
    if (pendingOperator && pendingOperand !== null) {
      const operand = Number.parseFloat(display)
      const result = calculate(pendingOperand, operand, pendingOperator)

      const calculation = `${pendingOperand} ${pendingOperator} ${operand} = ${result}`
      setHistory((prev) => [...prev, calculation])

      setDisplay(result.toString())
      setSecondaryDisplay(calculation)
      setPendingOperand(null)
      setPendingOperator(null)
      setWaitingForOperand(true)
      setCalculationFinished(true)
    }
  }

  const percentage = () => {
    const value = Number.parseFloat(display)

    if (pendingOperator === "+" || pendingOperator === "-") {
      // In addition and subtraction, % means percentage of the first operand
      const result = (pendingOperand || 0) * (value / 100)
      setDisplay(result.toString())
    } else {
      // In multiplication and division, % means divide by 100
      setDisplay((value / 100).toString())
    }
  }

  const squareRoot = () => {
    const value = Number.parseFloat(display)
    if (value >= 0) {
      const result = Math.sqrt(value)
      setDisplay(result.toString())
      setSecondaryDisplay(`sqrt(${value}) = ${result}`)
      setHistory((prev) => [...prev, `sqrt(${value}) = ${result}`])
      setWaitingForOperand(true)
      setCalculationFinished(true)
    } else {
      setDisplay("Error")
      setWaitingForOperand(true)
    }
  }

  const square = () => {
    const value = Number.parseFloat(display)
    const result = value * value
    setDisplay(result.toString())
    setSecondaryDisplay(`sqr(${value}) = ${result}`)
    setHistory((prev) => [...prev, `sqr(${value}) = ${result}`])
    setWaitingForOperand(true)
    setCalculationFinished(true)
  }

  const reciprocal = () => {
    const value = Number.parseFloat(display)
    if (value !== 0) {
      const result = 1 / value
      setDisplay(result.toString())
      setSecondaryDisplay(`1/${value} = ${result}`)
      setHistory((prev) => [...prev, `1/${value} = ${result}`])
      setWaitingForOperand(true)
      setCalculationFinished(true)
    } else {
      setDisplay("Error")
      setWaitingForOperand(true)
    }
  }

  const memoryAdd = () => {
    setMemory(memory + Number.parseFloat(display))
  }

  const memorySubtract = () => {
    setMemory(memory - Number.parseFloat(display))
  }

  const memoryRecall = () => {
    setDisplay(memory.toString())
    setWaitingForOperand(false)
  }

  const memoryClear = () => {
    setMemory(0)
  }

  const calculateSin = () => {
    const value = Number.parseFloat(display)
    const result = Math.sin((value * Math.PI) / 180) // Convert to radians
    setDisplay(result.toString())
    setSecondaryDisplay(`sin(${value}°) = ${result}`)
    setHistory((prev) => [...prev, `sin(${value}°) = ${result}`])
    setWaitingForOperand(true)
    setCalculationFinished(true)
  }

  const calculateCos = () => {
    const value = Number.parseFloat(display)
    const result = Math.cos((value * Math.PI) / 180) // Convert to radians
    setDisplay(result.toString())
    setSecondaryDisplay(`cos(${value}°) = ${result}`)
    setHistory((prev) => [...prev, `cos(${value}°) = ${result}`])
    setWaitingForOperand(true)
    setCalculationFinished(true)
  }

  const calculateTan = () => {
    const value = Number.parseFloat(display)
    const result = Math.tan((value * Math.PI) / 180) // Convert to radians
    setDisplay(result.toString())
    setSecondaryDisplay(`tan(${value}°) = ${result}`)
    setHistory((prev) => [...prev, `tan(${value}°) = ${result}`])
    setWaitingForOperand(true)
    setCalculationFinished(true)
  }

  const calculateLog = () => {
    const value = Number.parseFloat(display)
    if (value > 0) {
      const result = Math.log10(value)
      setDisplay(result.toString())
      setSecondaryDisplay(`log(${value}) = ${result}`)
      setHistory((prev) => [...prev, `log(${value}) = ${result}`])
      setWaitingForOperand(true)
      setCalculationFinished(true)
    } else {
      setDisplay("Error")
      setWaitingForOperand(true)
    }
  }

  const calculateLn = () => {
    const value = Number.parseFloat(display)
    if (value > 0) {
      const result = Math.log(value)
      setDisplay(result.toString())
      setSecondaryDisplay(`ln(${value}) = ${result}`)
      setHistory((prev) => [...prev, `ln(${value}) = ${result}`])
      setWaitingForOperand(true)
      setCalculationFinished(true)
    } else {
      setDisplay("Error")
      setWaitingForOperand(true)
    }
  }

  const insertPi = () => {
    setDisplay(Math.PI.toString())
    setWaitingForOperand(false)
  }

  const insertE = () => {
    setDisplay(Math.E.toString())
    setWaitingForOperand(false)
  }

  const clearHistory = () => {
    setHistory([])
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Calculator className="h-5 w-5" />
          Scientific Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standard" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="scientific">Scientific</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-muted p-4 rounded-md mb-4">
            <div className="text-sm text-muted-foreground h-6 text-right overflow-hidden">{secondaryDisplay}</div>
            <div className="text-3xl font-medium text-right overflow-x-auto whitespace-nowrap">{display}</div>
          </div>

          <TabsContent value="standard" className="mt-0">
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                onClick={clearAll}
                className="bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900"
              >
                AC
              </Button>
              <Button variant="outline" onClick={clearEntry}>
                CE
              </Button>
              <Button variant="outline" onClick={backspace}>
                <Delete className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => performOperation("/")}>
                <Divide className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={() => inputDigit("7")}>
                7
              </Button>
              <Button variant="outline" onClick={() => inputDigit("8")}>
                8
              </Button>
              <Button variant="outline" onClick={() => inputDigit("9")}>
                9
              </Button>
              <Button variant="outline" onClick={() => performOperation("*")}>
                <X className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={() => inputDigit("4")}>
                4
              </Button>
              <Button variant="outline" onClick={() => inputDigit("5")}>
                5
              </Button>
              <Button variant="outline" onClick={() => inputDigit("6")}>
                6
              </Button>
              <Button variant="outline" onClick={() => performOperation("-")}>
                <Minus className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={() => inputDigit("1")}>
                1
              </Button>
              <Button variant="outline" onClick={() => inputDigit("2")}>
                2
              </Button>
              <Button variant="outline" onClick={() => inputDigit("3")}>
                3
              </Button>
              <Button variant="outline" onClick={() => performOperation("+")}>
                <Plus className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={changeSign}>
                +/-
              </Button>
              <Button variant="outline" onClick={() => inputDigit("0")}>
                0
              </Button>
              <Button variant="outline" onClick={inputDecimal}>
                .
              </Button>
              <Button variant="outline" onClick={calculateResult} className="bg-primary/10 hover:bg-primary/20">
                <Equal className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="scientific" className="mt-0">
            <div className="grid grid-cols-5 gap-2">
              <Button variant="outline" onClick={memoryAdd} size="sm">
                M+
              </Button>
              <Button variant="outline" onClick={memorySubtract} size="sm">
                M-
              </Button>
              <Button variant="outline" onClick={memoryRecall} size="sm">
                MR
              </Button>
              <Button variant="outline" onClick={memoryClear} size="sm">
                MC
              </Button>
              <Button variant="outline" onClick={percentage} size="sm">
                <Percent className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={square} size="sm">
                x²
              </Button>
              <Button variant="outline" onClick={squareRoot} size="sm">
                <SquareRoot className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => performOperation("^")} size="sm">
                x^y
              </Button>
              <Button variant="outline" onClick={reciprocal} size="sm">
                1/x
              </Button>
              <Button
                variant="outline"
                onClick={clearAll}
                size="sm"
                className="bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900"
              >
                AC
              </Button>

              <Button variant="outline" onClick={calculateSin} size="sm">
                sin
              </Button>
              <Button variant="outline" onClick={calculateCos} size="sm">
                cos
              </Button>
              <Button variant="outline" onClick={calculateTan} size="sm">
                tan
              </Button>
              <Button variant="outline" onClick={backspace} size="sm">
                <Delete className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => performOperation("/")} size="sm">
                <Divide className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={calculateLog} size="sm">
                log
              </Button>
              <Button variant="outline" onClick={calculateLn} size="sm">
                ln
              </Button>
              <Button variant="outline" onClick={insertPi} size="sm">
                π
              </Button>
              <Button variant="outline" onClick={() => inputDigit("7")} size="sm">
                7
              </Button>
              <Button variant="outline" onClick={() => inputDigit("8")} size="sm">
                8
              </Button>

              <Button variant="outline" onClick={() => inputDigit("9")} size="sm">
                9
              </Button>
              <Button variant="outline" onClick={() => performOperation("*")} size="sm">
                <X className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={insertE} size="sm">
                e
              </Button>
              <Button variant="outline" onClick={() => inputDigit("4")} size="sm">
                4
              </Button>
              <Button variant="outline" onClick={() => inputDigit("5")} size="sm">
                5
              </Button>

              <Button variant="outline" onClick={() => inputDigit("6")} size="sm">
                6
              </Button>
              <Button variant="outline" onClick={() => performOperation("-")} size="sm">
                <Minus className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={changeSign} size="sm">
                +/-
              </Button>
              <Button variant="outline" onClick={() => inputDigit("1")} size="sm">
                1
              </Button>
              <Button variant="outline" onClick={() => inputDigit("2")} size="sm">
                2
              </Button>

              <Button variant="outline" onClick={() => inputDigit("3")} size="sm">
                3
              </Button>
              <Button variant="outline" onClick={() => performOperation("+")} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => inputDigit("0")} size="sm" className="col-span-2">
                0
              </Button>
              <Button variant="outline" onClick={inputDecimal} size="sm">
                .
              </Button>
              <Button
                variant="outline"
                onClick={calculateResult}
                size="sm"
                className="bg-primary/10 hover:bg-primary/20"
              >
                <Equal className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1">
                <History className="h-4 w-4" />
                <span>Calculation History</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearHistory} disabled={history.length === 0}>
                <RotateCcw className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {history.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No calculations yet</div>
              ) : (
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div key={index} className="p-2 rounded-md bg-muted/50 text-right">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

