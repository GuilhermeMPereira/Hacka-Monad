"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { config } from "@/config/wagmi";
import { useState, type ReactNode } from "react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";

import "@rainbow-me/rainbowkit/styles.css";

function InnerProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { theme } = useTheme();

  const rainbowTheme =
    theme === "dark"
      ? darkTheme({
          accentColor: "#836EF9",
          borderRadius: "medium",
        })
      : lightTheme({
          accentColor: "#5A4BD1",
          borderRadius: "medium",
        });

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <InnerProviders>{children}</InnerProviders>
    </ThemeProvider>
  );
}
