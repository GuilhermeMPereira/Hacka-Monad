# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MeritCoin — a crypto meetup & bill-splitting dApp built on Monad Testnet (chain ID 10143). Monorepo with three packages: smart contracts, Next.js frontend, and Fastify backend.

## Commands

### Contracts (`packages/contracts/`)
```bash
npx hardhat compile          # Compile Solidity contracts
npx hardhat test             # Run all contract tests (42 tests)
npx hardhat test test/MeritCoin.test.ts  # Run single test file
npx hardhat run scripts/deploy.ts --network monadTestnet  # Deploy to Monad
npx ts-node scripts/export-abi.ts  # Export ABIs to frontend
```

### Frontend (`packages/frontend/`)
```bash
npm run dev     # Dev server on :3000
npm run build   # Production build
npm run lint    # ESLint
```

### Backend (`packages/backend/`)
```bash
npm run dev     # Dev server on :3001 (tsx watch)
npm run build   # TypeScript compile
npx tsc --noEmit  # Type-check without emitting
```

## Architecture

### Smart Contracts (Solidity 0.8.27, evmVersion paris)
- **MeritCoin.sol** — ERC-20 (OpenZeppelin) with `faucet()` (100 MERIT per wallet), `recordSettlement()` (restricted to MeetupManager), and `getReputation()` tracking
- **MeetupManager.sol** — Meetup lifecycle state machine: Pending → Confirmed → BillRegistered → Settled/Cancelled. `settleBill()` calls `IERC20.transferFrom(debtor, billPayer, splitAmount)` then `meritCoin.recordSettlement()`
- **Deploy order matters**: MeritCoin first, then MeetupManager(meritCoinAddress), then `meritCoin.setMeetupManager(meetupManagerAddress)`

### Frontend (Next.js 15 App Router + wagmi 2 + RainbowKit 2 + viem 2)
- **Contract interaction pattern**: `useWriteContract` + `useWaitForTransactionReceipt({ hash })` for writes; `useReadContract` with `chainId: monadTestnet.id` for reads
- **Custom hooks**: `src/hooks/useMeritCoin.ts` and `src/hooks/useMeetupManager.ts` wrap all contract calls
- **ABIs and addresses**: Inline in `src/lib/contracts.ts` with addresses from `NEXT_PUBLIC_*` env vars
- **API helper**: `src/lib/api.ts` fetches from backend with embedded mock restaurant fallback
- **Chain definition**: `src/config/monad.ts` defines monadTestnet chain for viem/wagmi

### Backend (Fastify 5 + viem 2)
- **Route pattern**: Async Fastify plugins registered with `app.register(routes, { prefix: "/api/..." })`
- **Contract reads**: Uses shared `publicClient` singleton from `src/plugins/viem.ts`
- **Error pattern**: 400 (invalid input), 404 (not found), 502 (RPC failure), 503 (contract not configured)
- **Config**: `src/config/index.ts` reads env vars, contract addresses typed as `` `0x${string}` | undefined ``

## Design System

CSS utility classes defined in `globals.css`: `.card`, `.btn-primary`, `.btn-secondary`, `.badge-merit`, `.gradient-merit`. Tailwind colors use semantic names: `bg-bg`, `bg-bg-surface`, `bg-bg-elevated`, `text-text-primary`, `text-text-secondary`, `text-primary` (gold), `text-secondary` (violet), `text-success`, `text-error`, `text-warning`, `border-border`. **Do not use** `bg-monad-*` or `text-monad-*` classes.

## Key Conventions

- All interactive frontend components require `"use client"` directive
- `useSearchParams()` must be wrapped in a `<Suspense>` boundary
- Contract tests use `loadFixture`, chai `expect`, `hre.ethers.getSigners()`
- Monad explorer links: `https://testnet.monad.xyz/tx/{hash}`
- The settle flow requires 2 user transactions: approve MeritCoin → then settleBill on MeetupManager
- UI text is in Portuguese (Brazil)

## Environment Variables

Each package has its own `.env` (see `.env.example` files). Key vars:
- **Contracts**: `DEPLOYER_PRIVATE_KEY`, `MONAD_RPC_URL`
- **Frontend**: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_MERITCOIN_ADDRESS`, `NEXT_PUBLIC_MEETUP_MANAGER_ADDRESS`, `NEXT_PUBLIC_API_URL`
- **Backend**: `MERITCOIN_ADDRESS`, `MEETUP_MANAGER_ADDRESS`, `MONAD_RPC_URL`, `PORT`
