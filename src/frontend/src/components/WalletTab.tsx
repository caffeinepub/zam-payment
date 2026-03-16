import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, Plus, QrCode, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAllTransactions, useWalletBalance } from "../hooks/useQueries";
import { formatRupees, formatShortDate } from "../lib/format";
import { AddMoneyModal } from "./AddMoneyModal";
import { PaymentModal } from "./PaymentModal";
import { StatusBadge } from "./StatusBadge";

const SAMPLE_TRANSACTIONS = [
  {
    id: 1,
    merchant: { name: "Sharma Kirana Store" },
    amount: BigInt(24500),
    date: BigInt(Date.now() * 1_000_000 - 3600_000_000_000),
    status: "successful" as const,
  },
  {
    id: 2,
    merchant: { name: "Raju Medical" },
    amount: BigInt(38000),
    date: BigInt(Date.now() * 1_000_000 - 86400_000_000_000),
    status: "successful" as const,
  },
  {
    id: 3,
    merchant: { name: "Annapurna Restaurant" },
    amount: BigInt(52000),
    date: BigInt(Date.now() * 1_000_000 - 172800_000_000_000),
    status: "failed" as const,
  },
  {
    id: 4,
    merchant: { name: "Green Vegetables" },
    amount: BigInt(18000),
    date: BigInt(Date.now() * 1_000_000 - 259200_000_000_000),
    status: "successful" as const,
  },
  {
    id: 5,
    merchant: { name: "City Bakery" },
    amount: BigInt(12500),
    date: BigInt(Date.now() * 1_000_000 - 345600_000_000_000),
    status: "successful" as const,
  },
];

export function WalletTab() {
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useWalletBalance();
  const { data: transactions, isLoading: txLoading } = useAllTransactions();

  const displayBalance = balance ?? BigInt(0);
  const displayTx =
    transactions && transactions.length > 0
      ? transactions.slice(-5).reverse()
      : null;

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        data-ocid="wallet.balance_card"
        className="wallet-gradient rounded-3xl p-6 relative overflow-hidden border border-primary/20 card-glow"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium uppercase tracking-widest text-primary/70">
              Wallet Balance
            </p>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
          </div>
          {balanceLoading ? (
            <Skeleton className="h-10 w-40 bg-primary/20 mt-1 mb-4 rounded-lg" />
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-4xl font-bold text-foreground mt-1 mb-4"
            >
              {formatRupees(displayBalance)}
            </motion.p>
          )}
          <Button
            data-ocid="wallet.add_money_button"
            onClick={() => setAddMoneyOpen(true)}
            size="sm"
            className="bg-accent/90 hover:bg-accent text-accent-foreground font-semibold rounded-xl h-9 px-4 text-sm transition-all hover:shadow-gold-glow"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Money
          </Button>
        </div>
      </motion.div>

      {/* Scan QR CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <Button
          data-ocid="wallet.scan_qr_button"
          onClick={() => setPaymentOpen(true)}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-semibold text-base rounded-2xl transition-all hover:shadow-glow"
        >
          <QrCode className="h-5 w-5 mr-2.5" />
          Scan Any QR
        </Button>
      </motion.div>

      {/* Recent Transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-base text-foreground">
            Recent Transactions
          </h2>
          <span className="text-xs text-muted-foreground">Last 5</span>
        </div>

        {txLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl bg-card" />
            ))}
          </div>
        ) : displayTx ? (
          <div className="space-y-2">
            {displayTx.map((tx, i) => (
              <motion.div
                key={`${String(tx.date)}-${String(tx.amount)}`}
                data-ocid={`wallet.transactions.item.${i + 1}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate max-w-[130px]">
                      {tx.merchant.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatShortDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-foreground">
                    −{formatRupees(tx.amount)}
                  </p>
                  <StatusBadge status={tx.status} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {SAMPLE_TRANSACTIONS.map((tx, i) => (
              <motion.div
                key={tx.id}
                data-ocid={`wallet.transactions.item.${i + 1}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate max-w-[130px]">
                      {tx.merchant.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatShortDate(tx.date)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-foreground">
                    −{formatRupees(tx.amount)}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      tx.status === "successful"
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {tx.status === "successful" ? "Paid" : "Failed"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <AddMoneyModal
        open={addMoneyOpen}
        onClose={() => setAddMoneyOpen(false)}
      />
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
}
