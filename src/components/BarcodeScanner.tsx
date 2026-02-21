import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType, Result } from "@zxing/library";
import { Camera, CameraOff, X, Loader2 } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_128,
    ]);

    const codeReader = new BrowserMultiFormatReader(hints);
    codeReaderRef.current = codeReader;

    const startScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });

        if (!videoRef.current) {
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // La callback accepte (result?, error?) → typage correct
        codeReader.decodeFromVideoElement(
          videoRef.current,
          (result?: Result, error?: Error) => {
            if (result) {
              console.log("Code-barres détecté:", result.getText());
              onScan(result.getText());
              stopScanning();
            }
            // Ignorer les erreurs de décodage (bruit)
          }
        );
      } catch (err) {
        console.error("Erreur caméra:", err);
        setPermissionDenied(true);
        setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
  }, [onScan, stopScanning]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* En-tête */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 rounded-full bg-black/50 text-white">
          <X className="h-6 w-6" />
        </button>
        <span className="text-white font-medium">Scanner un code-barres</span>
        <div className="w-10" />
      </div>

      {/* Vidéo */}
      <div className="h-full flex items-center justify-center">
        {permissionDenied ? (
          <div className="text-white text-center p-6">
            <CameraOff className="h-16 w-16 mx-auto mb-4 text-red-400" />
            <p className="text-lg mb-2">Accès caméra requis</p>
            <p className="text-sm text-gray-400 mb-4">
              Autorisez l'accès à la caméra dans les paramètres
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/20 rounded-xl text-white"
            >
              Fermer
            </button>
          </div>
        ) : error ? (
          <div className="text-white text-center p-6">
            <p className="text-lg mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/20 rounded-xl text-white"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* Overlay de scan */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
              </div>
            </div>

            {/* Animation de scan */}
            {scanning && (
              <div className="absolute bottom-32 left-0 right-0 flex justify-center">
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                  <span className="text-white">
                    Positionnez le code-barres dans le cadre
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;