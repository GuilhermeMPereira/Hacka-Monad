import type { FastifyInstance } from "fastify";
import { publicClient } from "../plugins/viem";
import { formatEther, isAddress } from "viem";

export async function transactionRoutes(app: FastifyInstance) {
  app.get<{ Params: { hash: string } }>("/:hash", async (request, reply) => {
    const { hash } = request.params;
    if (!hash.startsWith("0x") || hash.length !== 66) {
      return reply.status(400).send({ error: "Invalid transaction hash" });
    }
    try {
      const tx = await publicClient.getTransaction({
        hash: hash as `0x${string}`,
      });
      const receipt = await publicClient.getTransactionReceipt({
        hash: hash as `0x${string}`,
      });

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: formatEther(tx.value),
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch {
      return reply.status(404).send({ error: "Transaction not found" });
    }
  });

  app.get<{ Params: { address: string } }>("/balance/:address", async (request, reply) => {
    const { address } = request.params;
    if (!isAddress(address)) {
      return reply.status(400).send({ error: "Invalid address" });
    }
    try {
      const balance = await publicClient.getBalance({
        address: address as `0x${string}`,
      });

      return {
        address,
        balance: formatEther(balance),
        symbol: "MON",
      };
    } catch {
      return reply.status(502).send({ error: "RPC request failed" });
    }
  });
}
