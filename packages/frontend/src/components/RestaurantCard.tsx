"use client";

import Link from "next/link";
import type { Restaurant } from "@/lib/api";

function PriceRange({ level }: { level: number }) {
  return (
    <span className="text-sm">
      {Array.from({ length: 4 }, (_, i) => (
        <span
          key={i}
          className={i < level ? "text-primary" : "text-text-muted"}
        >
          $
        </span>
      ))}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          className={i < Math.round(rating) ? "text-warning" : "text-text-muted"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs text-text-muted ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">{restaurant.name}</h3>
          <p className="text-sm text-text-secondary">{restaurant.cuisine}</p>
        </div>
        {restaurant.acceptsCrypto && (
          <span className="badge-merit text-xs">Aceita Crypto</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <PriceRange level={restaurant.priceRange} />
        <StarRating rating={restaurant.rating} />
      </div>

      {restaurant.address && (
        <p className="text-xs text-text-muted truncate">{restaurant.address}</p>
      )}

      <Link
        href={`/meetups/create?restaurant=${restaurant.id}`}
        className="btn-primary block text-center text-sm mt-2"
      >
        Criar Meetup
      </Link>
    </div>
  );
}
