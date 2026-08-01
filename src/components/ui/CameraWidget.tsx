import React, { useRef, useState, useCallback, useEffect, type FormEvent } from 'react';
import Webcam from 'react-webcam';
import { Camera, Send, X, ChevronDown, Check } from 'lucide-react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    <div className={`w-full rounded-3xl overflow-hidden border border-slate-200 relative shadow-xl transition-all ${!imageSrc ? 'bg-slate-950 aspect-[3/4]' : 'bg-white flex flex-col'}`}>
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
              className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-[3px] border-white/80 backdrop-blur-md active:scale-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                <Camera className="text-slate-900 w-6 h-6" />
              </div>
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col w-full h-full">
          {/* Image Preview Area */}
          <div className="relative w-full aspect-[4/3] bg-slate-50 border-b border-slate-200">
            <img src={imageSrc} alt="Captured" className="w-full h-full object-contain" />
            <button 
              onClick={retake}
              className="absolute top-4 left-4 p-2.5 bg-white/80 rounded-full text-slate-900 backdrop-blur-xl border border-slate-200 z-10 active:scale-90 transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Area */}
          <form 
            onSubmit={handleSubmit} 
            className="p-5 flex flex-col gap-4 bg-white"
          >
            {/* Category Custom Dropdown */}
            <div className="relative w-full z-20">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border transition-all ${
                  isDropdownOpen 
                    ? 'bg-white border-slate-300 ring-4 ring-slate-100 shadow-sm' 
                    : 'bg-slate-50 border-transparent shadow-inner hover:bg-slate-100'
                }`}
              >
                <span className={`font-semibold ${!categoryId ? 'text-slate-900/50' : 'text-slate-900'}`}>
                  {categories.find(c => c.category_id === categoryId)?.name || 'Chọn danh mục'}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-slate-900' : ''}`} />
              </button>

              {isDropdownOpen && (
                <>
                  {/* Invisible backdrop to close dropdown */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto overscroll-contain">
                      {categories.length === 0 ? (
                        <div className="px-6 py-4 text-slate-900/60 text-sm">Chưa có danh mục</div>
                      ) : (
                        categories.map((cat) => (
                          <button
                            key={cat.category_id}
                            type="button"
                            onClick={() => {
                              setCategoryId(cat.category_id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-6 py-3.5 text-left transition-colors ${
                              categoryId === cat.category_id 
                                ? 'bg-slate-100 text-slate-900 font-bold' 
                                : 'text-slate-900/80 hover:bg-slate-50 hover:text-slate-900 font-medium'
                            }`}
                          >
                            <span>{cat.name}</span>
                            {categoryId === cat.category_id && <Check className="w-5 h-5 text-slate-900" />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="Số tiền..."
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-slate-50 text-slate-900 placeholder-brand-700/40 text-2xl font-black px-6 py-4 rounded-2xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all shadow-inner"
                required
              />
              
              <input
                type="text"
                placeholder="Ghi chú (Tùy chọn)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 placeholder-brand-700/40 text-base font-medium px-6 py-4 rounded-xl border border-transparent focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !amount || !categoryId}
              className="w-full bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-900/90 hover:to-slate-700/90 disabled:from-slate-100 disabled:to-slate-100 text-white disabled:text-slate-900/40 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20 disabled:shadow-none active:scale-95 mt-2"
            >
              {isSubmitting ? (
                <span className="animate-pulse flex items-center gap-2">
                  Đang lưu...
                </span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Lưu giao dịch
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
