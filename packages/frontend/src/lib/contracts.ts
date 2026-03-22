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
