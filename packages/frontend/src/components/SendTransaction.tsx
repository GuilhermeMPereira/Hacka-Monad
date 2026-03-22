"use client";

import { useState } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";

export function SendTransaction() {
  const { isConnected } = useAccount();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const {
    sendTransaction,
    data: hash,
    isPending,
    error: sendError,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAddress(to)) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });
  }

  if (!isConnected) return null;

  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-lg font-semibold">Send MON</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-text-secondary block mb-1">Recipient Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-bg border border-border rounded-btn px-3 py-2 font-mono text-sm focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary block mb-1">Amount (MON)</label>
          <input
            type="text"
            placeholder="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-bg border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isPending || isConfirming || !to || !amount}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending
            ? "Confirm in wallet..."
            : isConfirming
            ? "Confirming (~400ms)..."
            : "Send MON"}
        </button>
      </form>

      {hash && (
        <div className="text-sm space-y-1">
          <p className="text-text-secondary">Transaction hash:</p>
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
        <p className="text-success text-sm">Transaction confirmed!</p>
      )}

      {sendError && (
        <p className="text-error text-sm">
          Error: {sendError.message.slice(0, 100)}
        </p>
      )}
    </div>
  );
}
