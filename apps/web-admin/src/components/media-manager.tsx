"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Upload, Image as ImageIcon, Check, Loader2, Trash2 } from "lucide-react";

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaManager({ isOpen, onClose, onSelect }: MediaManagerProps) {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Fetch images on open
  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from("site-assets").list();
    
    if (error) {
      console.error("Error fetching images:", error);
      // If bucket doesn't exist, we might want to handle that, but for now just log
    } else if (data) {
      const imageUrls = data.map((file) => {
        const { data: publicUrlData } = supabase.storage
          .from("site-assets")
          .getPublicUrl(file.name);
        return {
          name: file.name,
          url: publicUrlData.publicUrl,
        };
      });
      setImages(imageUrls);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // Sanitize filename: remove special chars, replace spaces with hyphens
    const fileExt = file.name.split(".").pop();
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf("."));
    const sanitizedName = nameWithoutExt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const fileName = `${sanitizedName}-${Date.now()}.${fileExt}`; // Add timestamp to ensure uniqueness
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file);

    if (error) {
      alert("Error uploading image: " + error.message);
    } else {
      await fetchImages();
    }
    setUploading(false);
  };

  const handleDelete = async (name: string) => {
      if(!confirm("Are you sure you want to delete this image?")) return;
      
      const { error } = await supabase.storage.from("site-assets").remove([name]);
      if(error) {
          alert("Error deleting image");
      } else {
          fetchImages();
      }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            Media Manager
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
              <ImageIcon size={48} className="mb-2 opacity-20" />
              <p>No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div 
                  key={img.name} 
                  className="group relative aspect-square bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                  onClick={() => onSelect(img.url)}
                >
                  <img 
                    src={img.url} 
                    alt={img.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          Select
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(img.name); }}
                        className="bg-red-500 text-white p-1.5 rounded-full shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform hover:bg-red-600"
                      >
                          <Trash2 size={14} />
                      </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Supported formats: JPG, PNG, WEBP
          </p>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
