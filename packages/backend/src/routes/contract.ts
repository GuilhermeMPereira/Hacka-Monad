import type { FastifyInstance } from "fastify";
import { publicClient } from "../plugins/viem";
import { config } from "../config";

const SIMPLE_STORAGE_ABI = [
  {
    type: "function",
    name: "getState",
    inputs: [],
    outputs: [
      { name: "value", type: "uint256" },
      { name: "setter", type: "address" },
      { name: "count", type: "uint256" },
    ],
    stateMutability: "view",
  },
] as const;

export async function contractRoutes(app: FastifyInstance) {
  app.get("/state", async (_request, reply) => {
    if (!config.simpleStorageAddress) {
      return reply.status(503).send({ error: "Contract not deployed. Set SIMPLE_STORAGE_ADDRESS." });
    }

    try {
      const [value, setter, count] = await publicClient.readContract({
        address: config.simpleStorageAddress,
        abi: SIMPLE_STORAGE_ABI,
        functionName: "getState",
      });

      return {
        value: value.toString(),
        lastSetter: setter,
        setCount: count.toString(),
      };
    } catch {
      return reply.status(502).send({ error: "Failed to read contract state" });
    }
  });
}
