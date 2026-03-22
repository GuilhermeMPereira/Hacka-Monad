"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { SIMPLE_STORAGE_ABI, SIMPLE_STORAGE_ADDRESS } from "@/lib/contracts";
import { monadTestnet } from "@/config/monad";

export function ContractInteraction() {
  const { isConnected } = useAccount();
  const [newValue, setNewValue] = useState("");

  const {
    data: stateData,
    isLoading: isReading,
    refetch,
  } = useReadContract({
    address: SIMPLE_STORAGE_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: "getState",
    chainId: monadTestnet.id,
  });

  const {
    writeContract,
    data: writeHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isWriteConfirming, isSuccess: isWriteSuccess } =
    useWaitForTransactionReceipt({ hash: writeHash });

  function handleSetValue(e: React.FormEvent) {
    e.preventDefault();
    if (!newValue) return;
    writeContract({
      address: SIMPLE_STORAGE_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: "setValue",
      args: [BigInt(newValue)],
    });
  }

  if (!isConnected) return null;

  const [currentValue, lastSetter, setCount] = (stateData as
    | [bigint, string, bigint]
    | undefined) ?? [0n, "0x0", 0n];

  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-lg font-semibold">SimpleStorage Contract</h2>

      <div className="bg-bg rounded-card p-4 space-y-2">
        <h3 className="text-sm font-medium text-text-secondary">Current State</h3>
        {isReading ? (
          <p className="text-text-muted">Loading...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Value</span>
              <p className="text-xl font-bold font-tabular">{currentValue.toString()}</p>
            </div>
            <div>
              <span className="text-text-muted">Set Count</span>
              <p className="text-xl font-bold font-tabular">{setCount.toString()}</p>
            </div>
            <div>
              <span className="text-text-muted">Last Setter</span>
              <p className="font-mono text-xs truncate">{lastSetter}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => refetch()}
          className="text-xs text-secondary hover:underline"
        >
          Refresh
        </button>
      </div>

      <form onSubmit={handleSetValue} className="space-y-3">
        <div>
          <label className="text-sm text-text-secondary block mb-1">
            New Value (uint256)
          </label>
          <input
            type="number"
            placeholder="42"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full bg-bg border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isWritePending || isWriteConfirming || !newValue}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isWritePending
            ? "Confirm in wallet..."
            : isWriteConfirming
            ? "Confirming (~400ms)..."
            : "Set Value"}
        </button>
      </form>

      {writeHash && (
        <div className="text-sm space-y-1">
          <p className="text-text-secondary">Tx hash:</p>
          <a
            href={`https://testnet.monad.xyz/tx/${writeHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline font-mono text-xs break-all"
          >
            {writeHash}
          </a>
        </div>
      )}

      {isWriteSuccess && (
        <p className="text-success text-sm">Value updated!</p>
      )}

      {writeError && (
        <p className="text-error text-sm">
          Error: {writeError.message.slice(0, 100)}
        </p>
      )}
    </div>
  );
}
