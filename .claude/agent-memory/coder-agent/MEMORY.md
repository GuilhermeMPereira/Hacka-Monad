# Coder Agent Memory - Hacka-Monad

## Project Structure
- Monorepo at `D:/Users/ANTUNES/Desktop/Hacka-Monad/`
- Packages: `packages/backend`, `packages/contracts`, `packages/frontend`

## Contracts Package (`packages/contracts/`)
- Stack: Hardhat 2.22+, Solidity 0.8.27, TypeScript 5.7+
- Tooling: @nomicfoundation/hardhat-toolbox 5.x, Hardhat Ignition for deployments
- Network: Monad Testnet (chainId 10143, RPC: https://testnet-rpc.monad.xyz)
- EVM version: paris
- Optimizer: enabled, 200 runs
- Test framework: Chai + Hardhat network helpers (loadFixture pattern)
- ABI export script outputs to `packages/frontend/src/lib/abi/`
- Contracts: SimpleStorage, MeritCoin (ERC-20), MeetupManager
- MeritCoin: ERC-20 ("MeritCoin", "MERIT"), faucet(100 tokens), reputation tracking via recordSettlement
- MeetupManager: lifecycle Pending->Confirmed->BillRegistered->Settled/Cancelled, uses IERC20.transferFrom
- MeetupManager must be set on MeritCoin via setMeetupManager() after deploy
- Deploy script deploys all 3 contracts sequentially
- Ignition module: `ignition/modules/Deploy.ts` (MeritCoin + MeetupManager)
- OpenZeppelin @openzeppelin/contracts installed as dependency
- Test file naming: PascalCase.test.ts (42 tests total, all passing)

## Backend Package (`packages/backend/`)
- Stack: Fastify 5.x + TypeScript 5.7+ + viem 2.x
- Runtime: Node.js with tsx for dev, tsc for build
- Architecture: Plugin-based Fastify with route modules
- Config via dotenv in `src/config/index.ts`
- Chain definition in `src/config/monad.ts` using viem's `defineChain`
- Viem public client singleton in `src/plugins/viem.ts`
- Routes as Fastify plugin functions registered with prefixes in `src/app.ts`
- Entry point: `src/index.ts` calling `buildApp()` from `src/app.ts`
- Port: 3001 (default), CORS: localhost:3000 and localhost:3001
- API routes: `/api/health`, `/api/contract/state`, `/api/transactions/:hash`, `/api/transactions/balance/:address`
