import { ModeToggle } from "@/components/mode-toggle"
import { UserProfile } from "@/components/user-profile"
import { Github, Linkedin, Bot } from "lucide-react"
import { useUser } from "@/hooks/useUser"

export function Layout({ children }: { children: React.ReactNode }) {

  const { userName, userImage } = useUser()
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-lg sm:text-xl font-bold">
              <span className="hidden sm:inline">Browser Agent Scheduler</span>
              <span className="sm:hidden">Browser Agent</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            {userName && <UserProfile userName={userName} userImage={userImage} />}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-4 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 flex flex-col items-center space-y-2">
          <div className="flex justify-center space-x-4">
            <a
              href="https://linkedin.com/in/damiancapdevila"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/DamianCapdevila"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Made by Damián Capdevila
          </p>
        </div>
      </footer>
    </div>
  )
} 