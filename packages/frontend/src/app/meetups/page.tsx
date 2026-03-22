"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useGetUserMeetups, useGetMeetup } from "@/hooks/useMeetupManager";
import { MeetupCard } from "@/components/MeetupCard";

function MeetupItem({
  meetupId,
  currentUser,
}: {
  meetupId: bigint;
  currentUser: string;
}) {
  const { data, isLoading } = useGetMeetup(meetupId);

  if (isLoading) {
    return (
      <div className="card p-5">
        <p className="text-text-muted text-sm">Carregando meetup #{meetupId.toString()}...</p>
      </div>
    );
  }

  if (!data) return null;

  // getMeetup returns a tuple: [id, creator, invitees, restaurantId, status, billAmount, billPayer, createdAt, stakeAmount]
  const [id, creator, invitees, restaurantId, status, , , , stakeAmount] =
    data as [bigint, string, string[], string, number, bigint, string, bigint, bigint];

  return (
    <MeetupCard
      meetupId={id}
      creator={creator}
      invitees={invitees}
      restaurantId={restaurantId}
      status={status}
      currentUser={currentUser}
      stakeAmount={stakeAmount}
    />
  );
}

export default function MeetupsPage() {
  const { address, isConnected } = useAccount();
  const { data: meetupIds, isLoading } = useGetUserMeetups(address);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto card p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Meus Meetups</h1>
        <p className="text-text-secondary">Conecte sua wallet para ver seus meetups.</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  const ids = (meetupIds as bigint[]) ?? [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Meetups</h1>
          <p className="text-text-secondary">
            {ids.length} meetup{ids.length !== 1 ? "s" : ""} encontrado{ids.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/meetups/create" className="btn-primary text-sm">
          Novo Meetup
        </Link>
      </div>

      {isLoading && (
        <div className="card p-8 text-center">
          <p className="text-text-muted">Carregando meetups...</p>
        </div>
      )}

      {!isLoading && ids.length === 0 && (
        <div className="card p-8 text-center space-y-3">
          <p className="text-text-muted">Voce ainda nao tem meetups.</p>
          <Link href="/meetups/create" className="btn-primary inline-block text-sm">
            Criar primeiro meetup
          </Link>
        </div>
      )}

      {!isLoading && ids.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...ids].reverse().map((id) => (
            <MeetupItem key={id.toString()} meetupId={id} currentUser={address!} />
          ))}
        </div>
      )}
    </div>
  );
}
