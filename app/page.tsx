import { GamePlatform } from "@/components/game-platform"
import { ThemeProvider } from "@/components/theme-provider"
import { AnimatedBackground } from "@/components/animated-background"

export default function Home() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="game-platform-theme">
      <main className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <GamePlatform />
        </div>
      </main>
    </ThemeProvider>
  )
}

