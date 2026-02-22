"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/jpeg" as const,
};

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
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let processedFile: File | Blob = file;

      if (file.size > 2 * 1024 * 1024) {
        setUploadStatus("Compressing...");
        processedFile = await imageCompression(file, COMPRESSION_OPTIONS);
      }

      setUploadStatus("Uploading...");
      const formData = new FormData();
      formData.append(
        "file",
        processedFile,
        file.name.replace(/\.[^.]+$/, ".jpg")
      );

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "Upload failed");
      }
      const { url } = await res.json();
      onChange(url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      setUploadStatus("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  switch (fieldType) {
    case "Date":
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{fieldName}</Label>
          <Input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      );

    case "Decimal":
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{fieldName}</Label>
          <Input
            id={id}
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
          <Label htmlFor={id}>{fieldName}</Label>
          <Input
            id={id}
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
              <button
                type="button"
                className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onImageClick?.(value)}
                aria-label={`Preview ${fieldName} image`}
              >
                <Image src={value} alt={`${fieldName} upload`} fill className="object-cover" />
              </button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => onChange("")}
                aria-label={`Remove ${fieldName} image`}
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
                className="sr-only"
                id={id}
                onChange={handleImageUpload}
                aria-label={`Upload image for ${fieldName}`}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-controls={id}
              >
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                {uploading ? uploadStatus || "Processing..." : "Upload Image"}
              </Button>
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{fieldName}</Label>
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${fieldName.toLowerCase()}`}
          />
        </div>
      );
  }
}
