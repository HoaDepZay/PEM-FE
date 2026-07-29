import { useRef, useState, useCallback, type FormEvent } from 'react';
import Webcam from 'react-webcam';
import { Camera, Send, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function CameraSnap() {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoConstraints = {
    width: { ideal: 1080 },
    height: { ideal: 1920 },
    facingMode: "environment" // Use back camera on mobile
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImageSrc(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImageSrc(null);
    setNote('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageSrc) return;
    
    setIsSubmitting(true);
    try {
      // 1. Convert base64 to File for compression
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      
      // 2. Compress image using browser-image-compression
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      
      console.log('Original size:', file.size / 1024 / 1024, 'MB');
      console.log('Compressed size:', compressedFile.size / 1024 / 1024, 'MB');
      
      // TODO: Gửi API lên Backend (compressedFile + note)
      console.log("Submit:", note);
      
      // Reset after success
      retake();
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex flex-col justify-center items-center overflow-hidden">
      {!imageSrc ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover"
          />
          {/* Nút chụp hình */}
          <div className="absolute bottom-10 w-full flex justify-center pb-8">
            <button
              onClick={capture}
              className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center border-[4px] border-white backdrop-blur-sm active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Camera className="text-black w-8 h-8" />
              </div>
            </button>
          </div>
        </>
      ) : (
        <>
          <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />
          
          {/* Overlay gradient for text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>

          {/* Nút hủy */}
          <button 
            onClick={retake}
            className="absolute top-6 left-6 p-2 bg-black/40 rounded-full text-white backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Form nhập note */}
          <form 
            onSubmit={handleSubmit} 
            className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4"
          >
            <input
              type="text"
              autoFocus
              placeholder="Ghi chú chi tiêu (vd: Ăn trưa 45k)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-black/50 text-white placeholder-gray-300 text-lg px-6 py-4 rounded-2xl backdrop-blur-lg border border-white/20 focus:outline-none focus:border-white/50 shadow-2xl"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || !note.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Đang gửi...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Gửi ngay
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
