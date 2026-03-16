import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddMoney } from "../hooks/useQueries";

interface AddMoneyModalProps {
  open: boolean;
  onClose: () => void;
}

const PRESETS = [100, 500, 1000];

export function AddMoneyModal({ open, onClose }: AddMoneyModalProps) {
  const [amount, setAmount] = useState("");
  const addMoney = useAddMoney();

  function handlePreset(value: number) {
    setAmount(String(value));
  }

  async function handleConfirm() {
    const num = Number.parseFloat(amount);
    if (!num || num <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const paise = BigInt(Math.round(num * 100));
    try {
      await addMoney.mutateAsync(paise);
      toast.success(`₹${num.toFixed(2)} added to wallet!`);
      setAmount("");
      onClose();
    } catch {
      toast.error("Failed to add money. Please try again.");
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
        data-ocid="add_money.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Add Money
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div>
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
              Quick amounts
            </p>
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <button
                  type="button"
                  key={p}
                  data-ocid={`add_money.preset_${p}_button`}
                  onClick={() => handlePreset(p)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    amount === String(p)
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  ₹{p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">
              Custom amount
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                ₹
              </span>
              <Input
                data-ocid="add_money.amount_input"
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
              data-ocid="add_money.close_button"
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:text-foreground h-12 rounded-xl"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="add_money.confirm_button"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-semibold"
              onClick={handleConfirm}
              disabled={addMoney.isPending}
            >
              {addMoney.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Money
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
