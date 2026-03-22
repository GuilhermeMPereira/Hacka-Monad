"use client";

import { useState, useEffect, useCallback } from "react";

export interface TransactionRecord {
  id: string;
  type:
    | "faucet"
    | "create_meetup"
    | "confirm_meetup"
    | "register_bill"
    | "settle_bill"
    | "cancel_meetup"
    | "approve"
    | "stake";
  hash: string;
  timestamp: number;
  details: string;
  amount?: string;
  status: "pending" | "confirmed" | "failed";
}

const STORAGE_KEY = "meritcoin-tx-history";
const MAX_TRANSACTIONS = 50;

function loadTransactions(): TransactionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TransactionRecord[];
  } catch {
    return [];
  }
}

function saveTransactions(txs: TransactionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
}

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  const addTransaction = useCallback((tx: TransactionRecord) => {
    setTransactions((prev) => {
      // Avoid duplicate by hash
      if (prev.some((t) => t.hash === tx.hash)) return prev;
      const updated = [tx, ...prev].slice(0, MAX_TRANSACTIONS);
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const updateTransaction = useCallback(
    (id: string, updates: Partial<Pick<TransactionRecord, "status">>) => {
      setTransactions((prev) => {
        const updated = prev.map((tx) =>
          tx.id === id ? { ...tx, ...updates } : tx
        );
        saveTransactions(updated);
        return updated;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setTransactions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { transactions, addTransaction, updateTransaction, clearHistory };
}
