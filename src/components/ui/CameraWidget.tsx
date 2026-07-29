import React, { useRef, useState, useCallback, useEffect, type FormEvent } from 'react';
import Webcam from 'react-webcam';
import { Camera, Send, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../../context/AuthContext';

interface Category {
  category_id: string;
  name: string;
  color: string;
}

export const CameraWidget: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/categories/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || []);
          if (data.data && data.data.length > 0) {
            setCategoryId(data.data[0].category_id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchCategories();
  }, [token]);

  const videoConstraints = {
    width: { ideal: 1080 },
    height: { ideal: 1080 },
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
    setAmount('');
    setNote('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageSrc || !amount || !categoryId) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      
      const formData = new FormData();
      formData.append('image', compressedFile);
      formData.append('amount', amount.replace(/,/g, ''));
      formData.append('category_id', categoryId);
      formData.append('note', note);
      
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/expenses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      alert('Đã lưu chi tiêu thành công!');
      retake();
    } catch (error) {
      console.error("Error submitting:", error);
      alert('Có lỗi xảy ra khi lưu chi tiêu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value) {
      setAmount(Number(value).toLocaleString('en-US'));
    } else {
      setAmount('');
    }
  };

  return (
    <div className="w-full rounded-3xl overflow-hidden bg-black border border-white/20 relative shadow-2xl aspect-[3/4]">
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
          <div className="absolute bottom-6 w-full flex justify-center">
            <button
              onClick={capture}
              className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center border-[3px] border-white backdrop-blur-sm active:scale-95 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Camera className="text-black w-6 h-6" />
              </div>
            </button>
          </div>
        </>
      ) : (
        <>
          <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />
          
          <div className="absolute bottom-0 left-0 right-0 h-[80%] bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>

          <button 
            onClick={retake}
            className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-md z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <form 
            onSubmit={handleSubmit} 
            className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="Số tiền..."
                value={amount}
                onChange={handleAmountChange}
                className="flex-1 bg-black/60 text-white placeholder-gray-400 text-lg font-bold px-4 py-3 rounded-xl backdrop-blur-lg border border-white/20 focus:outline-none focus:border-white/50"
                required
              />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-1/3 bg-black/60 text-white px-3 py-3 rounded-xl backdrop-blur-lg border border-white/20 focus:outline-none focus:border-white/50 appearance-none"
                required
              >
                {categories.length === 0 && <option value="">Chưa có DM</option>}
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Ghi chú (Tùy chọn)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-black/60 text-white placeholder-gray-400 text-base px-4 py-3 rounded-xl backdrop-blur-lg border border-white/20 focus:outline-none focus:border-white/50"
            />

            <button
              type="submit"
              disabled={isSubmitting || !amount || !categoryId}
              className="w-full bg-white hover:bg-gray-200 disabled:bg-gray-800 text-black disabled:text-gray-500 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Đang gửi...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Lưu giao dịch
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
