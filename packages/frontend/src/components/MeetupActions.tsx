"use client";

import { useState, useEffect, useRef } from "react";
import { parseEther, formatEther } from "viem";
import {
  useConfirmMeetup,
  useRegisterBill,
  useSettleBill,
  useCancelMeetup,
  useGetConfirmationStatus,
} from "@/hooks/useMeetupManager";
import { useApproveMerit, useAllowance } from "@/hooks/useMeritCoin";
import { MEETUP_MANAGER_ADDRESS } from "@/lib/contracts";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";

interface MeetupActionsProps {
  meetupId: bigint;
  status: number;
  creator: string;
  invitees: string[];
  billAmount: bigint;
  billPayer: string;
  stakeAmount: bigint;
  currentUser: string;
  onSuccess?: () => void;
}

function TxFeedback({
  hash,
  isSuccess,
  error,
  successMessage,
}: {
  hash?: `0x${string}`;
  isSuccess: boolean;
  error: Error | null;
  successMessage: string;
}) {
  return (
    <>
      {hash && (
        <div className="text-sm space-y-1">
          <a
            href={`https://testnet.monad.xyz/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline font-mono text-xs break-all"
          >
            {hash}
          </a>
        </div>
      )}
      {isSuccess && <p className="text-success text-sm">{successMessage}</p>}
      {error && (
        <p className="text-error text-sm">
          Erro: {error.message.slice(0, 100)}
        </p>
      )}
    </>
  );
}

export function MeetupActions({
  meetupId,
  status,
  creator,
  invitees,
  billAmount,
  billPayer,
  stakeAmount,
  currentUser,
  onSuccess,
}: MeetupActionsProps) {
  const [billInput, setBillInput] = useState("");

  const isCreator = currentUser.toLowerCase() === creator.toLowerCase();
  const isInvitee = invitees.some(
    (inv) => inv.toLowerCase() === currentUser.toLowerCase()
  );
  const isParticipant = isCreator || isInvitee;

  const totalParticipants = invitees.length + 1; // invitees + creator
  const splitAmount = billAmount > 0n ? billAmount / BigInt(totalParticipants) : 0n;

  // Check if the current user is NOT the bill payer (i.e. needs to pay their split)
  const isBillPayer =
    billPayer && currentUser.toLowerCase() === billPayer.toLowerCase();
  const isDebtor = isParticipant && !isBillPayer && billPayer !== "0x0000000000000000000000000000000000000000";

  // Check current user's confirmation status
  const { data: hasConfirmed } = useGetConfirmationStatus(
    meetupId,
    isInvitee ? (currentUser as `0x${string}`) : undefined
  );

  const confirm = useConfirmMeetup();
  const register = useRegisterBill();
  const settle = useSettleBill();
  const cancel = useCancelMeetup();
  const approveMerit = useApproveMerit();

  // Transaction history
  const { addTransaction, updateTransaction } = useTransactionHistory();

  // Each action needs two refs: one for hash dedup, one for txId tracking
  const confirmHashRef = useRef<string | null>(null);
  const confirmTxIdRef = useRef<string | null>(null);
  const registerHashRef = useRef<string | null>(null);
  const registerTxIdRef = useRef<string | null>(null);
  const settleHashRef = useRef<string | null>(null);
  const settleTxIdRef = useRef<string | null>(null);
  const cancelHashRef = useRef<string | null>(null);
  const cancelTxIdRef = useRef<string | null>(null);
  const approveHashRef = useRef<string | null>(null);
  const approveTxIdRef = useRef<string | null>(null);
  const stakeApproveHashRef = useRef<string | null>(null);
  const stakeApproveTxIdRef = useRef<string | null>(null);

  const meetupLabel = `#${meetupId.toString()}`;

  // Record confirm transaction
  useEffect(() => {
    if (confirm.hash && confirmHashRef.current !== confirm.hash) {
      confirmHashRef.current = confirm.hash;
      const txId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      confirmTxIdRef.current = txId;
      addTransaction({
        id: txId,
        type: "confirm_meetup",
        hash: confirm.hash,
        timestamp: Date.now(),
        details: `Confirmou meetup ${meetupLabel}`,
        status: "pending",
      });
    }
  }, [confirm.hash, addTransaction, meetupLabel]);

  useEffect(() => {
    if (confirm.isSuccess && confirmTxIdRef.current) {
      updateTransaction(confirmTxIdRef.current, { status: "confirmed" });
    }
  }, [confirm.isSuccess, updateTransaction]);

  // Record register bill transaction
  useEffect(() => {
    if (register.hash && registerHashRef.current !== register.hash) {
      registerHashRef.current = register.hash;
      const txId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      registerTxIdRef.current = txId;
      addTransaction({
        id: txId,
        type: "register_bill",
        hash: register.hash,
        timestamp: Date.now(),
        details: `Registrou conta no meetup ${meetupLabel}`,
        amount: billInput ? `${billInput} MERIT` : undefined,
        status: "pending",
      });
    }
  }, [register.hash, addTransaction, meetupLabel, billInput]);

  useEffect(() => {
    if (register.isSuccess && registerTxIdRef.current) {
      updateTransaction(registerTxIdRef.current, { status: "confirmed" });
    }
  }, [register.isSuccess, updateTransaction]);

  // Record settle bill transaction
  useEffect(() => {
    if (settle.hash && settleHashRef.current !== settle.hash) {
      settleHashRef.current = settle.hash;
      const txId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      settleTxIdRef.current = txId;
      addTransaction({
        id: txId,
        type: "settle_bill",
        hash: settle.hash,
        timestamp: Date.now(),
        details: `Liquidou conta do meetup ${meetupLabel}`,
        amount: `${formatEther(splitAmount)} MERIT`,
        status: "pending",
      });
    }
  }, [settle.hash, addTransaction, meetupLabel, splitAmount]);

  useEffect(() => {
    if (settle.isSuccess && settleTxIdRef.current) {
      updateTransaction(settleTxIdRef.current, { status: "confirmed" });
    }
  }, [settle.isSuccess, updateTransaction]);

  // Record cancel transaction
  useEffect(() => {
    if (cancel.hash && cancelHashRef.current !== cancel.hash) {
      cancelHashRef.current = cancel.hash;
      const txId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      cancelTxIdRef.current = txId;
      addTransaction({
        id: txId,
        type: "cancel_meetup",
        hash: cancel.hash,
        timestamp: Date.now(),
        details: `Cancelou meetup ${meetupLabel}`,
        status: "pending",
      });
    }
  }, [cancel.hash, addTransaction, meetupLabel]);

  useEffect(() => {
    if (cancel.isSuccess && cancelTxIdRef.current) {
      updateTransaction(cancelTxIdRef.current, { status: "confirmed" });
    }
  }, [cancel.isSuccess, updateTransaction]);

  // Record approve transaction (for settle)
  useEffect(() => {
    if (approveMerit.hash && approveHashRef.current !== approveMerit.hash) {
      approveHashRef.current = approveMerit.hash;
      const txId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      approveTxIdRef.current = txId;
      addTransaction({
        id: txId,
        type: "approve",
        hash: approveMerit.hash,
        timestamp: Date.now(),
        details: `Aprovou ${formatEther(splitAmount)} MERIT para liquidacao`,
        amount: `${formatEther(splitAmount)} MERIT`,
        status: "pending",
      });
    }
  }, [approveMerit.hash, addTransaction, splitAmount]);

  useEffect(() => {
    if (approveMerit.isSuccess && approveTxIdRef.current) {
      updateTransaction(approveTxIdRef.current, { status: "confirmed" });
    }
  }, [approveMerit.isSuccess, updateTransaction]);

  // Allowance check for settle (debtor paying split)
  const { data: currentAllowance } = useAllowance(
    isDebtor ? (currentUser as `0x${string}`) : undefined,
    MEETUP_MANAGER_ADDRESS
  );

  const hasEnoughAllowance =
    currentAllowance !== undefined && currentAllowance >= splitAmount;

  // Allowance check for stake (invitee confirming with stake)
  const needsStakeApproval = status === 0 && isInvitee && !hasConfirmed && stakeAmount > 0n;
  const { data: stakeAllowance, refetch: refetchStakeAllowance } = useAllowance(
    needsStakeApproval ? (currentUser as `0x${string}`) : undefined,
    MEETUP_MANAGER_ADDRESS
  );
  const hasEnoughStakeAllowance =
    stakeAllowance !== undefined && stakeAllowance >= stakeAmount;
  const approveStake = useApproveMerit();

  useEffect(() => {
    if (approveStake.isSuccess) {
      refetchStakeAllowance();
    }
  }, [approveStake.isSuccess, refetchStakeAllowance]);

  // Record stake approve transaction
  useEffect(() => {
    if (approveStake.hash && stakeApproveHashRef.current !== approveStake.hash) {
      stakeApproveHashRef.current = approveStake.hash;
      const txId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      stakeApproveTxIdRef.current = txId;
      addTransaction({
        id: txId,
        type: "stake",
        hash: approveStake.hash,
        timestamp: Date.now(),
        details: `Aprovou ${formatEther(stakeAmount)} MERIT para stake`,
        amount: `${formatEther(stakeAmount)} MERIT`,
        status: "pending",
      });
    }
  }, [approveStake.hash, addTransaction, stakeAmount]);

  useEffect(() => {
    if (approveStake.isSuccess && stakeApproveTxIdRef.current) {
      updateTransaction(stakeApproveTxIdRef.current, { status: "confirmed" });
    }
  }, [approveStake.isSuccess, updateTransaction]);

  // Pending + invitee who hasn't confirmed -> Confirm (with stake approval if needed)
  if (status === 0 && isInvitee && !hasConfirmed) {
    // Stake > 0 and not enough allowance -> show approve button first
    if (stakeAmount > 0n && !hasEnoughStakeAllowance) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Ao confirmar, {formatEther(stakeAmount)} MERIT serao travados como garantia
          </p>
          <button
            onClick={() => {
              approveStake.approve(MEETUP_MANAGER_ADDRESS, stakeAmount);
            }}
            disabled={approveStake.isPending || approveStake.isConfirming}
            className="btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {approveStake.isPending
              ? "Confirme na wallet..."
              : approveStake.isConfirming
              ? "Confirmando (~400ms)..."
              : `Aprovar ${formatEther(stakeAmount)} MERIT para stake`}
          </button>
          <TxFeedback
            hash={approveStake.hash}
            isSuccess={approveStake.isSuccess}
            error={approveStake.error}
            successMessage="Aprovacao concedida! Agora confirme o meetup."
          />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {stakeAmount > 0n && (
          <p className="text-sm text-text-secondary">
            Ao confirmar, {formatEther(stakeAmount)} MERIT serao travados como garantia
          </p>
        )}
        <button
          onClick={() => {
            confirm.confirmMeetup(meetupId);
          }}
          disabled={confirm.isPending || confirm.isConfirming}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {confirm.isPending
            ? "Confirme na wallet..."
            : confirm.isConfirming
            ? "Confirmando (~400ms)..."
            : stakeAmount > 0n
            ? `Confirmar Meetup (stake: ${formatEther(stakeAmount)} MERIT)`
            : "Confirmar Meetup"}
        </button>
        <TxFeedback
          hash={confirm.hash}
          isSuccess={confirm.isSuccess}
          error={confirm.error}
          successMessage="Meetup confirmado!"
        />
      </div>
    );
  }

  // Pending + invitee who has confirmed -> Waiting for others
  if (status === 0 && isInvitee && hasConfirmed) {
    return (
      <div className="bg-bg rounded-card p-4">
        <p className="text-sm text-text-secondary">
          Aguardando outros confirmarem...
        </p>
      </div>
    );
  }

  // Pending + creator -> Cancel + show confirmations progress
  if (status === 0 && isCreator) {
    return (
      <div className="space-y-3">
        <div className="bg-bg rounded-card p-4">
          <p className="text-sm text-text-secondary">
            Aguardando confirmacoes dos convidados...
          </p>
        </div>
        <button
          onClick={() => {
            cancel.cancelMeetup(meetupId);
          }}
          disabled={cancel.isPending || cancel.isConfirming}
          className="btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {cancel.isPending
            ? "Confirme na wallet..."
            : cancel.isConfirming
            ? "Confirmando (~400ms)..."
            : "Cancelar Meetup"}
        </button>
        <TxFeedback
          hash={cancel.hash}
          isSuccess={cancel.isSuccess}
          error={cancel.error}
          successMessage="Meetup cancelado."
        />
      </div>
    );
  }

  // Confirmed + participant -> Register bill
  if (status === 1 && isParticipant) {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-sm text-text-secondary block mb-1">
            Valor da conta (MERIT)
          </label>
          <input
            type="text"
            placeholder="50"
            value={billInput}
            onChange={(e) => setBillInput(e.target.value)}
            className="w-full bg-bg border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
          />
        </div>
        <button
          onClick={() => {
            if (!billInput || isNaN(Number(billInput)) || Number(billInput) <= 0)
              return;
            register.registerBill(meetupId, parseEther(billInput));
          }}
          disabled={register.isPending || register.isConfirming || !billInput}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {register.isPending
            ? "Confirme na wallet..."
            : register.isConfirming
            ? "Confirmando (~400ms)..."
            : "Registrar Conta"}
        </button>
        <TxFeedback
          hash={register.hash}
          isSuccess={register.isSuccess}
          error={register.error}
          successMessage="Conta registrada!"
        />
      </div>
    );
  }

  // BillRegistered + debtor (not the payer) -> Approve then Settle (2-step)
  if (status === 2 && isDebtor) {
    return (
      <div className="space-y-3">
        <div className="bg-bg rounded-card p-4 space-y-2">
          <p className="text-sm text-text-secondary">
            Valor total: {formatEther(billAmount)} MERIT
          </p>
          <p className="text-sm text-text-secondary">
            Participantes: {totalParticipants}
          </p>
          <p className="text-sm text-text-secondary">
            Sua parte (1/{totalParticipants}):{" "}
            <span className="font-semibold text-primary">
              {formatEther(splitAmount)} MERIT
            </span>
          </p>
          {stakeAmount > 0n && (
            <p className="text-sm text-warning">
              Seu stake de {formatEther(stakeAmount)} MERIT sera devolvido ao pagar
            </p>
          )}
        </div>

        {!hasEnoughAllowance ? (
          <>
            <button
              onClick={() => {
                approveMerit.approve(MEETUP_MANAGER_ADDRESS, splitAmount);
              }}
              disabled={approveMerit.isPending || approveMerit.isConfirming}
              className="btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {approveMerit.isPending
                ? "Confirme na wallet..."
                : approveMerit.isConfirming
                ? "Confirmando (~400ms)..."
                : `Aprovar ${formatEther(splitAmount)} MERIT`}
            </button>
            <TxFeedback
              hash={approveMerit.hash}
              isSuccess={approveMerit.isSuccess}
              error={approveMerit.error}
              successMessage="Aprovacao concedida! Agora liquide a conta."
            />
          </>
        ) : (
          <>
            <button
              onClick={() => {
                settle.settleBill(meetupId);
              }}
              disabled={settle.isPending || settle.isConfirming}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {settle.isPending
                ? "Confirme na wallet..."
                : settle.isConfirming
                ? "Confirmando (~400ms)..."
                : "Liquidar Conta"}
            </button>
            <TxFeedback
              hash={settle.hash}
              isSuccess={settle.isSuccess}
              error={settle.error}
              successMessage="Conta liquidada com sucesso!"
            />
          </>
        )}
      </div>
    );
  }

  // BillRegistered + bill payer -> waiting for others
  if (status === 2 && isBillPayer) {
    return (
      <div className="bg-bg rounded-card p-4">
        <p className="text-sm text-text-secondary">
          Aguardando pagamentos dos outros participantes...
        </p>
        <p className="text-sm text-text-muted mt-1">
          Valor total: {formatEther(billAmount)} MERIT | Parte de cada: {formatEther(splitAmount)} MERIT
        </p>
      </div>
    );
  }

  // BillRegistered + not participant -> just show info
  if (status === 2 && !isParticipant) {
    return (
      <div className="bg-bg rounded-card p-4">
        <p className="text-sm text-text-secondary">
          Conta registrada. Aguardando liquidacao.
        </p>
      </div>
    );
  }

  // Settled
  if (status === 3) {
    return (
      <div className="bg-bg rounded-card p-4 text-center">
        <p className="text-success font-semibold">Meetup concluido!</p>
        <p className="text-sm text-text-muted mt-1">
          Conta de {formatEther(billAmount)} MERIT liquidada com sucesso.
        </p>
      </div>
    );
  }

  // Cancelled
  if (status === 4) {
    return (
      <div className="bg-bg rounded-card p-4 text-center">
        <p className="text-error font-semibold">Meetup cancelado</p>
      </div>
    );
  }

  return null;
}
