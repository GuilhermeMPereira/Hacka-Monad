import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health";
import { contractRoutes } from "./routes/contract";
import { transactionRoutes } from "./routes/transactions";
import { restaurantRoutes } from "./routes/restaurants";
import { meetupRoutes } from "./routes/meetups";
import { profileRoutes } from "./routes/profile";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
  });

  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(contractRoutes, { prefix: "/api/contract" });
  await app.register(transactionRoutes, { prefix: "/api/transactions" });
  await app.register(restaurantRoutes, { prefix: "/api/restaurants" });
  await app.register(meetupRoutes, { prefix: "/api/meetups" });
  await app.register(profileRoutes, { prefix: "/api/profile" });

  return app;
}
