"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail } from "lucide-react"
import { getSiteUrl } from "@/lib/utils"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkUser = async () => {
      const client = createClient()
      const {
        data: { user },
      } = await client.auth.getUser()
      if (user) {
        const next = searchParams.get("next") ?? "/profile"
        router.push(next)
      }
    }
    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const next = searchParams.get("next") ?? "/profile"
      const origin = getSiteUrl()
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        toast.error("Erreur", {
          description: error.message,
        })
      } else {
        toast.success("Email envoyé !", {
          description: "Vérifiez votre boîte mail pour vous connecter.",
        })
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de connexion
          </CardDescription>
          {searchParams.get("error") && (
            <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
              Erreur d&apos;authentification. Veuillez réessayer.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Envoi en cours..."
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Recevoir le lien de connexion
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
