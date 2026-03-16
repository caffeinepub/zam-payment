import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, SwitchCamera } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQRScanner } from "../qr-code/useQRScanner";
import { PaymentModal } from "./PaymentModal";

export function ScannerTab() {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [scannedMerchant, setScannedMerchant] = useState("");
  const [scannedId, setScannedId] = useState("");
  const lastScannedRef = useRef("");

  const {
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    clearResults,
    qrResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 3,
  });

  const parseQRAndOpenModal = useCallback(
    (data: string) => {
      let merchant = "";
      let merchantId = "";
      try {
        const url = new URL(data);
        merchant = url.searchParams.get("pn") ?? "";
        merchantId = url.searchParams.get("pa") ?? "";
      } catch {
        merchant = data.slice(0, 30);
      }
      setScannedMerchant(merchant);
      setScannedId(merchantId);
      stopScanning();
      clearResults();
      setPaymentOpen(true);
    },
    [stopScanning, clearResults],
  );

  useEffect(() => {
    if (qrResults.length > 0) {
      const latest = qrResults[0];
      if (latest.data !== lastScannedRef.current) {
        lastScannedRef.current = latest.data;
        parseQRAndOpenModal(latest.data);
      }
    }
  }, [qrResults, parseQRAndOpenModal]);

  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  return (
    <div className="flex flex-col gap-5 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold text-foreground">
          Scan QR Code
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Point camera at any UPI QR code
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-3xl overflow-hidden border border-primary/25 bg-card"
        style={{ aspectRatio: "1/1" }}
        data-ocid="scanner.canvas_target"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 relative">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-accent rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-accent rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-accent rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-accent rounded-br-xl" />
              {isScanning && (
                <motion.div
                  animate={{ y: [0, 176, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="absolute left-0 right-0 h-0.5 bg-accent/80"
                />
              )}
            </div>
          </div>
        )}

        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm text-center px-8">
              Tap the button below to start scanning
            </p>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card gap-2 p-6">
            <p className="text-destructive text-sm text-center font-medium">
              {error.message}
            </p>
          </div>
        )}

        {isSupported === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <p className="text-muted-foreground text-sm text-center px-8">
              Camera not supported on this device
            </p>
          </div>
        )}
      </motion.div>

      <div className="flex gap-3">
        {!isActive ? (
          <Button
            className="flex-1 h-12 bg-primary text-primary-foreground rounded-2xl font-semibold hover:shadow-glow"
            onClick={startScanning}
            disabled={!canStartScanning}
          >
            <Camera className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1 h-12 border-border rounded-2xl font-semibold"
            onClick={() => stopScanning()}
          >
            Stop
          </Button>
        )}
        {isMobile && isActive && (
          <Button
            variant="outline"
            className="w-12 h-12 border-border rounded-2xl p-0"
            onClick={() => switchCamera()}
            disabled={isLoading || !isActive}
          >
            <SwitchCamera className="h-4 w-4" />
          </Button>
        )}
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => {
          setPaymentOpen(false);
          lastScannedRef.current = "";
        }}
        prefillMerchant={scannedMerchant}
        prefillMerchantId={scannedId}
      />
    </div>
  );
}
