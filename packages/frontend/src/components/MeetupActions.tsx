"use client";

import { useState } from "react";
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

interface MeetupActionsProps {
  meetupId: bigint;
  status: number;
  creator: string;
  invitees: string[];
  billAmount: bigint;
  billPayer: string;
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

  const { data: currentAllowance } = useAllowance(
    isDebtor ? (currentUser as `0x${string}`) : undefined,
    MEETUP_MANAGER_ADDRESS
  );

  const hasEnoughAllowance =
    currentAllowance !== undefined && currentAllowance >= splitAmount;

  // Pending + invitee who hasn't confirmed -> Confirm
  if (status === 0 && isInvitee && !hasConfirmed) {
    return (
      <div className="space-y-3">
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
