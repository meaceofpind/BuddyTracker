"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";

interface DynamicFieldProps {
  fieldName: string;
  fieldType: string;
  value: string;
  onChange: (value: string) => void;
  onImageClick?: (src: string) => void;
}

export function DynamicField({
  fieldName,
  fieldType,
  value,
  onChange,
  onImageClick,
}: DynamicFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onChange(url);
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  switch (fieldType) {
    case "Date":
      return (
        <div className="space-y-2">
          <Label>{fieldName}</Label>
          <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      );

    case "Decimal":
      return (
        <div className="space-y-2">
          <Label>{fieldName}</Label>
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${fieldName.toLowerCase()}`}
          />
        </div>
      );

    case "Integer":
      return (
        <div className="space-y-2">
          <Label>{fieldName}</Label>
          <Input
            type="number"
            step="1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${fieldName.toLowerCase()}`}
          />
        </div>
      );

    case "Image":
      return (
        <div className="space-y-2">
          <Label>{fieldName}</Label>
          {value ? (
            <div className="relative inline-block">
              <div
                className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-lg border"
                onClick={() => onImageClick?.(value)}
              >
                <Image src={value} alt={fieldName} fill className="object-cover" />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => onChange("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label>{fieldName}</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${fieldName.toLowerCase()}`}
          />
        </div>
      );
  }
}
