"use client";

import { useAccount, useBalance } from "wagmi";
import { monadTestnet } from "@/config/monad";

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance, isLoading } = useBalance({
    address,
    chainId: monadTestnet.id,
  });

  if (!isConnected) {
    return (
      <div className="card p-6 text-center">
        <p className="text-text-secondary">Connect your wallet to get started</p>
        <p className="text-sm text-text-muted mt-2">
          Need testnet MON?{" "}
          <a
            href="https://faucet.monad.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline"
          >
            Get from faucet
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-3">
      <h2 className="text-lg font-semibold">Wallet Info</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-text-secondary">Address</span>
          <p className="font-mono truncate">{address}</p>
        </div>
        <div>
          <span className="text-text-secondary">Balance</span>
          <p className="font-tabular">
            {isLoading
              ? "Loading..."
              : `${balance?.formatted ?? "0"} ${balance?.symbol ?? "MON"}`}
          </p>
        </div>
        <div>
          <span className="text-text-secondary">Network</span>
          <p>{chain?.name ?? "Unknown"}</p>
        </div>
        <div>
          <span className="text-text-secondary">Chain ID</span>
          <p>{chain?.id}</p>
        </div>
      </div>
    </div>
  );
}
