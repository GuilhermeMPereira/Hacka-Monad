import { createPublicClient, http } from "viem";
import { monadTestnet } from "../config/monad";
import { config } from "../config";

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(config.monadRpcUrl),
});
