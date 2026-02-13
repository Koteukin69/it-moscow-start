'use client';

import {useState, useRef} from "react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Loader2, Upload, X} from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({value, onChange}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/commission/upload", {method: "POST", body});
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      }
    } catch { /* ignore */ }
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <Label>Изображение <span className="text-muted-foreground">(необязательно)</span></Label>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
        e.target.value = "";
      }}/>
      {value ? (
        <div className="relative">
          <img src={value} alt="Превью" className="w-full aspect-video object-cover rounded-lg"/>
          <Button variant="destructive" size="icon-sm" className="absolute top-2 right-2" onClick={() => onChange("")}>
            <X size={12}/>
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={16} className="animate-spin"/> : <Upload size={16}/>}
          {uploading ? "Загрузка..." : "Загрузить изображение"}
        </Button>
      )}
    </div>
  );
}
