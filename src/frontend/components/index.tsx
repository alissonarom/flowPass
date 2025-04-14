import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";

interface QrCodeReaderProps {
  onScan: (decodedText: string) => void;
}

const QrCodeReader: React.FC<QrCodeReaderProps> = ({ onScan }) => {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scannerContainerRef.current;
    if (!container) return;

    const html5QrCode = new Html5Qrcode(container.id);
    html5QrCodeRef.current = html5QrCode;

    const qrCodeSuccessCallback = (decodedText: string) => {
      console.log("QR code lido:", decodedText);
      onScan(decodedText);
    };

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    html5QrCode
      .start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Ignora mensagens de erro específicas
          if (
            !errorMessage.includes("No MultiFormat Readers were able to detect")
          ) {
            console.error("Erro ao ler QR code:", errorMessage);
          }
        }
      )
      .catch((err) => {
        console.error("Erro ao iniciar scanner:", err);
      });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            console.log("Scanner parado com sucesso");
          })
          .catch((err) => {
            console.error("Erro ao parar scanner:", err);
          });
      }
    };
  }, [onScan]);

  return (
    <div
      id="qr-reader-container"
      ref={scannerContainerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default QrCodeReader;
