'use client';

import {useState, useRef} from "react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Loader2, Plus, X} from "lucide-react";
import imageCompression from "browser-image-compression";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function MultiImageUpload({value, onChange}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
      });

      const body = new FormData();
      body.append("file", compressed, compressed.name);
      const res = await fetch("/api/commission/upload", {method: "POST", body});
      if (res.ok) {
        const data = await res.json();
        onChange([...value, data.url]);
      }
    } catch { /* ignore */ }
    setUploading(false);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>Изображения</Label>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        e.target.value = "";
      }}/>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {value.map((url, i) => (
          <div key={i} className="relative shrink-0 w-24 h-24">
            <img src={url} alt={`Фото ${i + 1}`} className="w-full h-full object-cover rounded-lg"/>
            <Button
              variant="destructive"
              size="icon-sm"
              className="absolute -top-1.5 -right-1.5 h-5 w-5"
              onClick={() => handleRemove(i)}
            >
              <X size={10}/>
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          className="shrink-0 w-24 h-24 flex-col gap-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16}/>}
          <span className="text-xs">{uploading ? "..." : "Фото"}</span>
        </Button>
      </div>
    </div>
  );
}
