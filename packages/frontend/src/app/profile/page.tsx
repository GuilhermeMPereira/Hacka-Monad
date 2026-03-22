"use client";

import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMeritBalance } from "@/hooks/useMeritCoin";
import { useGetUserMeetups, useGetMeetup } from "@/hooks/useMeetupManager";
import { ReputationCard } from "@/components/ReputationCard";
import { FaucetButton } from "@/components/FaucetButton";
import { FriendsList } from "@/components/FriendsList";
import { TransactionHistory } from "@/components/TransactionHistory";
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

function MeetupHistoryItem({
  meetupId,
  currentUser,
}: {
  meetupId: bigint;
  currentUser: string;
}) {
  const { data, isLoading } = useGetMeetup(meetupId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-text-muted text-sm">Carregando...</span>
      </div>
    );
  }

  if (!data) return null;

  // getMeetup returns a tuple: [id, creator, invitees, restaurantId, status, billAmount, billPayer, createdAt, stakeAmount]
  const rawTuple = data as [bigint, string, string[], string, number, bigint, string, bigint, bigint] | undefined;
  if (!rawTuple) return null;
  const [id, creator, rawInvitees, , status, billAmount] = rawTuple;
  const invitees = rawInvitees || [];

  const isCreator = currentUser.toLowerCase() === creator.toLowerCase();
  const otherLabel = isCreator
    ? `com ${invitees.length} convidado${invitees.length !== 1 ? "s" : ""}`
    : `com ${shortenAddress(creator)}`;

  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-text-primary text-sm font-medium">
          #{id.toString()}
        </span>
        <span className="text-text-muted text-xs">
          {otherLabel}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {billAmount > 0n && (
          <span className="text-xs font-tabular text-text-secondary">
            {parseFloat(formatEther(billAmount)).toFixed(2)} MERIT
          </span>
        )}
        <span
          className={`text-xs font-semibold ${STATUS_COLORS[status] ?? "text-text-muted"}`}
        >
          {STATUS_LABELS[status] ?? ""}
        </span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useMeritBalance(address);
  const { data: meetupIds, isLoading: isMeetupsLoading } = useGetUserMeetups(address);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto card p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="text-text-secondary">Conecte sua wallet para ver seu perfil.</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  const ids = (meetupIds as bigint[]) ?? [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>

      {/* Wallet info */}
      <div className="card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-text-muted text-sm">Endereco</span>
            <p className="font-mono text-sm">{address}</p>
          </div>
          <span className="badge-merit">
            {isBalanceLoading
              ? "..."
              : `${parseFloat(formatEther((balance as bigint) ?? 0n)).toFixed(2)} MERIT`}
          </span>
        </div>
      </div>

      {/* Faucet */}
      <FaucetButton address={address!} />

      {/* Reputation */}
      <ReputationCard address={address!} />

      {/* Meetup history */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Historico de Meetups</h3>

        {isMeetupsLoading && (
          <p className="text-text-muted text-sm">Carregando historico...</p>
        )}

        {!isMeetupsLoading && ids.length === 0 && (
          <p className="text-text-muted text-sm">Nenhum meetup encontrado.</p>
        )}

        {!isMeetupsLoading && ids.length > 0 && (
          <div>
            {[...ids].reverse().map((id) => (
              <MeetupHistoryItem
                key={id.toString()}
                meetupId={id}
                currentUser={address!}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <TransactionHistory />

      {/* Friends */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Meus Amigos</h3>
        <FriendsList />
      </div>
    </div>
  );
}
