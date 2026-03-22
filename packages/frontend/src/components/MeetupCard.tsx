"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { shortenAddress } from "@/lib/utils";

const STATUS_LABELS: Record<number, string> = {
  0: "Pendente",
  1: "Confirmado",
  2: "Conta Registrada",
  3: "Contestado",
  4: "Liquidado",
  5: "Cancelado",
};

const STATUS_COLORS: Record<number, string> = {
  0: "text-warning",
  1: "text-secondary",
  2: "text-primary",
  3: "text-error",
  4: "text-success",
  5: "text-text-muted",
};

interface MeetupCardProps {
  meetupId: bigint;
  creator: string;
  invitees: string[];
  restaurantId: string;
  status: number;
  currentUser?: string;
  stakeAmount?: bigint;
}

export function MeetupCard({
  meetupId,
  creator,
  invitees,
  restaurantId,
  status,
  currentUser,
  stakeAmount,
}: MeetupCardProps) {
  const isCreator = currentUser?.toLowerCase() === creator.toLowerCase();
  const isInvitee = invitees.some(
    (inv) => inv.toLowerCase() === currentUser?.toLowerCase()
  );
  const role = isCreator ? "Criador" : isInvitee ? "Convidado" : "";

  return (
    <Link href={`/meetups/${meetupId.toString()}`}>
      <div className="card p-5 space-y-3 cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-text-primary">
              Meetup #{meetupId.toString()}
            </h3>
            <p className="text-xs text-text-muted">
              Restaurante: {restaurantId}
            </p>
          </div>
          <span className={`text-sm font-semibold ${STATUS_COLORS[status] ?? "text-text-muted"}`}>
            {STATUS_LABELS[status] ?? "Desconhecido"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-text-muted">Criador</span>
            <p className="font-mono text-xs">{shortenAddress(creator)}</p>
          </div>
          <div>
            <span className="text-text-muted">Convidados</span>
            <p className="text-xs">{invitees.length} convidado{invitees.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {stakeAmount !== undefined && stakeAmount > 0n && (
          <span className="badge-merit text-xs">
            Stake: {formatEther(stakeAmount)} MERIT
          </span>
        )}

        {role && (
          <p className="text-xs text-secondary font-medium">Voce: {role}</p>
        )}
      </div>
    </Link>
  );
}
