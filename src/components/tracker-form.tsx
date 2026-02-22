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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-label="Tracker form">
      <div className="space-y-2">
        <Label htmlFor="tracker-name">Tracker Name</Label>
        <Input
          id="tracker-name"
          placeholder="e.g. Medication Log, Weight Tracker"
          {...form.register("name")}
          aria-invalid={!!form.formState.errors.name}
          aria-describedby={form.formState.errors.name ? "tracker-name-error" : undefined}
        />
        {form.formState.errors.name && (
          <p id="tracker-name-error" role="alert" className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <fieldset className="space-y-4">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-medium">Fields</legend>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ fieldName: "", fieldType: "Text" })}
          >
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Field
          </Button>
        </div>

        {form.formState.errors.options?.root && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.options.root.message}
          </p>
        )}

        <div className="space-y-3" role="list" aria-label="Tracker fields">
          {fields.map((field, index) => (
            <div
              key={field.id}
              role="listitem"
              className="flex items-start gap-3 rounded-lg border p-3 bg-muted/30"
            >
              <div className="flex-1 space-y-1">
                <Label htmlFor={`field-name-${index}`} className="sr-only">
                  Field {index + 1} name
                </Label>
                <Input
                  id={`field-name-${index}`}
                  placeholder="Field name"
                  aria-invalid={!!form.formState.errors.options?.[index]?.fieldName}
                  {...form.register(`options.${index}.fieldName`)}
                />
                {form.formState.errors.options?.[index]?.fieldName && (
                  <p role="alert" className="text-xs text-destructive">
                    {form.formState.errors.options[index].fieldName?.message}
                  </p>
                )}
              </div>

              <div className="w-36">
                <Label htmlFor={`field-type-${index}`} className="sr-only">
                  Field {index + 1} type
                </Label>
                <Select
                  value={form.watch(`options.${index}.fieldType`)}
                  onValueChange={(value) =>
                    form.setValue(`options.${index}.fieldType` as const, value as FieldType, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id={`field-type-${index}`} aria-label={`Type for field ${index + 1}`}>
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
                aria-label={`Remove field ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </fieldset>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
