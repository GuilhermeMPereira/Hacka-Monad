import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  monadRpcUrl: process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz",
  simpleStorageAddress: process.env.SIMPLE_STORAGE_ADDRESS as `0x${string}` | undefined,
};
