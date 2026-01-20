import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AppHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          AgentLinkdin
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Accueil</Link>
          </Button>
          <Button asChild>
            <Link href="/onboarding">Commencer</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
