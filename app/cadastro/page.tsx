import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Criar conta — LinhaMap" };

export default function CadastroPage() {
  return (
    <div className="container max-w-md py-16">
      <div className="mb-6 flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-muted-foreground">
          Cadastre-se com e-mail e senha para receber alertas dos seus trechos.
        </p>
      </div>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
