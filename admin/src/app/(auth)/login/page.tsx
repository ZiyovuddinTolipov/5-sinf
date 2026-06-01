"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";
import { signInWithEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Email va parolni kiriting");
      return;
    }

    if (password.length < 6) {
      setFormError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      if (result?.error) {
        setFormError(result.error);
      }
    } catch {
      // redirect throws in server actions — expected
    } finally {
      setLoading(false);
    }
  };

  const displayError =
    formError ||
    (error === "not_admin"
      ? "Sizda admin huquqi yo'q. Iltimos, administrator bilan bog'laning."
      : error === "auth_error"
        ? "Autentifikatsiyada xatolik yuz berdi. Qaytadan urinib ko'ring."
        : "");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Card className="w-full max-w-md shadow-lg border-0 shadow-black/5">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <GraduationCap className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold">5-Sinf Admin</CardTitle>
          <CardDescription className="mt-2">
            Tizimga kirish uchun ma&apos;lumotlaringizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {displayError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {displayError}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              size="lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Kirish
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Faqat administrator hisobi bilan kirish mumkin
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
