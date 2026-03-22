import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "./monad";

export const config = getDefaultConfig({
  appName: "Empresta Ai",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder_get_id_from_cloud_walletconnect_com",
  chains: [monadTestnet],
  ssr: true,
});
