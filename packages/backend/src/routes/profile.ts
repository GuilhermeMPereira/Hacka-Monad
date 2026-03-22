import type { FastifyInstance } from "fastify";
import { isAddress, formatEther } from "viem";
import { publicClient } from "../plugins/viem";
import { config } from "../config";
import { MERITCOIN_ABI, MEETUP_MANAGER_ABI } from "../lib/abis";

export async function profileRoutes(app: FastifyInstance) {
  app.get<{ Params: { address: string } }>("/:address", async (request, reply) => {
    const { address } = request.params;
    if (!isAddress(address)) {
      return reply.status(400).send({ error: "Invalid address" });
    }

    if (!config.meritCoinAddress || !config.meetupManagerAddress) {
      return reply.status(503).send({ error: "Contracts not deployed. Set MERITCOIN_ADDRESS and MEETUP_MANAGER_ADDRESS." });
    }

    try {
      const [balance, reputation, hasClaimed, meetupIds] = await Promise.all([
        publicClient.readContract({
          address: config.meritCoinAddress,
          abi: MERITCOIN_ABI,
          functionName: "balanceOf",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: config.meritCoinAddress,
          abi: MERITCOIN_ABI,
          functionName: "getReputation",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: config.meritCoinAddress,
          abi: MERITCOIN_ABI,
          functionName: "hasClaimedFaucet",
          args: [address as `0x${string}`],
        }),
        publicClient.readContract({
          address: config.meetupManagerAddress,
          abi: MEETUP_MANAGER_ABI,
          functionName: "getUserMeetups",
          args: [address as `0x${string}`],
        }),
      ]);

      return {
        address,
        balance: formatEther(balance),
        reputation: {
          paymentsMade: reputation[0].toString(),
          paymentsReceived: reputation[1].toString(),
        },
        hasClaimed,
        meetupCount: meetupIds.length,
        meetupIds: meetupIds.map((id) => id.toString()),
      };
    } catch {
      return reply.status(502).send({ error: "RPC request failed" });
    }
  });
}
