import type { FastifyInstance } from "fastify";
import { publicClient } from "../plugins/viem";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    const blockNumber = await publicClient.getBlockNumber();
    return {
      status: "ok",
      chain: "monad-testnet",
      blockNumber: blockNumber.toString(),
      timestamp: new Date().toISOString(),
    };
  });
}
