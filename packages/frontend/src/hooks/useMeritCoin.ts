import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MERITCOIN_ABI, MERITCOIN_ADDRESS } from "@/lib/contracts";
import { monadTestnet } from "@/config/monad";

export function useClaimFaucet() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function claim() {
    writeContract({
      address: MERITCOIN_ADDRESS,
      abi: MERITCOIN_ABI,
      functionName: "faucet",
    });
  }

  return { claim, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useHasClaimed(address: `0x${string}` | undefined) {
  return useReadContract({
    address: MERITCOIN_ADDRESS,
    abi: MERITCOIN_ABI,
    functionName: "hasClaimedFaucet",
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!address, staleTime: 30_000 },
  });
}

export function useMeritBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: MERITCOIN_ADDRESS,
    abi: MERITCOIN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!address, staleTime: 10_000 },
  });
}

export function useReputation(address: `0x${string}` | undefined) {
  return useReadContract({
    address: MERITCOIN_ADDRESS,
    abi: MERITCOIN_ABI,
    functionName: "getReputation",
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!address, staleTime: 30_000 },
  });
}

export function useRequestMore() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function requestMore() {
    writeContract({
      address: MERITCOIN_ADDRESS,
      abi: MERITCOIN_ABI,
      functionName: "requestMore",
    });
  }

  return { requestMore, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useApproveMerit() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function approve(spender: `0x${string}`, amount: bigint) {
    writeContract({
      address: MERITCOIN_ADDRESS,
      abi: MERITCOIN_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  }

  return { approve, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useAllowance(
  owner: `0x${string}` | undefined,
  spender: `0x${string}` | undefined
) {
  return useReadContract({
    address: MERITCOIN_ADDRESS,
    abi: MERITCOIN_ABI,
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!owner && !!spender, staleTime: 10_000 },
  });
}
