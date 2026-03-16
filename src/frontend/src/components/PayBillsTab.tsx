import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, Droplets, Phone, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { BillType, useBillPayments } from "../hooks/useQueries";
import { formatRupees, formatShortDate } from "../lib/format";
import { BillPaymentModal } from "./BillPaymentModal";
import { StatusBadge } from "./StatusBadge";

const BILL_CATEGORIES = [
  {
    type: BillType.electricity,
    label: "Electricity",
    icon: Zap,
    ocid: "paybills.electricity_button",
    gradient: "from-amber-500/20 to-yellow-500/10",
    iconColor: "text-accent",
    borderColor: "border-accent/20",
  },
  {
    type: BillType.mobile,
    label: "Mobile Recharge",
    icon: Phone,
    ocid: "paybills.mobile_button",
    gradient: "from-primary/20 to-blue-500/10",
    iconColor: "text-primary",
    borderColor: "border-primary/20",
  },
  {
    type: BillType.water,
    label: "Water Bill",
    icon: Droplets,
    ocid: "paybills.water_button",
    gradient: "from-cyan-500/20 to-teal-500/10",
    iconColor: "text-cyan-400",
    borderColor: "border-cyan-500/20",
  },
];

const SAMPLE_BILLS = [
  {
    billType: BillType.electricity,
    amount: BigInt(85000),
    date: BigInt(Date.now() * 1_000_000 - 5 * 86400_000_000_000),
    status: "successful" as const,
  },
  {
    billType: BillType.mobile,
    amount: BigInt(49900),
    date: BigInt(Date.now() * 1_000_000 - 12 * 86400_000_000_000),
    status: "successful" as const,
  },
  {
    billType: BillType.water,
    amount: BigInt(32000),
    date: BigInt(Date.now() * 1_000_000 - 20 * 86400_000_000_000),
    status: "successful" as const,
  },
];

const BILL_LABEL_MAP: Record<BillType, string> = {
  [BillType.electricity]: "Electricity",
  [BillType.mobile]: "Mobile",
  [BillType.water]: "Water",
};

export function PayBillsTab() {
  const [selectedBill, setSelectedBill] = useState<BillType | null>(null);
  const { data: billPayments, isLoading } = useBillPayments();

  const displayBills =
    billPayments && billPayments.length > 0 ? billPayments : SAMPLE_BILLS;

  return (
    <div className="flex flex-col gap-6 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Pay Bills
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pay your utility bills instantly
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {BILL_CATEGORIES.map((cat, i) => (
          <motion.button
            type="button"
            key={cat.type}
            data-ocid={cat.ocid}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setSelectedBill(cat.type)}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${cat.gradient} border ${cat.borderColor} hover:scale-105 transition-all active:scale-95`}
          >
            <div className="w-11 h-11 rounded-xl bg-card/60 flex items-center justify-center">
              <cat.icon className={`h-5 w-5 ${cat.iconColor}`} />
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">
              {cat.label}
            </span>
          </motion.button>
        ))}
      </div>

      <section>
        <h2 className="font-display font-semibold text-base text-foreground mb-3">
          Recent Bill Payments
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl bg-card" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayBills.map((bp, i) => (
              <motion.div
                key={`${bp.billType}-${String(bp.date)}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {BILL_LABEL_MAP[bp.billType]}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatShortDate(bp.date)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-foreground">
                    −{formatRupees(bp.amount)}
                  </p>
                  <StatusBadge status={bp.status} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {selectedBill !== null && (
        <BillPaymentModal
          open={selectedBill !== null}
          onClose={() => setSelectedBill(null)}
          billType={selectedBill}
        />
      )}
    </div>
  );
}
