"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, LoaderCircle, LogIn, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/auth-browser";

type Mode = "login" | "signup";

const PASSWORD_MIN = 6;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("next") || "/conta";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isSignup) {
      if (password.length < PASSWORD_MIN) {
        setError(`A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`);
        return;
      }
      if (password !== confirm) {
        setError("As senhas não coincidem.");
        return;
      }
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    try {
      if (isSignup) {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        // Sem confirmação de e-mail → já vem sessão; senão, pede verificação.
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <h2 className="text-lg font-bold">Confirme seu e-mail</h2>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique nele e
            depois faça login.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Ir para o login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {isSignup && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={loading}>
            {loading ? (
              <LoaderCircle className="animate-spin" />
            ) : isSignup ? (
              <UserPlus />
            ) : (
              <LogIn />
            )}
            {isSignup ? "Criar conta" : "Entrar"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? (
              <>
                Já tem conta?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Entrar
                </Link>
              </>
            ) : (
              <>
                Ainda não tem conta?{" "}
                <Link href="/cadastro" className="font-medium text-primary hover:underline">
                  Cadastre-se
                </Link>
              </>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

/** Traduz os erros mais comuns do Supabase Auth para PT-BR. */
function translateAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/Invalid login credentials/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/User already registered/i.test(msg)) return "Este e-mail já tem conta. Faça login.";
  if (/Password should be at least/i.test(msg))
    return `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres.`;
  if (/Unable to validate email address/i.test(msg)) return "E-mail inválido.";
  if (/Email not confirmed/i.test(msg))
    return "Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).";
  return `Não foi possível concluir: ${msg}`;
}
