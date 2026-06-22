"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button>;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Botão "Instalar app" — sempre visível.
 *
 * - App já instalado (standalone): não renderiza nada.
 * - Chrome/Edge/Samsung (Android & desktop): clique dispara o prompt nativo.
 * - iOS/Safari: clique abre dica inline com as instruções manuais.
 * - Qualquer outro navegador: clique abre dica inline genérica.
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
  const [platform, setPlatform] = useState<"ios" | "other" | null>(null);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };

    // Já rodando como app instalado → esconde o botão.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    setPlatform(/iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "other");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowTip(false);
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

  // Único caso em que o botão some: app já instalado.
  if (installed) return null;

  async function handleClick() {
    if (deferred) {
      // Chrome/Edge: prompt nativo de instalação.
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else {
      // iOS ou outros: toggle da dica inline.
      setShowTip((v) => !v);
    }
  }

  const tipText =
    platform === "ios"
      ? 'No Safari, toque em Compartilhar (□↑) → "Adicionar à Tela de Início".'
      : "Abra este site no Chrome (Android ou desktop). O botão de instalação aparecerá automaticamente.";

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button
        onClick={handleClick}
        size={size}
        variant={variant}
        className={cn(className)}
      >
        <Download />
        {label}
      </Button>

      {showTip && (
        <p className="max-w-xs rounded-md border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-md">
          {tipText}
        </p>
      )}
    </div>
  );
}
