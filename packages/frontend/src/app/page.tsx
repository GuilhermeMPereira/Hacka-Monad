"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMeritBalance, useHasClaimed, useClaimFaucet } from "@/hooks/useMeritCoin";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { TransactionHistory } from "@/components/TransactionHistory";

export const dynamic = "force-dynamic";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading: isBalanceLoading } = useMeritBalance(address);
  const { data: hasClaimed, isLoading: isClaimedLoading } = useHasClaimed(address);
  const {
    claim,
    hash: faucetHash,
    isPending: isFaucetPending,
    isConfirming: isFaucetConfirming,
    isSuccess: isFaucetSuccess,
    error: faucetError,
  } = useClaimFaucet();

  const { state: onboardingState, resetOnboarding } = useOnboarding();
  const { addTransaction, updateTransaction } = useTransactionHistory();

  // Track faucet transaction recording
  const faucetTxIdRef = useRef<string | null>(null);
  const faucetHashRecordedRef = useRef<string | null>(null);

  useEffect(() => {
    if (faucetHash && faucetHashRecordedRef.current !== faucetHash) {
      faucetHashRecordedRef.current = faucetHash;
      const txId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      faucetTxIdRef.current = txId;
      addTransaction({
        id: txId,
        type: "faucet",
        hash: faucetHash,
        timestamp: Date.now(),
        details: "Resgatou 500 MERIT do faucet",
        amount: "500 MERIT",
        status: "pending",
      });
    }
  }, [faucetHash, addTransaction]);

  useEffect(() => {
    if (isFaucetSuccess && faucetTxIdRef.current) {
      updateTransaction(faucetTxIdRef.current, { status: "confirmed" });
    }
  }, [isFaucetSuccess, updateTransaction]);

  const showOnboarding = isConnected && !onboardingState.completed;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-3 py-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Empresta <span className="text-primary">Ai</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-lg mx-auto">
          Encontros crypto. Contas divididas. Reputacao on-chain.
        </p>
        <p className="text-text-muted text-sm">
          Conecte-se com amigos, descubra restaurantes e divida contas de forma justa com MERIT na Monad.
        </p>
      </div>

      {!isConnected ? (
        /* CTA para conectar wallet */
        <div className="card p-8 text-center space-y-4">
          <img src="/images/logo.png" alt="Empresta Ai" className="w-20 h-20 object-contain mx-auto" />
          <h2 className="text-xl font-semibold text-text-primary">
            Conecte sua wallet para comecar
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Voce precisa de uma wallet compativel com a Monad Testnet para usar o Empresta Ai.
          </p>
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      ) : (
        <>
          {/* Onboarding Tutorial */}
          {showOnboarding ? (
            <OnboardingTutorial />
          ) : (
            <button
              onClick={resetOnboarding}
              className="text-text-muted text-xs hover:text-text-secondary transition-colors"
            >
              Ver tutorial
            </button>
          )}

          {/* Balance card */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Seu Saldo</h2>
              <span className="badge-merit">
                {isBalanceLoading
                  ? "..."
                  : `${parseFloat(formatEther((balance as bigint) ?? 0n)).toFixed(2)} MERIT`}
              </span>
            </div>

            {/* Faucet */}
            {!isClaimedLoading && !hasClaimed && (
              <div className="bg-bg rounded-card p-4 space-y-3">
                <p className="text-sm text-text-secondary">
                  Voce ainda nao recebeu seus MeritCoins iniciais. Resgate 500 MERIT do faucet!
                </p>
                <button
                  onClick={() => claim()}
                  disabled={isFaucetPending || isFaucetConfirming}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isFaucetPending
                    ? "Confirme na wallet..."
                    : isFaucetConfirming
                    ? "Confirmando (~400ms)..."
                    : "Resgatar 500 MERIT"}
                </button>
                {faucetHash && (
                  <div className="text-sm space-y-1">
                    <a
                      href={`https://testnet.monad.xyz/tx/${faucetHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline font-mono text-xs break-all"
                    >
                      {faucetHash}
                    </a>
                  </div>
                )}
                {isFaucetSuccess && (
                  <p className="text-success text-sm">MeritCoins resgatados com sucesso!</p>
                )}
                {faucetError && (
                  <p className="text-error text-sm">
                    Erro: {faucetError.message.slice(0, 100)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/restaurants" className="card p-5 space-y-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-bg transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary">Restaurantes</h3>
              <p className="text-sm text-text-muted">
                Descubra restaurantes que aceitam crypto
              </p>
            </Link>

            <Link href="/meetups/create" className="card p-5 space-y-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-bg transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary">Criar Meetup</h3>
              <p className="text-sm text-text-muted">
                Convide alguem para um encontro crypto
              </p>
            </Link>

            <Link href="/profile" className="card p-5 space-y-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-bg transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="font-semibold text-text-primary">Seu Perfil</h3>
              <p className="text-sm text-text-muted">
                Veja sua reputacao e historico
              </p>
            </Link>
          </div>

          {/* Compact recent transactions */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Transacoes Recentes</h3>
              <Link
                href="/profile"
                className="text-secondary text-xs hover:underline"
              >
                Ver historico completo
              </Link>
            </div>
            <TransactionHistory compact maxItems={5} />
          </div>
        </>
      )}
    </div>
  );
}
