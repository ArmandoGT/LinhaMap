"use client";

import { useState } from "react";
import { Bell, BellRing, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { followSegment } from "@/lib/api-client";
import { CHANNEL_LABELS } from "@/lib/labels";
import { ALERT_CHANNELS, type AlertChannel } from "@/lib/types";

const fieldClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Botão "receber alertas" deste trecho (inscrição para notificações). */
export function FollowButton({ segmentId }: { segmentId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [channel, setChannel] = useState<AlertChannel>("in_app");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await followSegment({
        segment_id: segmentId,
        name: name || null,
        contact: contact || null,
        channel,
      });
      setDone(true);
      setOpen(false);
    } catch {
      /* ignora no MVP */
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Button variant="secondary" disabled className="w-full">
        <BellRing /> Você está acompanhando este trecho
      </Button>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <Bell /> Receber alertas deste trecho
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        placeholder="WhatsApp ou e-mail (opcional)"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />
      <select
        className={fieldClass}
        value={channel}
        onChange={(e) => setChannel(e.target.value as AlertChannel)}
      >
        {ALERT_CHANNELS.map((c) => (
          <option key={c} value={c}>
            Canal: {CHANNEL_LABELS[c]}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button onClick={submit} disabled={loading} className="flex-1">
          {loading ? <LoaderCircle className="animate-spin" /> : <Bell />} Confirmar
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        E-mail e WhatsApp são simulados nesta versão — os alertas aparecem na central de
        notificações.
      </p>
    </div>
  );
}
