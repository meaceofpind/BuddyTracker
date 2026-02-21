import { z } from "zod";

export const petSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.string().min(1, "Gender is required"),
  age: z.coerce.number().int().min(0, "Age must be 0 or greater"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
});

export type PetFormData = z.infer<typeof petSchema>;

export const formOptionSchema = z.object({
  fieldName: z.string().min(1, "Field name is required"),
  fieldType: z.enum(["Text", "Date", "Decimal", "Integer", "Image"]),
});

export const trackerSchema = z.object({
  name: z.string().min(1, "Tracker name is required"),
  petId: z.string().min(1, "Pet is required"),
  options: z.array(formOptionSchema).min(1, "At least one field is required"),
});

export type TrackerFormData = z.infer<typeof trackerSchema>;

export const entryDataSchema = z.object({
  fieldName: z.string(),
  fieldType: z.string(),
  fieldValue: z.string(),
});

export const entrySchema = z.object({
  trackerId: z.coerce.number().int(),
  petId: z.string(),
  data: z.array(entryDataSchema),
});

export type EntryFormData = z.infer<typeof entrySchema>;
