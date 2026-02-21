"use client";

import { useState } from "react";
import type { FormOption } from "@/types";
import { DynamicField } from "@/components/dynamic-field";
import { ImagePreviewModal } from "@/components/image-preview-modal";
import { Button } from "@/components/ui/button";

interface FieldValue {
  fieldName: string;
  fieldType: string;
  fieldValue: string;
}

interface EntryFormProps {
  options: FormOption[];
  defaultValues?: FieldValue[];
  onSubmit: (data: FieldValue[]) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function EntryForm({
  options,
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "Create Entry",
}: EntryFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [fields, setFields] = useState<FieldValue[]>(() =>
    options.map((opt) => {
      const existing = defaultValues?.find((d) => d.fieldName === opt.fieldName);
      return {
        fieldName: opt.fieldName,
        fieldType: opt.fieldType,
        fieldValue: existing?.fieldValue ?? "",
      };
    })
  );

  const updateField = (index: number, value: string) => {
    setFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], fieldValue: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(fields);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.map((field, i) => (
          <DynamicField
            key={field.fieldName}
            fieldName={field.fieldName}
            fieldType={field.fieldType}
            value={field.fieldValue}
            onChange={(v) => updateField(i, v)}
            onImageClick={setPreviewImage}
          />
        ))}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </form>

      <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
    </>
  );
}
