"use client";

import { useClaimFaucet, useHasClaimed, useRequestMore } from "@/hooks/useMeritCoin";

export function FaucetButton({ address }: { address: `0x${string}` }) {
  const { data: hasClaimed, isLoading: isCheckingClaimed } = useHasClaimed(address);
  const {
    claim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useClaimFaucet();

  const topup = useRequestMore();

  if (isCheckingClaimed) {
    return (
      <div className="card p-4">
        <p className="text-text-muted text-sm">Verificando faucet...</p>
      </div>
    );
  }

  if (hasClaimed) {
    return (
      <div className="card p-5 space-y-3">
        <div>
          <h3 className="font-semibold text-text-primary">Recarregar MERIT</h3>
          <p className="text-sm text-text-secondary">
            Precisa de mais MERIT para testes? Adicione +500 a qualquer momento.
          </p>
        </div>
        <button
          onClick={() => topup.requestMore()}
          disabled={topup.isPending || topup.isConfirming}
          className="btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {topup.isPending
            ? "Confirme na wallet..."
            : topup.isConfirming
            ? "Confirmando (~400ms)..."
            : "+ 500 MERIT"}
        </button>
        {topup.hash && (
          <div className="text-sm">
            <a
              href={`https://testnet.monad.xyz/tx/${topup.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:underline font-mono text-xs break-all"
            >
              {topup.hash}
            </a>
          </div>
        )}
        {topup.isSuccess && (
          <p className="text-success text-sm">+500 MERIT adicionados!</p>
        )}
        {topup.error && (
          <p className="text-error text-sm">
            Erro: {topup.error.message.slice(0, 100)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-text-primary">Faucet MeritCoin</h3>
        <p className="text-sm text-text-secondary">
          Resgate 500 MERIT para comecar a usar o app.
        </p>
      </div>

      <button
        onClick={() => claim()}
        disabled={isPending || isConfirming}
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending
          ? "Confirme na wallet..."
          : isConfirming
          ? "Confirmando (~400ms)..."
          : "Resgatar 500 MERIT"}
      </button>

      {hash && (
        <div className="text-sm">
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
        <p className="text-success text-sm">MeritCoins resgatados com sucesso!</p>
      )}

      {error && (
        <p className="text-error text-sm">
          Erro: {error.message.slice(0, 100)}
        </p>
      )}
    </div>
  );
}
