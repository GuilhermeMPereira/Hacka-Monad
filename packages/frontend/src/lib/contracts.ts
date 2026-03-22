export const SIMPLE_STORAGE_ADDRESS = (process.env.NEXT_PUBLIC_SIMPLE_STORAGE_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const SIMPLE_STORAGE_ABI = [
  {
    type: "function",
    name: "setValue",
    inputs: [{ name: "newValue", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getValue",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getState",
    inputs: [],
    outputs: [
      { name: "value", type: "uint256", internalType: "uint256" },
      { name: "setter", type: "address", internalType: "address" },
      { name: "count", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "lastSetter",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ValueChanged",
    inputs: [
      { name: "setter", type: "address", indexed: true, internalType: "address" },
      { name: "oldValue", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "newValue", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" },
    ],
  },
] as const;

// ── MeritCoin ──────────────────────────────

export const MERITCOIN_ADDRESS = (process.env.NEXT_PUBLIC_MERITCOIN_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const MERITCOIN_ABI = [
  {
    type: "function",
    name: "faucet",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestMore",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "hasClaimedFaucet",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReputation",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [
      { name: "paid", type: "uint256", internalType: "uint256" },
      { name: "received", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
] as const;

// ── MeetupManager ──────────────────────────

export const MEETUP_MANAGER_ADDRESS = (process.env.NEXT_PUBLIC_MEETUP_MANAGER_ADDRESS ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const MEETUP_MANAGER_ABI = [
  {
    type: "function",
    name: "createMeetup",
    inputs: [
      { name: "invitees", type: "address[]", internalType: "address[]" },
      { name: "restaurantId", type: "string", internalType: "string" },
      { name: "stakeAmount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "confirmMeetup",
    inputs: [{ name: "meetupId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerBill",
    inputs: [
      { name: "meetupId", type: "uint256", internalType: "uint256" },
      { name: "totalAmount", type: "uint256", internalType: "uint256" },
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "acceptBill",
    inputs: [{ name: "meetupId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "disputeBill",
    inputs: [{ name: "meetupId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "settleBill",
    inputs: [{ name: "meetupId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelMeetup",
    inputs: [{ name: "meetupId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getMeetup",
    inputs: [{ name: "meetupId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "creator", type: "address", internalType: "address" },
      { name: "invitees", type: "address[]", internalType: "address[]" },
      { name: "restaurantId", type: "string", internalType: "string" },
      { name: "status", type: "uint8", internalType: "enum MeetupManager.MeetupStatus" },
      { name: "billAmount", type: "uint256", internalType: "uint256" },
      { name: "billPayer", type: "address", internalType: "address" },
      { name: "createdAt", type: "uint256", internalType: "uint256" },
      { name: "stakeAmount", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getStakeStatus",
    inputs: [
      { name: "meetupId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getConfirmationStatus",
    inputs: [
      { name: "meetupId", type: "uint256", internalType: "uint256" },
      { name: "invitee", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserMeetups",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "meetupCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getIndividualAmount",
    inputs: [
      { name: "meetupId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasAccepted",
    inputs: [
      { name: "meetupId", type: "uint256", internalType: "uint256" },
      { name: "participant", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAcceptedCount",
    inputs: [{ name: "meetupId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;
