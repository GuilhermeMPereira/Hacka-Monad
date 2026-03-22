"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useFriends } from "@/hooks/useFriends";
import { shortenAddress } from "@/lib/utils";

interface FriendsListProps {
  onSelect?: (address: string) => void;
  selectable?: boolean;
}

export function FriendsList({ onSelect, selectable = false }: FriendsListProps) {
  const { friends, addFriend, removeFriend } = useFriends();
  const [newAddress, setNewAddress] = useState("");
  const [newName, setNewName] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!isAddress(newAddress) || !newName.trim()) return;
    addFriend(newAddress, newName.trim());
    setNewAddress("");
    setNewName("");
  }

  return (
    <div className="card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Amigos</h3>

      {friends.length === 0 && (
        <p className="text-text-muted text-sm">Nenhum amigo salvo.</p>
      )}

      {friends.length > 0 && (
        <div className="space-y-2">
          {friends.map((friend) => (
            <div
              key={friend.address}
              className={`flex items-center justify-between p-3 bg-bg rounded-btn border border-border ${
                selectable ? "cursor-pointer hover:border-secondary" : ""
              }`}
              onClick={() => selectable && onSelect?.(friend.address)}
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {friend.name}
                </p>
                <p className="font-mono text-xs text-text-muted">
                  {shortenAddress(friend.address)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFriend(friend.address);
                }}
                className="text-error text-xs hover:underline"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="space-y-2">
        <p className="text-sm text-text-secondary">Adicionar amigo</p>
        <input
          type="text"
          placeholder="Apelido"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full bg-bg border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
        />
        <input
          type="text"
          placeholder="0x..."
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          className="w-full bg-bg border border-border rounded-btn px-3 py-2 font-mono text-sm focus:outline-none focus:border-secondary transition-colors"
        />
        {newAddress && !isAddress(newAddress) && (
          <p className="text-error text-xs">Endereco invalido</p>
        )}
        <button
          type="submit"
          disabled={!isAddress(newAddress) || !newName.trim()}
          className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Adicionar
        </button>
      </form>
    </div>
  );
}
