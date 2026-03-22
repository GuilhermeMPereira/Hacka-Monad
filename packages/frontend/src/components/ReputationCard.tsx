"use client";

import { useReputation } from "@/hooks/useMeritCoin";

export function ReputationCard({ address }: { address: `0x${string}` }) {
  const { data, isLoading } = useReputation(address);

  const [paid, received] = (data as [bigint, bigint] | undefined) ?? [0n, 0n];
  const total = paid + received;

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Reputacao</h3>

      {isLoading ? (
        <p className="text-text-muted text-sm">Carregando reputacao...</p>
      ) : (
        <>
          {/* Visual bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Score de reputacao</span>
              <span className="font-tabular text-primary">
                {total.toString()} transacoes
              </span>
            </div>
            <div className="w-full bg-bg rounded-full h-2 overflow-hidden">
              <div
                className="h-full gradient-merit rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(Number(total) * 10, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg rounded-card p-4 text-center">
              <p className="text-2xl font-bold font-tabular text-primary">
                {paid.toString()}
              </p>
              <p className="text-xs text-text-muted mt-1">Pagamentos feitos</p>
            </div>
            <div className="bg-bg rounded-card p-4 text-center">
              <p className="text-2xl font-bold font-tabular text-secondary">
                {received.toString()}
              </p>
              <p className="text-xs text-text-muted mt-1">Pagamentos recebidos</p>
            </div>
          </div>

          {/* Level badge */}
          <div className="text-center">
            {total === 0n && (
              <span className="text-text-muted text-sm">Sem transacoes ainda</span>
            )}
            {total > 0n && total < 5n && (
              <span className="badge-merit">Iniciante</span>
            )}
            {total >= 5n && total < 15n && (
              <span className="badge-merit">Ativo</span>
            )}
            {total >= 15n && total < 50n && (
              <span className="badge-merit">Veterano</span>
            )}
            {total >= 50n && (
              <span className="badge-merit">Lenda</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
