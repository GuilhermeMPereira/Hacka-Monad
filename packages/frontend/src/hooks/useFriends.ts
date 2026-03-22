"use client";

import { useState, useEffect, useCallback } from "react";

export interface Friend {
  address: string;
  name: string;
}

const STORAGE_KEY = "meritcoin-friends";

function loadFriends(): Friend[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Friend[];
  } catch {
    return [];
  }
}

function saveFriends(friends: Friend[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(friends));
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    setFriends(loadFriends());
  }, []);

  const addFriend = useCallback((address: string, name: string) => {
    setFriends((prev) => {
      const exists = prev.some(
        (f) => f.address.toLowerCase() === address.toLowerCase()
      );
      if (exists) return prev;
      const updated = [...prev, { address, name }];
      saveFriends(updated);
      return updated;
    });
  }, []);

  const removeFriend = useCallback((address: string) => {
    setFriends((prev) => {
      const updated = prev.filter(
        (f) => f.address.toLowerCase() !== address.toLowerCase()
      );
      saveFriends(updated);
      return updated;
    });
  }, []);

  return { friends, addFriend, removeFriend };
}
