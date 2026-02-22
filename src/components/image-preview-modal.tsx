"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import Image from "next/image";

interface ImagePreviewModalProps {
  src: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({ src, onClose }: ImagePreviewModalProps) {
  return (
    <Dialog open={!!src} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl p-2">
        <VisuallyHidden>
          <DialogTitle>Image preview</DialogTitle>
        </VisuallyHidden>
        {src && (
          <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
            <Image
              src={src}
              alt="Full-size preview"
              fill
              className="object-contain rounded-lg"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
