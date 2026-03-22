import type { FastifyInstance } from "fastify";
import { isAddress, formatEther } from "viem";
import { publicClient } from "../plugins/viem";
import { config } from "../config";
import { MEETUP_MANAGER_ABI } from "../lib/abis";

const MEETUP_STATUS_MAP: Record<number, string> = {
  0: "Pending",
  1: "Confirmed",
  2: "BillRegistered",
  3: "Settled",
  4: "Cancelled",
};

function formatMeetup(meetup: {
  id: bigint;
  creator: string;
  invitee: string;
  restaurantId: string;
  status: number;
  billAmount: bigint;
  billPayer: string;
  createdAt: bigint;
}) {
  return {
    id: meetup.id.toString(),
    creator: meetup.creator,
    invitee: meetup.invitee,
    restaurantId: meetup.restaurantId,
    status: MEETUP_STATUS_MAP[meetup.status] ?? "Unknown",
    billAmount: formatEther(meetup.billAmount),
    billPayer: meetup.billPayer,
    createdAt: meetup.createdAt.toString(),
  };
}

export async function meetupRoutes(app: FastifyInstance) {
  app.get("/count", async (_request, reply) => {
    if (!config.meetupManagerAddress) {
      return reply.status(503).send({ error: "Contract not deployed. Set MEETUP_MANAGER_ADDRESS." });
    }

    try {
      const count = await publicClient.readContract({
        address: config.meetupManagerAddress,
        abi: MEETUP_MANAGER_ABI,
        functionName: "meetupCount",
      });

      return { count: count.toString() };
    } catch {
      return reply.status(502).send({ error: "RPC request failed" });
    }
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    if (!config.meetupManagerAddress) {
      return reply.status(503).send({ error: "Contract not deployed. Set MEETUP_MANAGER_ADDRESS." });
    }

    const { id } = request.params;
    const meetupId = BigInt(id);

    try {
      const meetup = await publicClient.readContract({
        address: config.meetupManagerAddress,
        abi: MEETUP_MANAGER_ABI,
        functionName: "getMeetup",
        args: [meetupId],
      });

      return formatMeetup(meetup);
    } catch {
      return reply.status(502).send({ error: "RPC request failed" });
    }
  });

  app.get<{ Params: { address: string } }>("/user/:address", async (request, reply) => {
    if (!config.meetupManagerAddress) {
      return reply.status(503).send({ error: "Contract not deployed. Set MEETUP_MANAGER_ADDRESS." });
    }

    const { address } = request.params;
    if (!isAddress(address)) {
      return reply.status(400).send({ error: "Invalid address" });
    }

    try {
      const meetupIds = await publicClient.readContract({
        address: config.meetupManagerAddress,
        abi: MEETUP_MANAGER_ABI,
        functionName: "getUserMeetups",
        args: [address as `0x${string}`],
      });

      const meetups = await Promise.all(
        meetupIds.map((id) =>
          publicClient.readContract({
            address: config.meetupManagerAddress!,
            abi: MEETUP_MANAGER_ABI,
            functionName: "getMeetup",
            args: [id],
          })
        )
      );

      return meetups.map(formatMeetup);
    } catch {
      return reply.status(502).send({ error: "RPC request failed" });
    }
  });
}
