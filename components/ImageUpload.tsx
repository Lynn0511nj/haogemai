
import React, { useRef } from 'react';

interface ImageUploadProps {
  label: string;
  description?: string;
  onUpload: (base64: string) => void;
  currentImage?: string;
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, description, onUpload, currentImage, required }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("图片太大了，请选择 10MB 以内的图片");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // 压缩图片
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 设置最大尺寸（长边不超过 1920px）
          const maxSize = 1920;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为 base64，质量设置为 0.85
            let quality = 0.85;
            let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            
            // 如果压缩后仍然大于 1MB，继续降低质量
            while (compressedBase64.length > 1024 * 1024 && quality > 0.5) {
              quality -= 0.05;
              compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            }
            
            console.log(`图片压缩完成: 原始大小 ${(file.size / 1024).toFixed(0)}KB, 压缩后 ${(compressedBase64.length / 1024).toFixed(0)}KB, 质量 ${(quality * 100).toFixed(0)}%`);
            
            onUpload(compressedBase64);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 block">
        {label} {required && <span className="text-red-400 opacity-70">*</span>}
      </label>
      
      <div 
        onClick={() => inputRef.current?.click()}
        className={`relative h-32 w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden
          ${currentImage ? 'border-[#7C9A92] bg-[#F0F5F3]' : 'border-slate-200 bg-white hover:bg-slate-50'}
        `}
      >
        <input 
          type="file" 
          ref={inputRef} 
          onChange={handleChange} 
          className="hidden" 
          accept="image/*"
        />
        
        {currentImage ? (
          <div className="relative w-full h-full group">
            <img src={currentImage} className="h-full w-full object-cover p-1 rounded-2xl" alt="Preview" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-white bg-black/40 px-3 py-1 rounded-full font-bold">重选</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <svg className="mx-auto h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="mt-2 block text-xs font-bold text-slate-400 leading-relaxed">{description || "点此上传"}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
