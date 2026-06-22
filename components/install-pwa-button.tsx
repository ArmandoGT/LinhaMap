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
 *
 * @param alwaysVisible  Quando `true`, o botão é renderizado imediatamente (ideal
 *   para CTAs em landing pages). Enquanto o evento `beforeinstallprompt` não chega,
 *   o clique exibe uma dica inline de como instalar manualmente.
 */
export function InstallPwaButton({
  label = "Instalar app",
  size = "sm",
  variant = "outline",
  className,
  alwaysVisible = false,
}: {
  label?: string;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
  /** Renderiza o botão imediatamente, sem esperar o evento do navegador. */
  alwaysVisible?: boolean;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showTip, setShowTip] = useState(false);

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
      setShowTip(false); // fecha a dica se o evento chegar depois
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

  // Já instalado em modo standalone → não renderiza nada.
  if (installed) return null;

  async function install() {
    if (deferred) {
      // Evento disponível → dispara o prompt nativo do navegador.
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else {
      // Evento ainda não chegou → toggle da dica de instalação manual.
      setShowTip((v) => !v);
    }
  }

  // iOS: sempre mostra a instrução nativa (sem evento de instalação).
  if (isIos) {
    return (
      <p className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <Share className="h-3.5 w-3.5 shrink-0" />
        Para instalar no iPhone: toque em Compartilhar → "Adicionar à Tela de Início".
      </p>
    );
  }

  // Modo padrão (não-alwaysVisible): espera o evento para aparecer.
  if (!alwaysVisible && !deferred) return null;

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        onClick={install}
        size={size}
        variant={variant}
        className={cn(className)}
        title={deferred ? undefined : "Clique para ver como instalar"}
      >
        <Download />
        {label}
      </Button>
      {/* Dica inline: aparece quando alwaysVisible=true mas o evento ainda não chegou */}
      {showTip && !deferred && (
        <p className="max-w-xs rounded-md border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-md">
          Para instalar, abra este site no <strong>Chrome</strong> (Android ou desktop) e
          aguarde alguns instantes. O navegador habilitará a instalação automaticamente.
        </p>
      )}
    </div>
  );
}
