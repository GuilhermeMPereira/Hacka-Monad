"use client";

import { useState, useEffect, useRef } from "react";
import { parseEther, formatEther } from "viem";
import {
  useConfirmMeetup,
  useRegisterBill,
  useSettleBill,
  useCancelMeetup,
  useAcceptBill,
  useDisputeBill,
  useGetConfirmationStatus,
  useGetIndividualAmount,
  useHasAcceptedBill,
  useGetAcceptedCount,
} from "@/hooks/useMeetupManager";
import { useApproveMerit, useAllowance } from "@/hooks/useMeritCoin";
import { MEETUP_MANAGER_ADDRESS } from "@/lib/contracts";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { shortenAddress } from "@/lib/utils";

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
  const [individualInputs, setIndividualInputs] = useState<string[]>([]);
  const [isEqualSplit, setIsEqualSplit] = useState(true);

  const safeInvitees = invitees || [];
  const isCreator = currentUser.toLowerCase() === creator.toLowerCase();
  const isInvitee = safeInvitees.some(
    (inv) => inv.toLowerCase() === currentUser.toLowerCase()
  );
  const isParticipant = isCreator || isInvitee;

  const totalParticipants = safeInvitees.length + 1; // invitees + creator

  // All participants list: [creator, ...invitees]
  const allParticipants = [creator, ...safeInvitees];

  // Check if the current user is NOT the bill payer (i.e. needs to pay their split)
  const isBillPayer =
    billPayer && currentUser.toLowerCase() === billPayer.toLowerCase();
  const isDebtor = isParticipant && !isBillPayer && billPayer !== "0x0000000000000000000000000000000000000000";

  // Check current user's confirmation status
  const { data: hasConfirmed } = useGetConfirmationStatus(
    meetupId,
    isInvitee ? (currentUser as `0x${string}`) : undefined
  );

  // Individual amount for current user
  const { data: myIndividualAmount } = useGetIndividualAmount(
    meetupId,
    (status === 2 || status === 3) ? (currentUser as `0x${string}`) : undefined
  );

  // Acceptance status for current user
  const { data: hasAccepted, refetch: refetchHasAccepted } = useHasAcceptedBill(
    meetupId,
    (status === 2) ? (currentUser as `0x${string}`) : undefined
  );

  // Accepted count
  const { data: acceptedCountData, refetch: refetchAcceptedCount } = useGetAcceptedCount(
    (status === 2) ? meetupId : undefined
  );
  const acceptedCount = acceptedCountData !== undefined ? Number(acceptedCountData) : 0;

  const confirm = useConfirmMeetup();
  const register = useRegisterBill();
  const settle = useSettleBill();
  const cancel = useCancelMeetup();
  const accept = useAcceptBill();
  const dispute = useDisputeBill();
  const approveMerit = useApproveMerit();

  // Individual amount as bigint for allowance/settle checks
  const myAmount = myIndividualAmount !== undefined ? (myIndividualAmount as bigint) : 0n;

  // Allowance check for settle (debtor paying individual amount)
  const { data: currentAllowance, refetch: refetchAllowance } = useAllowance(
    isDebtor ? (currentUser as `0x${string}`) : undefined,
    MEETUP_MANAGER_ADDRESS
  );

  const hasEnoughAllowance =
    currentAllowance !== undefined && currentAllowance >= myAmount;

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
  const acceptHashRef = useRef<string | null>(null);
  const acceptTxIdRef = useRef<string | null>(null);
  const disputeHashRef = useRef<string | null>(null);
  const disputeTxIdRef = useRef<string | null>(null);

  const meetupLabel = `#${meetupId.toString()}`;

  // Initialize individual inputs when bill input or participant count changes
  useEffect(() => {
    if (isEqualSplit && billInput && !isNaN(Number(billInput)) && Number(billInput) > 0) {
      const equalAmount = (Number(billInput) / totalParticipants).toFixed(6);
      setIndividualInputs(Array(totalParticipants).fill(equalAmount));
    } else if (individualInputs.length !== totalParticipants) {
      setIndividualInputs(Array(totalParticipants).fill(""));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billInput, totalParticipants, isEqualSplit]);

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
      onSuccess?.();
    }
  }, [confirm.isSuccess, updateTransaction, onSuccess]);

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
      onSuccess?.();
    }
  }, [register.isSuccess, updateTransaction, onSuccess]);

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
        amount: `${formatEther(myAmount)} MERIT`,
        status: "pending",
      });
    }
  }, [settle.hash, addTransaction, meetupLabel, myAmount]);

  useEffect(() => {
    if (settle.isSuccess && settleTxIdRef.current) {
      updateTransaction(settleTxIdRef.current, { status: "confirmed" });
      onSuccess?.();
    }
  }, [settle.isSuccess, updateTransaction, onSuccess]);

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
      onSuccess?.();
    }
  }, [cancel.isSuccess, updateTransaction, onSuccess]);

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
        details: `Aprovou ${formatEther(myAmount)} MERIT para liquidacao`,
        amount: `${formatEther(myAmount)} MERIT`,
        status: "pending",
      });
    }
  }, [approveMerit.hash, addTransaction, myAmount]);

  useEffect(() => {
    if (approveMerit.isSuccess && approveTxIdRef.current) {
      updateTransaction(approveTxIdRef.current, { status: "confirmed" });
      refetchAllowance();
    }
  }, [approveMerit.isSuccess, updateTransaction, refetchAllowance]);

  // Record accept bill transaction
  useEffect(() => {
    if (accept.hash && acceptHashRef.current !== accept.hash) {
      acceptHashRef.current = accept.hash;
      const txId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      acceptTxIdRef.current = txId;
      addTransaction({
        id: txId,
        type: "accept_bill",
        hash: accept.hash,
        timestamp: Date.now(),
        details: `Aceitou conta do meetup ${meetupLabel}`,
        status: "pending",
      });
    }
  }, [accept.hash, addTransaction, meetupLabel]);

  useEffect(() => {
    if (accept.isSuccess && acceptTxIdRef.current) {
      updateTransaction(acceptTxIdRef.current, { status: "confirmed" });
      refetchAcceptedCount();
      refetchHasAccepted();
      onSuccess?.();
    }
  }, [accept.isSuccess, updateTransaction, refetchAcceptedCount, refetchHasAccepted, onSuccess]);

  // Record dispute bill transaction
  useEffect(() => {
    if (dispute.hash && disputeHashRef.current !== dispute.hash) {
      disputeHashRef.current = dispute.hash;
      const txId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      disputeTxIdRef.current = txId;
      addTransaction({
        id: txId,
        type: "dispute_bill",
        hash: dispute.hash,
        timestamp: Date.now(),
        details: `Contestou conta do meetup ${meetupLabel}`,
        status: "pending",
      });
    }
  }, [dispute.hash, addTransaction, meetupLabel]);

  useEffect(() => {
    if (dispute.isSuccess && disputeTxIdRef.current) {
      updateTransaction(disputeTxIdRef.current, { status: "confirmed" });
      onSuccess?.();
    }
  }, [dispute.isSuccess, updateTransaction, onSuccess]);

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

  // Helper: compute running total from individual inputs
  const runningTotal = individualInputs.reduce((sum, val) => {
    const n = Number(val);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const totalValid = billInput && !isNaN(Number(billInput)) && Number(billInput) > 0;
  const totalsMatch = totalValid && Math.abs(runningTotal - Number(billInput)) < 0.000001;

  // Helper: render bill registration form (used in status 1 and 3 for re-registration)
  function renderBillRegistrationForm() {
    return (
      <div className="space-y-3">
        <div>
          <label className="text-sm text-text-secondary block mb-1">
            Valor total da conta (MERIT)
          </label>
          <input
            type="text"
            placeholder="50"
            value={billInput}
            onChange={(e) => setBillInput(e.target.value)}
            className="w-full bg-bg border border-border rounded-btn px-3 py-2 text-sm focus:outline-none focus:border-secondary transition-colors"
          />
        </div>

        {totalValid && (
          <>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEqualSplit}
                  onChange={(e) => setIsEqualSplit(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-sm text-text-secondary">Dividir igualmente</span>
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-text-muted font-semibold">Valores individuais:</p>
              {allParticipants.map((addr, idx) => (
                <div key={addr} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-secondary w-28 shrink-0">
                    {shortenAddress(addr)}
                    {addr.toLowerCase() === creator.toLowerCase() && (
                      <span className="text-primary ml-1">(host)</span>
                    )}
                  </span>
                  <input
                    type="text"
                    value={individualInputs[idx] ?? ""}
                    onChange={(e) => {
                      if (isEqualSplit) setIsEqualSplit(false);
                      setIndividualInputs((prev) => {
                        const next = [...prev];
                        next[idx] = e.target.value;
                        return next;
                      });
                    }}
                    disabled={isEqualSplit}
                    className="flex-1 bg-bg border border-border rounded-btn px-2 py-1.5 text-sm focus:outline-none focus:border-secondary transition-colors disabled:opacity-50"
                    placeholder="0"
                  />
                  <span className="text-xs text-text-muted">MERIT</span>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-text-muted">Soma dos valores:</span>
                <span className={`text-sm font-semibold ${totalsMatch ? "text-success" : "text-error"}`}>
                  {runningTotal.toFixed(6)} / {Number(billInput).toFixed(6)} MERIT
                </span>
              </div>
              {!totalsMatch && totalValid && (
                <p className="text-error text-xs">
                  A soma dos valores individuais deve ser igual ao total
                </p>
              )}
            </div>
          </>
        )}

        <button
          onClick={() => {
            if (!totalValid || !totalsMatch) return;
            const amounts = individualInputs.map((v) => parseEther(v));
            register.registerBill(meetupId, parseEther(billInput), amounts);
          }}
          disabled={register.isPending || register.isConfirming || !totalValid || !totalsMatch}
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

  // Confirmed + participant -> Register bill (with individual amounts)
  if (status === 1 && isParticipant) {
    return renderBillRegistrationForm();
  }

  // BillRegistered + bill registerer -> show waiting + breakdown
  if (status === 2 && isBillPayer) {
    return (
      <div className="space-y-3">
        <div className="bg-bg rounded-card p-4 space-y-2">
          <p className="text-sm text-text-secondary font-semibold">
            Aguardando aceitacao dos participantes ({acceptedCount}/{totalParticipants} aceitos)
          </p>
          <p className="text-sm text-text-muted">
            Valor total: {formatEther(billAmount)} MERIT
          </p>
        </div>

        {/* Show settle button when all accepted */}
        {acceptedCount === totalParticipants && (
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

  // BillRegistered + participant (not bill payer) -> Accept/Dispute or Approve+Settle
  if (status === 2 && isParticipant && !isBillPayer) {
    // If not yet accepted, show accept/dispute buttons
    if (!hasAccepted) {
      return (
        <div className="space-y-3">
          <div className="bg-bg rounded-card p-4 space-y-2">
            <p className="text-sm text-text-secondary">
              Valor total: {formatEther(billAmount)} MERIT
            </p>
            <p className="text-sm text-text-secondary">
              Sua parte:{" "}
              <span className="font-semibold text-primary">
                {formatEther(myAmount)} MERIT
              </span>
            </p>
            <p className="text-xs text-text-muted">
              {acceptedCount}/{totalParticipants} aceitos
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                accept.acceptBill(meetupId);
              }}
              disabled={accept.isPending || accept.isConfirming}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {accept.isPending
                ? "Confirme..."
                : accept.isConfirming
                ? "Confirmando..."
                : "Aceitar"}
            </button>
            <button
              onClick={() => {
                dispute.disputeBill(meetupId);
              }}
              disabled={dispute.isPending || dispute.isConfirming}
              className="bg-transparent text-error border border-error font-semibold rounded-btn px-4 py-2.5 transition-colors hover:bg-error/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {dispute.isPending
                ? "Confirme..."
                : dispute.isConfirming
                ? "Confirmando..."
                : "Contestar"}
            </button>
          </div>

          <TxFeedback
            hash={accept.hash}
            isSuccess={accept.isSuccess}
            error={accept.error}
            successMessage="Conta aceita!"
          />
          <TxFeedback
            hash={dispute.hash}
            isSuccess={dispute.isSuccess}
            error={dispute.error}
            successMessage="Conta contestada."
          />
        </div>
      );
    }

    // Already accepted -> show approve + settle flow (if all accepted)
    return (
      <div className="space-y-3">
        <div className="bg-bg rounded-card p-4 space-y-2">
          <p className="text-sm text-success font-semibold">Voce aceitou esta conta</p>
          <p className="text-sm text-text-secondary">
            Sua parte:{" "}
            <span className="font-semibold text-primary">
              {formatEther(myAmount)} MERIT
            </span>
          </p>
          <p className="text-xs text-text-muted">
            {acceptedCount}/{totalParticipants} aceitos
          </p>
          {stakeAmount > 0n && (
            <p className="text-sm text-warning">
              Seu stake de {formatEther(stakeAmount)} MERIT sera devolvido ao pagar
            </p>
          )}
        </div>

        {acceptedCount === totalParticipants && (
          <>
            {!hasEnoughAllowance ? (
              <>
                <button
                  onClick={() => {
                    approveMerit.approve(MEETUP_MANAGER_ADDRESS, myAmount);
                  }}
                  disabled={approveMerit.isPending || approveMerit.isConfirming}
                  className="btn-secondary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {approveMerit.isPending
                    ? "Confirme na wallet..."
                    : approveMerit.isConfirming
                    ? "Confirmando (~400ms)..."
                    : `Aprovar ${formatEther(myAmount)} MERIT`}
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
          </>
        )}

        {acceptedCount < totalParticipants && (
          <p className="text-sm text-text-muted text-center">
            Aguardando todos aceitarem para liquidar...
          </p>
        )}
      </div>
    );
  }

  // BillRegistered + not participant -> just show info
  if (status === 2 && !isParticipant) {
    return (
      <div className="bg-bg rounded-card p-4">
        <p className="text-sm text-text-secondary">
          Conta registrada. Aguardando aceitacao e liquidacao.
        </p>
      </div>
    );
  }

  // Disputed + bill registerer -> re-register
  if (status === 3 && isBillPayer) {
    return (
      <div className="space-y-3">
        <div className="bg-bg rounded-card p-4">
          <p className="text-sm text-error font-semibold">
            A conta foi contestada. Registre novos valores.
          </p>
        </div>
        {renderBillRegistrationForm()}
      </div>
    );
  }

  // Disputed + creator who is not the bill payer -> can also re-register
  if (status === 3 && isCreator && !isBillPayer) {
    return (
      <div className="space-y-3">
        <div className="bg-bg rounded-card p-4">
          <p className="text-sm text-error font-semibold">
            A conta foi contestada. Registre novos valores.
          </p>
        </div>
        {renderBillRegistrationForm()}
      </div>
    );
  }

  // Disputed + other participants -> waiting
  if (status === 3 && isParticipant) {
    return (
      <div className="bg-bg rounded-card p-4">
        <p className="text-sm text-error font-semibold">
          A conta foi contestada. Aguardando novos valores do host.
        </p>
      </div>
    );
  }

  // Settled
  if (status === 4) {
    return (
      <div className="bg-bg rounded-card p-4 text-center">
        <p className="text-success font-semibold">Meetup concluido!</p>
        {billAmount > 0n && (
          <p className="text-sm text-text-muted mt-1">
            Conta de {formatEther(billAmount)} MERIT liquidada com sucesso.
          </p>
        )}
      </div>
    );
  }

  // Cancelled
  if (status === 5) {
    return (
      <div className="bg-bg rounded-card p-4 text-center">
        <p className="text-error font-semibold">Meetup cancelado</p>
      </div>
    );
  }

  return null;
}
