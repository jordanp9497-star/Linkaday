"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { Chrome } from "lucide-react"
import { getSiteUrl } from "@/lib/utils"

function LoginForm() {
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
        router.push("/dashboard")
      }
    }
    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGoogleLogin = async () => {
    setLoading(true)

    try {
      const origin = getSiteUrl()
      const redirectTo = `${origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      })

      if (error) {
        toast.error("Erreur", {
          description: error.message,
        })
        setLoading(false)
      }
      // Si succès, l'utilisateur sera redirigé vers Google, puis vers /auth/callback
    } catch (error) {
      toast.error("Une erreur est survenue")
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Connectez-vous avec votre compte Google pour continuer
          </CardDescription>
          {searchParams.get("error") && (
            <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
              Erreur d&apos;authentification. Veuillez réessayer.
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            className="w-full"
            disabled={loading}
            onClick={handleGoogleLogin}
            size="lg"
          >
            {loading ? (
              "Redirection..."
            ) : (
              <>
                <Chrome className="mr-2 h-5 w-5" />
                Continuer avec Google
              </>
            )}
          </Button>
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
