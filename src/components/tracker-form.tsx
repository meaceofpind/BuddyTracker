"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trackerSchema, type TrackerFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import type { FieldType } from "@/types";

const FIELD_TYPES: FieldType[] = ["Text", "Date", "Decimal", "Integer", "Image"];

interface TrackerFormProps {
  defaultValues?: Partial<TrackerFormData>;
  petId: string;
  onSubmit: (data: TrackerFormData) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function TrackerForm({
  defaultValues,
  petId,
  onSubmit,
  isLoading,
  submitLabel = "Create Tracker",
}: TrackerFormProps) {
  const form = useForm<TrackerFormData>({
    resolver: zodResolver(trackerSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      petId,
      options: defaultValues?.options ?? [{ fieldName: "", fieldType: "Text" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Tracker Name</Label>
        <Input
          id="name"
          placeholder="e.g. Medication Log, Weight Tracker"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Fields</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ fieldName: "", fieldType: "Text" })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>

        {form.formState.errors.options?.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.options.root.message}
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start gap-3 rounded-lg border p-3 bg-muted/30"
            >
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Field name"
                  {...form.register(`options.${index}.fieldName`)}
                />
                {form.formState.errors.options?.[index]?.fieldName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.options[index].fieldName?.message}
                  </p>
                )}
              </div>

              <div className="w-36">
                <Select
                  value={form.watch(`options.${index}.fieldType`)}
                  onValueChange={(value) =>
                    form.setValue(`options.${index}.fieldType` as const, value as FieldType, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
