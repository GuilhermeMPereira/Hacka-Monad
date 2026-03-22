"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { isAddress } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCreateMeetup } from "@/hooks/useMeetupManager";
import { fetchRestaurants, type Restaurant } from "@/lib/api";
import { FriendsList } from "@/components/FriendsList";
import { shortenAddress } from "@/lib/utils";

function CreateMeetupForm() {
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const router = useRouter();

  const preselectedRestaurant = searchParams.get("restaurant") ?? "";

  const [inviteeInput, setInviteeInput] = useState("");
  const [invitees, setInvitees] = useState<string[]>([]);
  const [restaurantId, setRestaurantId] = useState(preselectedRestaurant);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  const {
    createMeetup,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useCreateMeetup();

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch(() => {})
      .finally(() => setLoadingRestaurants(false));
  }, []);

  useEffect(() => {
    if (isSuccess && hash) {
      const timer = setTimeout(() => {
        router.push("/meetups");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, hash, router]);

  function addInvitee(addr: string) {
    const normalized = addr.toLowerCase();
    if (!isAddress(addr)) return;
    if (normalized === address?.toLowerCase()) return;
    if (invitees.some((a) => a.toLowerCase() === normalized)) return;
    setInvitees((prev) => [...prev, addr]);
  }

  function removeInvitee(addr: string) {
    setInvitees((prev) =>
      prev.filter((a) => a.toLowerCase() !== addr.toLowerCase())
    );
  }

  function handleAddFromInput() {
    if (!isAddress(inviteeInput)) return;
    addInvitee(inviteeInput);
    setInviteeInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (invitees.length === 0) return;
    if (!restaurantId) return;
    createMeetup(
      invitees.map((a) => a as `0x${string}`),
      restaurantId
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto card p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Criar Meetup</h1>
        <p className="text-text-secondary">Conecte sua wallet para criar um meetup.</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Meetup</h1>
        <p className="text-text-secondary">
          Convide amigos para um encontro em um restaurante crypto
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="text-sm text-text-secondary block mb-1">
            Restaurante
          </label>
          {loadingRestaurants ? (
            <p className="text-text-muted text-sm">Carregando restaurantes...</p>
          ) : restaurants.length > 0 ? (
            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full bg-bg border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="">Selecione um restaurante</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.cuisine})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="ID do restaurante"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full bg-bg border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
            />
          )}
        </div>

        {/* Invitees list */}
        <div>
          <label className="text-sm text-text-secondary block mb-1">
            Convidados ({invitees.length})
          </label>

          {invitees.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {invitees.map((addr) => (
                <span
                  key={addr}
                  className="inline-flex items-center gap-1.5 bg-bg border border-border rounded-btn px-2.5 py-1 text-xs font-mono"
                >
                  {shortenAddress(addr)}
                  <button
                    type="button"
                    onClick={() => removeInvitee(addr)}
                    className="text-error hover:text-error font-sans font-bold"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0x..."
              value={inviteeInput}
              onChange={(e) => setInviteeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFromInput();
                }
              }}
              className="flex-1 bg-bg border border-border rounded-btn px-3 py-2 font-mono text-sm focus:outline-none focus:border-secondary transition-colors"
            />
            <button
              type="button"
              onClick={handleAddFromInput}
              disabled={!isAddress(inviteeInput)}
              className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Adicionar convidado
            </button>
          </div>
          {inviteeInput && !isAddress(inviteeInput) && (
            <p className="text-error text-xs mt-1">Endereco invalido</p>
          )}
          {inviteeInput &&
            isAddress(inviteeInput) &&
            inviteeInput.toLowerCase() === address?.toLowerCase() && (
              <p className="text-error text-xs mt-1">
                Voce nao pode convidar a si mesmo
              </p>
            )}
          {inviteeInput &&
            isAddress(inviteeInput) &&
            invitees.some(
              (a) => a.toLowerCase() === inviteeInput.toLowerCase()
            ) && (
              <p className="text-error text-xs mt-1">
                Este endereco ja foi adicionado
              </p>
            )}
        </div>

        <button
          type="submit"
          disabled={
            isPending ||
            isConfirming ||
            !restaurantId ||
            invitees.length === 0
          }
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending
            ? "Confirme na wallet..."
            : isConfirming
            ? "Confirmando (~400ms)..."
            : "Criar Meetup"}
        </button>
      </form>

      {/* Friends list for quick adding */}
      <FriendsList
        selectable
        onSelect={(addr) => addInvitee(addr)}
      />

      {hash && (
        <div className="card p-4 space-y-2">
          <p className="text-sm text-text-secondary">Tx hash:</p>
          <a
            href={`https://testnet.monad.xyz/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline font-mono text-xs break-all"
          >
            {hash}
          </a>
        </div>
      )}

      {isSuccess && (
        <div className="card p-4">
          <p className="text-success text-sm">
            Meetup criado com sucesso! Redirecionando...
          </p>
        </div>
      )}

      {error && (
        <div className="card p-4">
          <p className="text-error text-sm">
            Erro: {error.message.slice(0, 100)}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CreateMeetupPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto card p-8 text-center"><p className="text-text-muted">Carregando...</p></div>}>
      <CreateMeetupForm />
    </Suspense>
  );
}
