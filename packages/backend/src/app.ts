import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health";
import { contractRoutes } from "./routes/contract";
import { transactionRoutes } from "./routes/transactions";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: ["http://localhost:3000", "http://localhost:3001"],
  });

  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(contractRoutes, { prefix: "/api/contract" });
  await app.register(transactionRoutes, { prefix: "/api/transactions" });

  return app;
}
