import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { History, Receipt, ScanLine, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { HistoryTab } from "./components/HistoryTab";
import { PayBillsTab } from "./components/PayBillsTab";
import { ScannerTab } from "./components/ScannerTab";
import { WalletTab } from "./components/WalletTab";

const queryClient = new QueryClient();

type Tab = "wallet" | "scanner" | "paybills" | "history";

const TABS: { id: Tab; label: string; icon: React.ReactNode; ocid: string }[] =
  [
    {
      id: "wallet",
      label: "Wallet",
      icon: <Wallet className="h-5 w-5" />,
      ocid: "nav.wallet_tab",
    },
    {
      id: "scanner",
      label: "Scanner",
      icon: <ScanLine className="h-5 w-5" />,
      ocid: "nav.scanner_tab",
    },
    {
      id: "paybills",
      label: "Pay Bills",
      icon: <Receipt className="h-5 w-5" />,
      ocid: "nav.paybills_tab",
    },
    {
      id: "history",
      label: "History",
      icon: <History className="h-5 w-5" />,
      ocid: "nav.history_tab",
    },
  ];

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("wallet");

  return (
    <div className="min-h-dvh bg-background flex justify-center items-start">
      <div className="mobile-container w-full flex flex-col blue-glow">
        <header className="px-5 pt-12 pb-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Zam
              </h1>
              <span className="font-display text-2xl font-bold gold-text">
                Payment
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Prepaid Digital Wallet
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center border border-primary/20">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
        </header>

        <main className="flex-1 px-5 overflow-y-auto scrollbar-hide pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {activeTab === "wallet" && <WalletTab />}
              {activeTab === "scanner" && <ScannerTab />}
              {activeTab === "paybills" && <PayBillsTab />}
              {activeTab === "history" && <HistoryTab />}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-3 pb-6 pt-2 z-50">
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-3xl flex items-center py-2 px-2 shadow-card">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  data-ocid={tab.ocid}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 flex flex-col items-center gap-1 py-2 relative transition-all"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/15 rounded-2xl"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {tab.icon}
                  </span>
                  <span
                    className={`relative z-10 text-[10px] font-semibold transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDot"
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
