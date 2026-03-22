"use client";

import { useState } from "react";
import { useTransactionHistory, type TransactionRecord } from "@/hooks/useTransactionHistory";
import { timeAgo } from "@/lib/timeago";

const TYPE_LABELS: Record<TransactionRecord["type"], string> = {
  faucet: "Faucet",
  create_meetup: "Criar Meetup",
  confirm_meetup: "Confirmar Meetup",
  register_bill: "Registrar Conta",
  settle_bill: "Liquidar Conta",
  cancel_meetup: "Cancelar Meetup",
  approve: "Aprovar",
  stake: "Stake",
};

const TYPE_ICONS: Record<TransactionRecord["type"], string> = {
  faucet: "\uD83E\uDE99",
  create_meetup: "\uD83D\uDCC5",
  confirm_meetup: "\u2705",
  register_bill: "\uD83D\uDCCB",
  settle_bill: "\uD83D\uDCB0",
  cancel_meetup: "\u274C",
  approve: "\uD83D\uDD13",
  stake: "\uD83D\uDD12",
};

const STATUS_STYLES: Record<TransactionRecord["status"], string> = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-success/15 text-success",
  failed: "bg-error/15 text-error",
};

const STATUS_LABELS: Record<TransactionRecord["status"], string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  failed: "Falhou",
};

interface TransactionHistoryProps {
  compact?: boolean;
  maxItems?: number;
}

export function TransactionHistory({
  compact = false,
  maxItems,
}: TransactionHistoryProps) {
  const { transactions, clearHistory } = useTransactionHistory();
  const [showAll, setShowAll] = useState(false);

  const limit = maxItems ?? (compact ? 5 : 20);
  const displayedTxs = showAll ? transactions : transactions.slice(0, limit);
  const hasMore = transactions.length > limit && !showAll;

  if (transactions.length === 0) {
    return (
      <div className={compact ? "" : "card p-6"}>
        {!compact && (
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Historico de Transacoes
          </h3>
        )}
        <p className="text-text-muted text-sm">Nenhuma transacao ainda.</p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "card p-6 space-y-4"}>
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Historico de Transacoes
          </h3>
          <button
            onClick={clearHistory}
            className="text-error text-xs hover:underline"
          >
            Limpar historico
          </button>
        </div>
      )}

      <div className="space-y-1">
        {displayedTxs.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-base shrink-0">{TYPE_ICONS[tx.type]}</span>
              <div className="min-w-0">
                <p className="text-sm text-text-primary truncate">
                  {tx.details}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-muted">
                    {timeAgo(tx.timestamp)}
                  </span>
                  <a
                    href={`https://testnet.monad.xyz/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary text-xs hover:underline font-mono"
                  >
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {tx.amount && (
                <span className="text-xs font-tabular text-text-secondary">
                  {tx.amount}
                </span>
              )}
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[tx.status]}`}
              >
                {STATUS_LABELS[tx.status]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="text-secondary text-sm hover:underline w-full text-center"
        >
          Ver mais ({transactions.length - limit} restantes)
        </button>
      )}
    </div>
  );
}
