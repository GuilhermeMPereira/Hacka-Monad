import { WalletInfo } from "@/components/WalletInfo";
import { SendTransaction } from "@/components/SendTransaction";
import { ContractInteraction } from "@/components/ContractInteraction";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Merit<span className="text-primary">Coin</span>
        </h1>
        <p className="text-text-secondary">
          Encontros crypto. Contas divididas. Reputacao on-chain.
        </p>
      </div>

      <WalletInfo />
      <SendTransaction />
      <ContractInteraction />
    </div>
  );
}
