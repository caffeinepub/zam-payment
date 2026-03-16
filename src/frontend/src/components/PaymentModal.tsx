import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Principal } from "@icp-sdk/core/principal";
import { AlertTriangle, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMakePayment, useMonthlySpent } from "../hooks/useQueries";
import { formatRupees } from "../lib/format";

const MONTHLY_LIMIT = BigInt(500000); // 5000 rupees in paise

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  prefillMerchant?: string;
  prefillMerchantId?: string;
}

export function PaymentModal({
  open,
  onClose,
  prefillMerchant = "",
  prefillMerchantId = "",
}: PaymentModalProps) {
  const [merchantName, setMerchantName] = useState(prefillMerchant);
  const [amount, setAmount] = useState("");
  const [limitWarning, setLimitWarning] = useState(false);

  const makePayment = useMakePayment();
  const { data: monthlySpent = BigInt(0), refetch: refetchSpent } =
    useMonthlySpent();

  useEffect(() => {
    if (open) {
      setMerchantName(prefillMerchant);
      setAmount("");
      setLimitWarning(false);
    }
  }, [open, prefillMerchant]);

  async function handleSubmit() {
    const num = Number.parseFloat(amount);
    if (!merchantName.trim()) {
      toast.error("Enter merchant name");
      return;
    }
    if (!num || num <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    const paise = BigInt(Math.round(num * 100));

    // Refresh monthly spent before checking
    const { data: freshSpent } = await refetchSpent();
    const spent = freshSpent ?? monthlySpent;

    if (spent + paise > MONTHLY_LIMIT) {
      setLimitWarning(true);
      return;
    }

    await doPayment(paise);
  }

  async function doPayment(paise: bigint) {
    const num = Number(paise) / 100;
    let principal: Principal;
    try {
      principal = prefillMerchantId
        ? Principal.fromText(prefillMerchantId)
        : Principal.anonymous();
    } catch {
      principal = Principal.anonymous();
    }

    try {
      await makePayment.mutateAsync({
        merchantId: principal,
        merchantName: merchantName.trim(),
        amount: paise,
      });
      toast.success(`₹${num.toFixed(2)} paid to ${merchantName}!`);
      onClose();
    } catch {
      toast.error("Payment failed. Please try again.");
    }
  }

  const spentRupees = Number(monthlySpent) / 100;

  function handleClose() {
    setLimitWarning(false);
    setAmount("");
    setMerchantName("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="bg-card border-border max-w-[340px] rounded-3xl p-6"
        data-ocid="payment.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Make Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {limitWarning && (
            <div
              data-ocid="payment.limit_warning"
              className="flex items-start gap-3 bg-destructive/15 border border-destructive/30 rounded-xl p-4"
            >
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Monthly limit reached
                </p>
                <p className="text-xs text-destructive/80 mt-0.5">
                  You&apos;ve used {formatRupees(monthlySpent)} / ₹5,000 this
                  month.
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
              Merchant Name
            </p>
            <Input
              data-ocid="payment.merchant_input"
              placeholder="e.g. Kirana Store"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="bg-input border-border text-foreground text-base h-12 rounded-xl"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
              Amount
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                ₹
              </span>
              <Input
                data-ocid="payment.amount_input"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setLimitWarning(false);
                }}
                className="pl-8 bg-input border-border text-foreground text-base h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Monthly usage: ₹{spentRupees.toFixed(2)} / ₹5,000
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              data-ocid="payment.cancel_button"
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:text-foreground h-12 rounded-xl"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="payment.submit_button"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-semibold"
              onClick={handleSubmit}
              disabled={makePayment.isPending}
            >
              {makePayment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Pay Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
