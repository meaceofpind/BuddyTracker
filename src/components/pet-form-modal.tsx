"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { petSchema, type PetFormData } from "@/lib/validations";
import type { Pet } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useEffect } from "react";

interface PetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PetFormData) => void;
  pet?: Pet | null;
  isLoading?: boolean;
}

const SPECIES_OPTIONS = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Reptile", "Other"];
const GENDER_OPTIONS = ["Male", "Female"];

export function PetFormModal({
  open,
  onOpenChange,
  onSubmit,
  pet,
  isLoading,
}: PetFormModalProps) {
  const isEditing = !!pet;

  const form = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      gender: "",
      age: 0,
      species: "",
      breed: "",
    },
  });

  useEffect(() => {
    if (pet) {
      form.reset({
        name: pet.name,
        gender: pet.gender,
        age: pet.age,
        species: pet.species,
        breed: pet.breed,
      });
    } else {
      form.reset({
        name: "",
        gender: "",
        age: 0,
        species: "",
        breed: "",
      });
    }
  }, [pet, form]);

  const handleSubmit = (data: PetFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Pet" : "Add New Pet"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter pet name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="species">Species</Label>
              <Select
                value={form.watch("species")}
                onValueChange={(value) => form.setValue("species", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIES_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.species && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.species.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                placeholder="Enter breed"
                {...form.register("breed")}
              />
              {form.formState.errors.breed && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.breed.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.watch("gender")}
                onValueChange={(value) => form.setValue("gender", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.gender.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                min={0}
                {...form.register("age")}
              />
              {form.formState.errors.age && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.age.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Pet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
