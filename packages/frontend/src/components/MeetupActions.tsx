"use client";

import { useState } from "react";
import { parseEther, formatEther } from "viem";
import {
  useConfirmMeetup,
  useRegisterBill,
  useSettleBill,
  useCancelMeetup,
} from "@/hooks/useMeetupManager";
import { useApproveMerit, useAllowance } from "@/hooks/useMeritCoin";
import { MEETUP_MANAGER_ADDRESS } from "@/lib/contracts";

interface MeetupActionsProps {
  meetupId: bigint;
  status: number;
  creator: string;
  invitee: string;
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
  invitee,
  billAmount,
  billPayer,
  currentUser,
  onSuccess,
}: MeetupActionsProps) {
  const [billInput, setBillInput] = useState("");

  const isCreator = currentUser.toLowerCase() === creator.toLowerCase();
  const isInvitee = currentUser.toLowerCase() === invitee.toLowerCase();
  const isParticipant = isCreator || isInvitee;

  // Determine debtor: the participant who did NOT pay the bill
  const debtor =
    billPayer.toLowerCase() === creator.toLowerCase() ? invitee : creator;
  const isDebtor = currentUser.toLowerCase() === debtor.toLowerCase();

  const splitAmount = billAmount > 0n ? billAmount / 2n : 0n;

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

  // Pending + invitee -> Confirm
  if (status === 0 && isInvitee) {
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

  // Pending + creator -> Cancel
  if (status === 0 && isCreator) {
    return (
      <div className="space-y-3">
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

  // BillRegistered + debtor -> Approve then Settle (2-step)
  if (status === 2 && isDebtor) {
    return (
      <div className="space-y-3">
        <div className="bg-bg rounded-card p-4 space-y-2">
          <p className="text-sm text-text-secondary">
            Valor total: {formatEther(billAmount)} MERIT
          </p>
          <p className="text-sm text-text-secondary">
            Sua parte (50%): <span className="font-semibold text-primary">{formatEther(splitAmount)} MERIT</span>
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

  // BillRegistered + not debtor -> waiting
  if (status === 2 && !isDebtor && isParticipant) {
    return (
      <div className="bg-bg rounded-card p-4">
        <p className="text-sm text-text-secondary">
          Aguardando o outro participante liquidar a conta...
        </p>
        <p className="text-sm text-text-muted mt-1">
          Valor total: {formatEther(billAmount)} MERIT | Parte de cada: {formatEther(splitAmount)} MERIT
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
