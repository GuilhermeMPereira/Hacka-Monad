"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGetMeetup, useGetConfirmationStatus } from "@/hooks/useMeetupManager";
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

function InviteeRow({
  meetupId,
  inviteeAddress,
}: {
  meetupId: bigint;
  inviteeAddress: string;
}) {
  const { data: confirmed } = useGetConfirmationStatus(
    meetupId,
    inviteeAddress as `0x${string}`
  );

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="font-mono text-xs text-text-primary">
        {shortenAddress(inviteeAddress)}
      </span>
      <span
        className={`text-xs font-semibold ${
          confirmed ? "text-success" : "text-warning"
        }`}
      >
        {confirmed ? "Confirmado" : "Pendente"}
      </span>
    </div>
  );
}

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

  // getMeetup returns a tuple: [id, creator, invitees, restaurantId, status, billAmount, billPayer, createdAt, stakeAmount]
  const [id, creator, invitees, restaurantId, status, billAmount, billPayer, createdAt, stakeAmount] =
    data as [bigint, string, string[], string, number, bigint, string, bigint, bigint];

  const createdDate = new Date(Number(createdAt) * 1000);
  const isCreator = address?.toLowerCase() === creator.toLowerCase();
  const isInvitee = invitees.some(
    (inv) => inv.toLowerCase() === address?.toLowerCase()
  );

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Meetup #{id.toString()}
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
            <p className="font-mono text-xs mt-0.5">{shortenAddress(creator)}</p>
          </div>
          <div>
            <span className="text-text-muted">Restaurante</span>
            <p className="mt-0.5">{restaurantId}</p>
          </div>
          <div>
            <span className="text-text-muted">Seu papel</span>
            <p className="mt-0.5 text-secondary font-medium">
              {isCreator
                ? "Criador"
                : isInvitee
                ? "Convidado"
                : "Observador"}
            </p>
          </div>
          <div>
            <span className="text-text-muted">Convidados</span>
            <p className="mt-0.5">{invitees.length} convidado{invitees.length !== 1 ? "s" : ""}</p>
          </div>
          <div>
            <span className="text-text-muted">Stake</span>
            <p className="mt-0.5">
              {stakeAmount > 0n ? (
                <span className="badge-merit text-xs">{formatEther(stakeAmount)} MERIT por participante</span>
              ) : (
                <span className="text-text-muted">Sem stake</span>
              )}
            </p>
          </div>
        </div>

        {/* Invitees list with confirmation status */}
        <div>
          <h4 className="text-sm font-semibold text-text-secondary mb-2">
            Lista de convidados
          </h4>
          <div className="bg-bg rounded-btn p-3">
            {invitees.map((inv) => (
              <InviteeRow
                key={inv}
                meetupId={id}
                inviteeAddress={inv}
              />
            ))}
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
          meetupId={id}
          status={status}
          creator={creator}
          invitees={invitees}
          billAmount={billAmount}
          billPayer={billPayer}
          stakeAmount={stakeAmount}
          currentUser={address!}
          onSuccess={() => refetch()}
        />
      </div>
    </div>
  );
}
