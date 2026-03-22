"use client";

import { useReputation } from "@/hooks/useMeritCoin";

interface NftBadge {
  image: string;
  title: string;
  description: string;
  rarity: string;
  rarityColor: string;
}

function getReputationNft(paid: bigint, received: bigint): NftBadge {
  const totalNum = Number(paid + received);
  const paidNum = Number(paid);
  const receivedNum = Number(received);

  // No transactions yet
  if (totalNum === 0) {
    return {
      image: "/images/nfts/pao duro.png",
      title: "Pao Duro",
      description: "Ainda nao fez nenhuma transacao. Sera que vai pagar?",
      rarity: "Comum",
      rarityColor: "text-text-muted",
    };
  }

  // More received than paid = doesn't pay their share
  if (receivedNum > paidNum) {
    return {
      image: "/images/nfts/Caloteiro.png",
      title: "Caloteiro",
      description: "Costuma dar cano nos amigos. Cuidado ao dividir a conta!",
      rarity: "Infame",
      rarityColor: "text-error",
    };
  }

  // Always pays - high paid count (the generous legend)
  if (paidNum >= 5 && paidNum > receivedNum * 2) {
    return {
      image: "/images/nfts/velho da lancha.png",
      title: "Velho da Lancha",
      description: "Sempre paga a conta inteira. Lenda viva dos encontros!",
      rarity: "Mitico",
      rarityColor: "text-primary",
    };
  }

  // Paid more than received = reliable person
  if (paidNum > receivedNum) {
    return {
      image: "/images/nfts/paga lanche.png",
      title: "Paga Lanche",
      description: "Sempre paga sua parte e mais um pouco. Amigo de confianca!",
      rarity: "Lendario",
      rarityColor: "text-primary",
    };
  }

  // Equal paid and received
  return {
    image: "/images/nfts/pao duro.png",
    title: "Pao Duro",
    description: "Paga so o minimo necessario. Nao espere gorjeta!",
    rarity: "Raro",
    rarityColor: "text-warning",
  };
}

export function ReputationCard({ address }: { address: `0x${string}` }) {
  const { data, isLoading } = useReputation(address);

  const [paid, received] = (data as [bigint, bigint] | undefined) ?? [0n, 0n];
  const total = paid + received;
  const nft = getReputationNft(paid, received);

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Reputacao</h3>

      {isLoading ? (
        <p className="text-text-muted text-sm">Carregando reputacao...</p>
      ) : (
        <>
          {/* NFT Badge */}
          <div className="flex items-center gap-4 bg-bg rounded-card p-4">
            <div className="w-20 h-20 rounded-card overflow-hidden border-2 border-border shrink-0">
              <img
                src={nft.image}
                alt={nft.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-text-primary">{nft.title}</h4>
                <span className={`text-xs font-semibold ${nft.rarityColor}`}>
                  {nft.rarity}
                </span>
              </div>
              <p className="text-xs text-text-secondary">{nft.description}</p>
              <p className="text-xs text-text-muted">NFT de Reputacao On-Chain</p>
            </div>
          </div>

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
        </>
      )}
    </div>
  );
}
