"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button>;

/** Evento não-padrão do Chromium para instalar PWA. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Botão "Instalar app" do PWA.
 *
 * - Chromium (Android/desktop): usa o evento `beforeinstallprompt`. O botão só
 *   aparece quando o navegador considera o app instalável (após interação/heurística)
 *   e some depois de instalado.
 * - iOS/Safari: não há API de instalação — mostra a dica nativa (Compartilhar →
 *   Adicionar à Tela de Início).
 * - Já instalado (rodando em standalone): não renderiza nada.
 */
export function InstallPwaButton({
  label = "Instalar app",
  size = "sm",
  variant = "outline",
  className,
}: {
  label?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }
    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (e: Event) => {
      e.preventDefault(); // impede o mini-infobar do Chrome; abrimos no clique
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  if (deferred) {
    return (
      <Button onClick={install} size={size} variant={variant} className={cn(className)}>
        <Download /> {label}
      </Button>
    );
  }

  // iOS não dispara beforeinstallprompt → instrução manual.
  if (isIos) {
    return (
      <p className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <Share className="h-3.5 w-3.5 shrink-0" />
        Para instalar no iPhone: toque em Compartilhar → “Adicionar à Tela de Início”.
      </p>
    );
  }

  return null;
}
