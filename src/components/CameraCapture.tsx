import { useRef, useState } from "react";
import { Camera, X, RotateCw, Check } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageFile: File) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);

  const startCamera = async (mode: "environment" | "user") => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
      }
      setError(null);
    } catch (err) {
      setError("Impossible d'accéder à la caméra");
    }
  };

  const toggleCamera = () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      context?.drawImage(videoRef.current, 0, 0);
      
      const imageData = canvasRef.current.toDataURL("image/jpeg");
      setCapturedImage(imageData);
      
      // Convertir en fichier
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "food-photo.jpg", { type: "image/jpeg" });
          onCapture(file);
        }
      }, "image/jpeg", 0.9);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 rounded-full bg-black/50 text-white">
          <X className="h-6 w-6" />
        </button>
        <span className="text-white font-medium">
          {capturedImage ? "Photo prise" : "Prendre une photo"}
        </span>
        {!capturedImage ? (
          <button onClick={toggleCamera} className="p-2 rounded-full bg-black/50 text-white">
            <RotateCw className="h-6 w-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      <div className="h-full flex items-center justify-center">
        {error ? (
          <div className="text-white text-center p-6">
            <p className="text-lg mb-4">{error}</p>
            <button onClick={() => startCamera(facingMode)} className="px-6 py-3 bg-white/20 rounded-xl">
              Réessayer
            </button>
          </div>
        ) : capturedImage ? (
          <div className="relative w-full h-full">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={retakePhoto}
                className="px-6 py-3 bg-black/50 backdrop-blur-sm rounded-full text-white font-medium"
              >
                Reprendre
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-food text-white rounded-full font-medium flex items-center gap-2"
              >
                <Check className="h-5 w-5" /> Utiliser
              </button>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white border-4 border-white/50 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-white" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;