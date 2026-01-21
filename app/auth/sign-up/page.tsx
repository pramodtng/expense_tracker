"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wallet, Upload, X } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  /* ---------------- Avatar handlers ---------------- */

  // const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (!file) return

  //   if (!file.type.startsWith("image/")) {
  //     setError("Please upload an image file")
  //     return
  //   }

  //   if (file.size > 5 * 1024 * 1024) {
  //     setError("Avatar image must be less than 5MB")
  //     return
  //   }

  //   setAvatarFile(file)
  //   setAvatarPreview(URL.createObjectURL(file))
  //   setError(null)
  // }

  // const removeAvatar = () => {
  //   setAvatarFile(null)
  //   setAvatarPreview(null)
  // }

  /* ---------------- Signup handler ---------------- */

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
      setIsLoading(false)
      return
    }

    try {
      /* 1️⃣ Create user */
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            username,
            full_name: fullName,
          },
        },
      })

      if (authError) throw authError
      if (!data.user) throw new Error("User creation failed")

      /* 2️⃣ Upload avatar AFTER signup */
      // if (avatarFile) {
      //   const fileExt = avatarFile.name.split(".").pop()
      //   const filePath = `${data.user.id}/avatar.${fileExt}`

      //   const { error: uploadError } = await supabase.storage
      //     .from("avatars")
      //     .upload(filePath, avatarFile, { upsert: true })

      //   if (!uploadError) {
      //     const { data: urlData } = supabase.storage
      //       .from("avatars")
      //       .getPublicUrl(filePath)

      //     /* 3️⃣ Update profile created by trigger */
      //     await supabase
      //       .from("profiles")
      //       .update({ avatar_url: urlData.publicUrl })
      //       .eq("id", data.user.id)
      //   }
      // }

      router.push("/auth/check-email")
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-linear-to-br from-emerald-50 to-teal-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-900">Budget Tracker</h1>
            <p className="text-sm text-emerald-700">Start managing your finances</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Enter your details to get started</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSignUp} className="flex flex-col gap-6">
                {/* Avatar */}
                {/* <div className="grid gap-2">
                  <Label>Profile Picture (Optional)</Label>
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          className="h-20 w-20 rounded-full object-cover border"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-emerald-600" />
                      </div>
                    )}
                    <Input type="file" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                </div> */}

                {/* Fields */}
                <Input placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
                <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <Input type="password" placeholder="Confirm Password" value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>

                <p className="text-sm text-center">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="underline text-emerald-700">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
