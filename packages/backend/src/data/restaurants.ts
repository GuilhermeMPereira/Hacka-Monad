export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  rating: number;
  address: string;
  city: string;
  acceptsCrypto: boolean;
  imageUrl: string;
  description: string;
}

export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Boteco do Monad",
    cuisine: "Brasileira",
    priceRange: 1,
    rating: 4,
    address: "Rua Augusta, 1200",
    city: "Sao Paulo",
    acceptsCrypto: true,
    imageUrl: "https://placehold.co/400x300?text=Boteco+do+Monad",
    description: "Boteco tradicional com petiscos e chopp gelado. Aceita pagamentos em MeritCoin.",
  },
  {
    id: "2",
    name: "Sushi Nakamoto",
    cuisine: "Japonesa",
    priceRange: 3,
    rating: 5,
    address: "Rua Liberdade, 350",
    city: "Sao Paulo",
    acceptsCrypto: true,
    imageUrl: "https://placehold.co/400x300?text=Sushi+Nakamoto",
    description: "Sushi premium com ingredientes importados. Experiencia omakase unica.",
  },
  {
    id: "3",
    name: "Churrascaria Bloco Genesis",
    cuisine: "Churrasco",
    priceRange: 2,
    rating: 4,
    address: "Av. Atlantica, 900",
    city: "Rio de Janeiro",
    acceptsCrypto: true,
    imageUrl: "https://placehold.co/400x300?text=Churrascaria+Genesis",
    description: "Rodizio completo com carnes nobres e buffet de saladas.",
  },
  {
    id: "4",
    name: "Pizzaria Consensus",
    cuisine: "Italiana",
    priceRange: 2,
    rating: 5,
    address: "Rua Braz Leme, 450",
    city: "Sao Paulo",
    acceptsCrypto: true,
    imageUrl: "https://placehold.co/400x300?text=Pizzaria+Consensus",
    description: "Pizzas artesanais assadas em forno a lenha. Massa de fermentacao natural.",
  },
  {
    id: "5",
    name: "Cafe Validator",
    cuisine: "Cafeteria",
    priceRange: 1,
    rating: 4,
    address: "Rua Oscar Freire, 200",
    city: "Sao Paulo",
    acceptsCrypto: true,
    imageUrl: "https://placehold.co/400x300?text=Cafe+Validator",
    description: "Cafes especiais e brunchs elaborados em ambiente aconchegante.",
  },
  {
    id: "6",
    name: "Taqueria Finality",
    cuisine: "Mexicana",
    priceRange: 1,
    rating: 3,
    address: "Rua da Consolacao, 1800",
    city: "Sao Paulo",
    acceptsCrypto: true,
    imageUrl: "https://placehold.co/400x300?text=Taqueria+Finality",
    description: "Tacos, burritos e nachos autenticos com toque brasileiro.",
  },
  {
    id: "7",
    name: "Bistrô Hash",
    cuisine: "Francesa",
    priceRange: 3,
    rating: 5,
    address: "Rua Garcia d'Avila, 150",
    city: "Rio de Janeiro",
    acceptsCrypto: true,
    imageUrl: "https://placehold.co/400x300?text=Bistro+Hash",
    description: "Culinaria francesa contemporanea com ingredientes locais selecionados.",
  },
];
