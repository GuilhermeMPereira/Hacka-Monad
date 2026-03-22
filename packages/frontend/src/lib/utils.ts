import { formatEther } from "viem";

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatMON(wei: bigint): string {
  return parseFloat(formatEther(wei)).toFixed(4);
}
