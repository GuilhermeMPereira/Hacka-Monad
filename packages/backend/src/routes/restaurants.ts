import type { FastifyInstance } from "fastify";
import { restaurants } from "../data/restaurants";

export async function restaurantRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { cuisine?: string; priceRange?: string } }>("/", async (request) => {
    const { cuisine, priceRange } = request.query;

    let filtered = restaurants;

    if (cuisine) {
      filtered = filtered.filter(
        (r) => r.cuisine.toLowerCase() === cuisine.toLowerCase()
      );
    }

    if (priceRange) {
      const range = parseInt(priceRange, 10);
      if (!isNaN(range)) {
        filtered = filtered.filter((r) => r.priceRange === range);
      }
    }

    return filtered;
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const { id } = request.params;
    const restaurant = restaurants.find((r) => r.id === id);

    if (!restaurant) {
      return reply.status(404).send({ error: "Restaurant not found" });
    }

    return restaurant;
  });
}
