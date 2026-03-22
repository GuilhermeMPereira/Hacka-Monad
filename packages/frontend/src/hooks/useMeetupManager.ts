import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MEETUP_MANAGER_ABI, MEETUP_MANAGER_ADDRESS } from "@/lib/contracts";
import { monadTestnet } from "@/config/monad";

export function useCreateMeetup() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function createMeetup(invitees: `0x${string}`[], restaurantId: string, stakeAmount: bigint) {
    writeContract({
      address: MEETUP_MANAGER_ADDRESS,
      abi: MEETUP_MANAGER_ABI,
      functionName: "createMeetup",
      args: [invitees, restaurantId, stakeAmount],
    });
  }

  return { createMeetup, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useConfirmMeetup() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function confirmMeetup(meetupId: bigint) {
    writeContract({
      address: MEETUP_MANAGER_ADDRESS,
      abi: MEETUP_MANAGER_ABI,
      functionName: "confirmMeetup",
      args: [meetupId],
    });
  }

  return { confirmMeetup, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useRegisterBill() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function registerBill(meetupId: bigint, amount: bigint) {
    writeContract({
      address: MEETUP_MANAGER_ADDRESS,
      abi: MEETUP_MANAGER_ABI,
      functionName: "registerBill",
      args: [meetupId, amount],
    });
  }

  return { registerBill, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useSettleBill() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function settleBill(meetupId: bigint) {
    writeContract({
      address: MEETUP_MANAGER_ADDRESS,
      abi: MEETUP_MANAGER_ABI,
      functionName: "settleBill",
      args: [meetupId],
    });
  }

  return { settleBill, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useCancelMeetup() {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  function cancelMeetup(meetupId: bigint) {
    writeContract({
      address: MEETUP_MANAGER_ADDRESS,
      abi: MEETUP_MANAGER_ABI,
      functionName: "cancelMeetup",
      args: [meetupId],
    });
  }

  return { cancelMeetup, hash, isPending, isConfirming, isSuccess, error, reset };
}

export function useMeetupCount() {
  return useReadContract({
    address: MEETUP_MANAGER_ADDRESS,
    abi: MEETUP_MANAGER_ABI,
    functionName: "meetupCount",
    chainId: monadTestnet.id,
  });
}

export function useGetMeetup(meetupId: bigint | undefined) {
  return useReadContract({
    address: MEETUP_MANAGER_ADDRESS,
    abi: MEETUP_MANAGER_ABI,
    functionName: "getMeetup",
    args: meetupId !== undefined ? [meetupId] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: meetupId !== undefined },
  });
}

export function useGetUserMeetups(address: `0x${string}` | undefined) {
  return useReadContract({
    address: MEETUP_MANAGER_ADDRESS,
    abi: MEETUP_MANAGER_ABI,
    functionName: "getUserMeetups",
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: { enabled: !!address },
  });
}

export function useGetConfirmationStatus(
  meetupId: bigint | undefined,
  inviteeAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: MEETUP_MANAGER_ADDRESS,
    abi: MEETUP_MANAGER_ABI,
    functionName: "getConfirmationStatus",
    args:
      meetupId !== undefined && inviteeAddress
        ? [meetupId, inviteeAddress]
        : undefined,
    chainId: monadTestnet.id,
    query: { enabled: meetupId !== undefined && !!inviteeAddress },
  });
}

export function useGetStakeStatus(
  meetupId: bigint | undefined,
  participant: string | undefined
) {
  return useReadContract({
    address: MEETUP_MANAGER_ADDRESS,
    abi: MEETUP_MANAGER_ABI,
    functionName: "getStakeStatus",
    args:
      meetupId !== undefined && participant
        ? [meetupId, participant as `0x${string}`]
        : undefined,
    chainId: monadTestnet.id,
    query: { enabled: meetupId !== undefined && !!participant },
  });
}
