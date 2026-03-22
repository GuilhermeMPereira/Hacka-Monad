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
  walletAddress: string;
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
    walletAddress: "0x7a23608a8eBe71868013BDE0d3109999Eb5B68a1",
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
    walletAddress: "0x3Bc5e4F9d2aE1c7604bD82FE0A7328e95e0bC412",
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
    walletAddress: "0xdA4b8E2f5C19a37D6cE82190Fb4a71Ce8d503927",
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
    walletAddress: "0x91Fe5B7c84eD62aF10C3D7b0e84519Ac34f6B830",
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
    walletAddress: "0x56aD3e4F18Cb72d5A3e6B9170cDf42E3b8A09c15",
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
    walletAddress: "0xE83Af2b601D9c2Fe1a4D3bC5087c12eA8f647D23",
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
    walletAddress: "0x2cB7D9a4E5f31682b0E7A94F130dC8e53B7a6F09",
  },
];
