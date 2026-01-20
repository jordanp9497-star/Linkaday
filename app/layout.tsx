import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import AppHeader from "@/components/AppHeader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgentLinkdin - Génère tes posts LinkedIn automatiquement",
  description: "Génère automatiquement tes posts LinkedIn personnalisés, sans plus te soucier !",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
          <AppHeader />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
