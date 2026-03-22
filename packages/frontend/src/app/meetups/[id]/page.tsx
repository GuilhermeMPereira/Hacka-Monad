"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGetMeetup } from "@/hooks/useMeetupManager";
import { MeetupActions } from "@/components/MeetupActions";
import { shortenAddress } from "@/lib/utils";

const STATUS_LABELS: Record<number, string> = {
  0: "Pendente",
  1: "Confirmado",
  2: "Conta Registrada",
  3: "Liquidado",
  4: "Cancelado",
};

const STATUS_COLORS: Record<number, string> = {
  0: "text-warning",
  1: "text-secondary",
  2: "text-primary",
  3: "text-success",
  4: "text-error",
};

export default function MeetupDetailPage() {
  const params = useParams();
  const meetupId = params.id ? BigInt(params.id as string) : undefined;
  const { address, isConnected } = useAccount();

  const { data, isLoading, refetch } = useGetMeetup(meetupId);

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto card p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Detalhes do Meetup</h1>
        <p className="text-text-secondary">Conecte sua wallet para ver este meetup.</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto card p-8 text-center">
        <p className="text-text-muted">Carregando meetup...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-lg mx-auto card p-8 text-center">
        <p className="text-error">Meetup nao encontrado.</p>
      </div>
    );
  }

  const meetup = data as {
    id: bigint;
    creator: string;
    invitee: string;
    restaurantId: string;
    status: number;
    billAmount: bigint;
    billPayer: string;
    createdAt: bigint;
  };

  const status = meetup.status;
  const createdDate = new Date(Number(meetup.createdAt) * 1000);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Meetup #{meetup.id.toString()}
          </h1>
          <p className="text-text-muted text-sm">
            Criado em {createdDate.toLocaleDateString("pt-BR")}
          </p>
        </div>
        <span
          className={`text-sm font-semibold ${STATUS_COLORS[status] ?? "text-text-muted"}`}
        >
          {STATUS_LABELS[status] ?? "Desconhecido"}
        </span>
      </div>

      {/* Info card */}
      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted">Criador</span>
            <p className="font-mono text-xs mt-0.5">{shortenAddress(meetup.creator)}</p>
          </div>
          <div>
            <span className="text-text-muted">Convidado</span>
            <p className="font-mono text-xs mt-0.5">{shortenAddress(meetup.invitee)}</p>
          </div>
          <div>
            <span className="text-text-muted">Restaurante</span>
            <p className="mt-0.5">{meetup.restaurantId}</p>
          </div>
          <div>
            <span className="text-text-muted">Seu papel</span>
            <p className="mt-0.5 text-secondary font-medium">
              {address?.toLowerCase() === meetup.creator.toLowerCase()
                ? "Criador"
                : address?.toLowerCase() === meetup.invitee.toLowerCase()
                ? "Convidado"
                : "Observador"}
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="text-xs text-secondary hover:underline"
        >
          Atualizar dados
        </button>
      </div>

      {/* Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Acoes</h2>
        <MeetupActions
          meetupId={meetup.id}
          status={status}
          creator={meetup.creator}
          invitee={meetup.invitee}
          billAmount={meetup.billAmount}
          billPayer={meetup.billPayer}
          currentUser={address!}
          onSuccess={() => refetch()}
        />
      </div>
    </div>
  );
}
