const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  rating: number;
  acceptsCrypto: boolean;
  address: string;
  description?: string;
}

export interface MeetupData {
  id: number;
  creator: string;
  invitee: string;
  restaurantId: string;
  status: number;
  billAmount: string;
  billPayer: string;
  createdAt: number;
  restaurant?: Restaurant;
}

export interface ProfileData {
  address: string;
  meritBalance: string;
  reputation: { paid: number; received: number };
  meetupCount: number;
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const res = await fetch(`${API_URL}/restaurants`);
  if (!res.ok) throw new Error("Falha ao carregar restaurantes");
  return res.json();
}

export async function fetchRestaurant(id: string): Promise<Restaurant> {
  const res = await fetch(`${API_URL}/restaurants/${id}`);
  if (!res.ok) throw new Error("Restaurante nao encontrado");
  return res.json();
}

export async function fetchUserMeetups(address: string): Promise<MeetupData[]> {
  const res = await fetch(`${API_URL}/meetups?user=${address}`);
  if (!res.ok) throw new Error("Falha ao carregar meetups");
  return res.json();
}

export async function fetchMeetup(id: number): Promise<MeetupData> {
  const res = await fetch(`${API_URL}/meetups/${id}`);
  if (!res.ok) throw new Error("Meetup nao encontrado");
  return res.json();
}

export async function fetchProfile(address: string): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/profile/${address}`);
  if (!res.ok) throw new Error("Perfil nao encontrado");
  return res.json();
}
