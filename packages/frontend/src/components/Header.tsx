"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="border-b border-border px-4 py-3 bg-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* MeritCoin logo mark */}
          <div className="w-8 h-8 rounded-full gradient-merit flex items-center justify-center">
            <span className="text-bg font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            Merit<span className="text-primary">Coin</span>
          </span>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
