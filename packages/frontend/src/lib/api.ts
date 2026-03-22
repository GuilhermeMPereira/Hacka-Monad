const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  rating: number;
  acceptsCrypto: boolean;
  address: string;
  walletAddress: string;
  city?: string;
  imageUrl?: string;
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

// Mock restaurants embedded in frontend as fallback
const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Boteco do Monad",
    cuisine: "Brasileira",
    priceRange: 1,
    rating: 4,
    acceptsCrypto: true,
    address: "Rua Augusta, 1200",
    walletAddress: "0x1a2B3c4D5e6F7a8B9c0D1E2F3a4B5C6D7E8F9a0b",
    city: "Sao Paulo",
    imageUrl: "https://placehold.co/400x300?text=Boteco+do+Monad",
    description: "Boteco tradicional com petiscos e chopp gelado. Aceita pagamentos em MeritCoin.",
  },
  {
    id: "2",
    name: "Sushi Nakamoto",
    cuisine: "Japonesa",
    priceRange: 3,
    rating: 5,
    acceptsCrypto: true,
    address: "Rua Liberdade, 350",
    walletAddress: "0x2B3c4D5e6F7a8B9c0D1E2F3a4B5C6D7E8F9a0b1C",
    city: "Sao Paulo",
    imageUrl: "https://placehold.co/400x300?text=Sushi+Nakamoto",
    description: "Sushi premium com ingredientes importados. Experiencia omakase unica.",
  },
  {
    id: "3",
    name: "Churrascaria Bloco Genesis",
    cuisine: "Churrasco",
    priceRange: 2,
    rating: 4,
    acceptsCrypto: true,
    address: "Av. Atlantica, 900",
    walletAddress: "0x3C4d5E6f7A8b9C0d1e2F3A4b5c6D7e8F9A0B1c2D",
    city: "Rio de Janeiro",
    imageUrl: "https://placehold.co/400x300?text=Churrascaria+Genesis",
    description: "Rodizio completo com carnes nobres e buffet de saladas.",
  },
  {
    id: "4",
    name: "Pizzaria Consensus",
    cuisine: "Italiana",
    priceRange: 2,
    rating: 5,
    acceptsCrypto: true,
    address: "Rua Braz Leme, 450",
    walletAddress: "0x4D5e6F7a8B9c0D1E2f3A4B5c6d7E8f9a0B1C2d3E",
    city: "Sao Paulo",
    imageUrl: "https://placehold.co/400x300?text=Pizzaria+Consensus",
    description: "Pizzas artesanais assadas em forno a lenha. Massa de fermentacao natural.",
  },
  {
    id: "5",
    name: "Cafe Validator",
    cuisine: "Cafeteria",
    priceRange: 1,
    rating: 4,
    acceptsCrypto: true,
    address: "Rua Oscar Freire, 200",
    walletAddress: "0x5E6f7A8b9C0d1E2F3a4B5c6D7e8F9a0B1c2D3e4F",
    city: "Sao Paulo",
    imageUrl: "https://placehold.co/400x300?text=Cafe+Validator",
    description: "Cafes especiais e brunchs elaborados em ambiente aconchegante.",
  },
  {
    id: "6",
    name: "Taqueria Finality",
    cuisine: "Mexicana",
    priceRange: 1,
    rating: 3,
    acceptsCrypto: true,
    address: "Rua da Consolacao, 1800",
    walletAddress: "0x6F7a8B9c0D1e2F3A4b5C6d7E8f9A0b1C2D3e4F5a",
    city: "Sao Paulo",
    imageUrl: "https://placehold.co/400x300?text=Taqueria+Finality",
    description: "Tacos, burritos e nachos autenticos com toque brasileiro.",
  },
  {
    id: "7",
    name: "Bistro Hash",
    cuisine: "Francesa",
    priceRange: 3,
    rating: 5,
    acceptsCrypto: true,
    address: "Rua Garcia d'Avila, 150",
    walletAddress: "0x7A8b9C0d1E2f3A4B5c6D7e8F9a0B1c2D3E4f5A6b",
    city: "Rio de Janeiro",
    imageUrl: "https://placehold.co/400x300?text=Bistro+Hash",
    description: "Culinaria francesa contemporanea com ingredientes locais selecionados.",
  },
];

export async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    const res = await fetch(`${API_URL}/api/restaurants`);
    if (!res.ok) throw new Error("API error");
    return res.json();
  } catch {
    // Fallback to embedded mock data if backend is unavailable
    return MOCK_RESTAURANTS;
  }
}

export async function fetchRestaurant(id: string): Promise<Restaurant> {
  try {
    const res = await fetch(`${API_URL}/api/restaurants/${id}`);
    if (!res.ok) throw new Error("Restaurante nao encontrado");
    return res.json();
  } catch {
    const found = MOCK_RESTAURANTS.find((r) => r.id === id);
    if (!found) throw new Error("Restaurante nao encontrado");
    return found;
  }
}

export async function fetchUserMeetups(address: string): Promise<MeetupData[]> {
  const res = await fetch(`${API_URL}/api/meetups/user/${address}`);
  if (!res.ok) throw new Error("Falha ao carregar meetups");
  return res.json();
}

export async function fetchMeetup(id: number): Promise<MeetupData> {
  const res = await fetch(`${API_URL}/api/meetups/${id}`);
  if (!res.ok) throw new Error("Meetup nao encontrado");
  return res.json();
}

export async function fetchProfile(address: string): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/api/profile/${address}`);
  if (!res.ok) throw new Error("Perfil nao encontrado");
  return res.json();
}
