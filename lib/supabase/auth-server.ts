/**
 * Cliente Supabase server-side para autenticação (lê/grava os cookies da sessão).
 * Diferente de getSupabaseAdmin (service role) — aqui usamos a chave pública e
 * o contexto do usuário logado para identificar quem está fazendo a requisição.
 */
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True quando as chaves públicas estão presentes (auth habilitada). */
export function authConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado de um Server Component (cookies somente leitura);
          // o middleware cuida de renovar a sessão.
        }
      },
    },
  });
}

/** Retorna o usuário autenticado (ou null se anônimo / auth desabilitada). */
export async function getSessionUser(): Promise<User | null> {
  if (!authConfigured()) return null;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
