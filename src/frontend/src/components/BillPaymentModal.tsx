import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Droplets, Loader2, Phone, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BillType, usePayBill } from "../hooks/useQueries";

interface BillPaymentModalProps {
  open: boolean;
  onClose: () => void;
  billType: BillType;
}

const BILL_LABELS: Record<
  BillType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  [BillType.electricity]: {
    label: "Electricity",
    icon: <Zap className="h-5 w-5" />,
    color: "text-accent",
  },
  [BillType.mobile]: {
    label: "Mobile Recharge",
    icon: <Phone className="h-5 w-5" />,
    color: "text-primary",
  },
  [BillType.water]: {
    label: "Water Bill",
    icon: <Droplets className="h-5 w-5" />,
    color: "text-cyan-400",
  },
};

export function BillPaymentModal({
  open,
  onClose,
  billType,
}: BillPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const payBill = usePayBill();
  const billInfo = BILL_LABELS[billType];

  useEffect(() => {
    if (open) setAmount("");
  }, [open]);

  async function handleConfirm() {
    const num = Number.parseFloat(amount);
    if (!num || num <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const paise = BigInt(Math.round(num * 100));
    try {
      await payBill.mutateAsync({ billType, amount: paise });
      toast.success(`${billInfo.label} bill of ₹${num.toFixed(2)} paid!`);
      setAmount("");
      onClose();
    } catch {
      toast.error("Bill payment failed. Please try again.");
    }
  }

  function handleClose() {
    setAmount("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="bg-card border-border max-w-[340px] rounded-3xl p-6"
        data-ocid="bill_payment.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground flex items-center gap-2">
            <span className={billInfo.color}>{billInfo.icon}</span>
            {billInfo.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
              Amount to Pay
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                ₹
              </span>
              <Input
                data-ocid="bill_payment.amount_input"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 bg-input border-border text-foreground text-base h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              data-ocid="bill_payment.close_button"
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:text-foreground h-12 rounded-xl"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="bill_payment.confirm_button"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-semibold"
              onClick={handleConfirm}
              disabled={payBill.isPending}
            >
              {payBill.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Pay Bill
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
