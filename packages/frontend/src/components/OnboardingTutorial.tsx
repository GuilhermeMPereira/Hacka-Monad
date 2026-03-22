"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useHasClaimed, useClaimFaucet } from "@/hooks/useMeritCoin";
import { useFriends } from "@/hooks/useFriends";

interface StepConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: StepConfig[] = [
  {
    title: "Conecte sua Wallet",
    description: "Conecte sua MetaMask para comecar a usar o Empresta Ai",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 14h.01" />
      </svg>
    ),
  },
  {
    title: "Resgate seus MeritCoins",
    description: "Resgate 500 MERIT gratuitos do faucet para comecar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12" />
        <path d="M15.5 9.5a3 3 0 00-3-2.5H11a3 3 0 000 6h2a3 3 0 010 6h-1.5a3 3 0 01-3-2.5" />
      </svg>
    ),
  },
  {
    title: "Adicione um Amigo",
    description: "Adicione a wallet de um amigo para convidar facilmente",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    title: "Explore Restaurantes",
    description: "Descubra restaurantes que aceitam crypto",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
  },
  {
    title: "Crie seu Primeiro Meetup",
    description: "Convide amigos para um encontro e divida a conta on-chain",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

export function OnboardingTutorial() {
  const { isConnected, address } = useAccount();
  const { state, markStepDone, skipOnboarding } = useOnboarding();
  const { data: hasClaimed } = useHasClaimed(address);
  const { friends } = useFriends();
  const {
    claim,
    isPending: isFaucetPending,
    isConfirming: isFaucetConfirming,
    isSuccess: isFaucetSuccess,
    hash: faucetHash,
    error: faucetError,
  } = useClaimFaucet();

  // Auto-complete step 0 when wallet is connected
  useEffect(() => {
    if (isConnected && !state.stepsCompleted[0]) {
      markStepDone(0);
    }
  }, [isConnected, state.stepsCompleted, markStepDone]);

  // Auto-complete step 1 when faucet is claimed
  useEffect(() => {
    if (hasClaimed && !state.stepsCompleted[1]) {
      markStepDone(1);
    }
  }, [hasClaimed, state.stepsCompleted, markStepDone]);

  // Auto-complete step 2 when friends list has at least 1 friend
  useEffect(() => {
    if (friends.length > 0 && !state.stepsCompleted[2]) {
      markStepDone(2);
    }
  }, [friends.length, state.stepsCompleted, markStepDone]);

  const completedCount = state.stepsCompleted.filter(Boolean).length;

  // Show celebratory message if all steps are done (not yet "skipped/dismissed")
  if (state.completed && completedCount === 5) {
    return (
      <div className="card p-6 text-center space-y-3">
        <div className="w-16 h-16 rounded-full gradient-merit flex items-center justify-center mx-auto">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-bg">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          Parabens! Voce esta pronto para usar o Empresta Ai!
        </h2>
        <p className="text-text-secondary text-sm">
          Todos os passos foram concluidos. Aproveite a plataforma!
        </p>
        <button
          onClick={skipOnboarding}
          className="text-text-muted text-sm hover:text-text-secondary transition-colors"
        >
          Fechar tutorial
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Primeiros Passos</h2>
          <p className="text-text-muted text-sm">
            {completedCount} de 5 passos concluidos
          </p>
        </div>
        <div className="w-10 h-10 rounded-full gradient-merit flex items-center justify-center">
          <span className="text-bg font-bold text-sm">{completedCount}/5</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full gradient-merit rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / 5) * 100}%` }}
        />
      </div>

      {/* Stepper */}
      <div className="space-y-1">
        {STEPS.map((step, index) => {
          const isDone = state.stepsCompleted[index];
          const isCurrent = !isDone && state.stepsCompleted.slice(0, index).every(Boolean);

          return (
            <div key={index} className="flex gap-3">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isDone
                      ? "bg-success/20 text-success"
                      : isCurrent
                      ? "gradient-merit text-bg"
                      : "bg-bg-elevated text-text-muted"
                  }`}
                >
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 min-h-[16px] ${
                      isDone ? "bg-success/30" : "bg-border"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pb-4 flex-1 ${index === STEPS.length - 1 ? "pb-0" : ""}`}>
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 ${isDone ? "text-success" : isCurrent ? "text-primary" : "text-text-muted"}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-semibold ${
                        isDone
                          ? "text-success line-through"
                          : isCurrent
                          ? "text-text-primary"
                          : "text-text-muted"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {step.description}
                    </p>

                    {/* Action for current step */}
                    {isCurrent && (
                      <div className="mt-2">
                        {index === 0 && !isConnected && (
                          <div className="inline-block">
                            <ConnectButton />
                          </div>
                        )}

                        {index === 1 && isConnected && !hasClaimed && (
                          <div className="space-y-2">
                            <button
                              onClick={() => claim()}
                              disabled={isFaucetPending || isFaucetConfirming}
                              className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {isFaucetPending
                                ? "Confirme na wallet..."
                                : isFaucetConfirming
                                ? "Confirmando..."
                                : "Resgatar 500 MERIT"}
                            </button>
                            {faucetHash && (
                              <a
                                href={`https://testnet.monad.xyz/tx/${faucetHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:underline font-mono text-xs break-all block"
                              >
                                {faucetHash}
                              </a>
                            )}
                            {isFaucetSuccess && (
                              <p className="text-success text-xs">Resgatado!</p>
                            )}
                            {faucetError && (
                              <p className="text-error text-xs">
                                Erro: {faucetError.message.slice(0, 80)}
                              </p>
                            )}
                          </div>
                        )}

                        {index === 2 && (
                          <Link
                            href="/profile"
                            className="btn-secondary text-sm inline-block"
                          >
                            Ir para Perfil
                          </Link>
                        )}

                        {index === 3 && (
                          <Link
                            href="/restaurants"
                            onClick={() => markStepDone(3)}
                            className="btn-secondary text-sm inline-block"
                          >
                            Ver Restaurantes
                          </Link>
                        )}

                        {index === 4 && (
                          <Link
                            href="/meetups/create"
                            onClick={() => markStepDone(4)}
                            className="btn-secondary text-sm inline-block"
                          >
                            Criar Meetup
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Also show action for non-current incomplete steps 3 and 4 */}
                    {!isDone && !isCurrent && (index === 3 || index === 4) && (
                      <div className="mt-2">
                        {index === 3 && (
                          <Link
                            href="/restaurants"
                            onClick={() => markStepDone(3)}
                            className="text-text-muted text-xs hover:text-text-secondary transition-colors"
                          >
                            Ver Restaurantes
                          </Link>
                        )}
                        {index === 4 && (
                          <Link
                            href="/meetups/create"
                            onClick={() => markStepDone(4)}
                            className="text-text-muted text-xs hover:text-text-secondary transition-colors"
                          >
                            Criar Meetup
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={skipOnboarding}
        className="text-text-muted text-sm hover:text-text-secondary transition-colors w-full text-center"
      >
        Pular tutorial
      </button>
    </div>
  );
}
