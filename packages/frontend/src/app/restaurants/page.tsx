"use client";

import { useEffect, useState } from "react";
import { fetchRestaurants, type Restaurant } from "@/lib/api";
import { RestaurantCard } from "@/components/RestaurantCard";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cuisines = Array.from(
    new Set(restaurants.map((r) => r.cuisine))
  ).sort();

  const filtered =
    cuisineFilter === "all"
      ? restaurants
      : restaurants.filter((r) => r.cuisine === cuisineFilter);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Restaurantes</h1>
        <p className="text-text-secondary">
          Descubra restaurantes que aceitam crypto para seus meetups
        </p>
      </div>

      {/* Filter */}
      {cuisines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCuisineFilter("all")}
            className={`px-3 py-1.5 rounded-btn text-sm font-medium transition-colors ${
              cuisineFilter === "all"
                ? "bg-primary text-bg"
                : "bg-bg-surface text-text-secondary border border-border hover:border-border-light"
            }`}
          >
            Todos
          </button>
          {cuisines.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setCuisineFilter(cuisine)}
              className={`px-3 py-1.5 rounded-btn text-sm font-medium transition-colors ${
                cuisineFilter === cuisine
                  ? "bg-primary text-bg"
                  : "bg-bg-surface text-text-secondary border border-border hover:border-border-light"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading && (
        <div className="card p-8 text-center">
          <p className="text-text-muted">Carregando restaurantes...</p>
        </div>
      )}

      {error && (
        <div className="card p-8 text-center">
          <p className="text-error">Erro: {error.slice(0, 100)}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-muted">Nenhum restaurante encontrado.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
