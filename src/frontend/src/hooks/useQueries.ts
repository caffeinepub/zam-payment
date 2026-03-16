import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BillType } from "../backend";
import { useActor } from "./useActor";

export function useWalletBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getWalletBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allTransactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBillPayments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["billPayments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBillPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMonthlySpent() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["monthlySpent"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getMonthlySpent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMoney() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.addMoney(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}

export function useMakePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      merchantId,
      merchantName,
      amount,
    }: {
      merchantId: Principal;
      merchantName: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.makePayment(merchantId, merchantName, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      queryClient.invalidateQueries({ queryKey: ["allTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["monthlySpent"] });
    },
  });
}

export function usePayBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      billType,
      amount,
    }: {
      billType: BillType;
      amount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.payBill(billType, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      queryClient.invalidateQueries({ queryKey: ["billPayments"] });
      queryClient.invalidateQueries({ queryKey: ["monthlySpent"] });
    },
  });
}

export { BillType };
