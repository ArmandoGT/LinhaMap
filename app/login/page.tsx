import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Entrar — LinhaMap" };

export default function LoginPage() {
  return (
    <div className="container max-w-md py-16">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Entrar</h1>
        <p className="text-muted-foreground">
          Acesse sua conta para acompanhar trechos e ver suas denúncias.
        </p>
      </div>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
