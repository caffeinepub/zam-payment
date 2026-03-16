import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, Droplets, Phone, Receipt, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { TransactionStatus } from "../backend";
import type { BillPayment, Transaction } from "../backend";
import {
  BillType,
  useAllTransactions,
  useBillPayments,
} from "../hooks/useQueries";
import { formatDate, formatRupees } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

type HistoryItem =
  | { kind: "tx"; data: Transaction }
  | { kind: "bill"; data: BillPayment };

const BILL_ICONS: Record<BillType, React.ReactNode> = {
  [BillType.electricity]: <Zap className="h-4 w-4 text-accent" />,
  [BillType.mobile]: <Phone className="h-4 w-4 text-primary" />,
  [BillType.water]: <Droplets className="h-4 w-4 text-cyan-400" />,
};

const BILL_LABEL_MAP: Record<BillType, string> = {
  [BillType.electricity]: "Electricity Bill",
  [BillType.mobile]: "Mobile Recharge",
  [BillType.water]: "Water Bill",
};

const SAMPLE_HISTORY: HistoryItem[] = [
  {
    kind: "tx",
    data: {
      merchant: { name: "Sharma Kirana Store", merchantId: {} as never },
      amount: BigInt(24500),
      date: BigInt(Date.now() * 1_000_000 - 3600_000_000_000),
      status: TransactionStatus.successful,
    },
  },
  {
    kind: "bill",
    data: {
      billType: BillType.electricity,
      amount: BigInt(85000),
      date: BigInt(Date.now() * 1_000_000 - 86400_000_000_000),
      status: TransactionStatus.successful,
    },
  },
  {
    kind: "tx",
    data: {
      merchant: { name: "Raju Medical", merchantId: {} as never },
      amount: BigInt(38000),
      date: BigInt(Date.now() * 1_000_000 - 172800_000_000_000),
      status: TransactionStatus.successful,
    },
  },
  {
    kind: "bill",
    data: {
      billType: BillType.mobile,
      amount: BigInt(49900),
      date: BigInt(Date.now() * 1_000_000 - 259200_000_000_000),
      status: TransactionStatus.successful,
    },
  },
  {
    kind: "tx",
    data: {
      merchant: { name: "Annapurna Restaurant", merchantId: {} as never },
      amount: BigInt(52000),
      date: BigInt(Date.now() * 1_000_000 - 345600_000_000_000),
      status: TransactionStatus.failed,
    },
  },
  {
    kind: "tx",
    data: {
      merchant: { name: "City Electronics", merchantId: {} as never },
      amount: BigInt(129900),
      date: BigInt(Date.now() * 1_000_000 - 432000_000_000_000),
      status: TransactionStatus.successful,
    },
  },
];

function itemKey(item: HistoryItem, idx: number): string {
  return `${item.kind}-${String(item.data.date)}-${String(item.data.amount)}-${idx}`;
}

export function HistoryTab() {
  const { data: transactions, isLoading: txLoading } = useAllTransactions();
  const { data: billPayments, isLoading: billLoading } = useBillPayments();

  const isLoading = txLoading || billLoading;

  const history = useMemo((): HistoryItem[] => {
    const txItems: HistoryItem[] = (transactions ?? []).map((t) => ({
      kind: "tx",
      data: t,
    }));
    const billItems: HistoryItem[] = (billPayments ?? []).map((b) => ({
      kind: "bill",
      data: b,
    }));
    const all = [...txItems, ...billItems];
    all.sort((a, b) => Number(b.data.date) - Number(a.data.date));
    return all;
  }, [transactions, billPayments]);

  const displayHistory = history.length > 0 ? history : SAMPLE_HISTORY;
  const isEmpty = !isLoading && history.length === 0;

  return (
    <div className="flex flex-col gap-5 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Transaction History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your payments and bill transactions
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-18 w-full rounded-2xl bg-card" />
          ))}
        </div>
      ) : isEmpty ? (
        <div
          data-ocid="history.empty_state"
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
            <Receipt className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-display font-semibold text-foreground">
              No transactions yet
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Your payment history will appear here
            </p>
          </div>
        </div>
      ) : (
        <div data-ocid="history.list" className="space-y-2">
          {displayHistory.map((item, i) => (
            <motion.div
              key={itemKey(item, i)}
              data-ocid={`history.item.${i + 1}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  {item.kind === "bill" ? (
                    BILL_ICONS[item.data.billType]
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground truncate max-w-[145px]">
                    {item.kind === "tx"
                      ? item.data.merchant.name
                      : BILL_LABEL_MAP[item.data.billType]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(item.data.date)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-sm font-bold text-destructive">
                  −{formatRupees(item.data.amount)}
                </p>
                <StatusBadge status={item.data.status} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
