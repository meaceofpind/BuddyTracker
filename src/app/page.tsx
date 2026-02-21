"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Pet } from "@/types";
import type { PetFormData } from "@/lib/validations";
import { PetCard } from "@/components/pet-card";
import { PetFormModal } from "@/components/pet-form-modal";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, PawPrint } from "lucide-react";
import { toast } from "sonner";

async function fetchPets(): Promise<Pet[]> {
  const res = await fetch("/api/pets");
  if (!res.ok) throw new Error("Failed to fetch pets");
  return res.json();
}

export default function Home() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletingPet, setDeletingPet] = useState<Pet | null>(null);

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ["pets"],
    queryFn: fetchPets,
  });

  const createMutation = useMutation({
    mutationFn: async (data: PetFormData) => {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create pet");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      setFormOpen(false);
      toast.success("Pet added successfully");
    },
    onError: () => toast.error("Failed to add pet"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ petId, data }: { petId: string; data: PetFormData }) => {
      const res = await fetch(`/api/pets/${petId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update pet");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      setEditingPet(null);
      toast.success("Pet updated successfully");
    },
    onError: () => toast.error("Failed to update pet"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (petId: string) => {
      const res = await fetch(`/api/pets/${petId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete pet");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      setDeletingPet(null);
      toast.success("Pet deleted successfully");
    },
    onError: () => toast.error("Failed to delete pet"),
  });

  const handleFormSubmit = (data: PetFormData) => {
    if (editingPet) {
      updateMutation.mutate({ petId: editingPet.petId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
  };

  const handleDelete = (pet: Pet) => {
    setDeletingPet(pet);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PawPrint className="h-8 w-8" />
            BuddyTracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your pets&apos; treatments and health records
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Pet
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border bg-muted"
            />
          ))}
        </div>
      ) : pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <PawPrint className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold">No pets yet</h2>
          <p className="text-muted-foreground mt-1 mb-4">
            Add your first pet to get started with tracking
          </p>
          <Button onClick={() => setFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Your First Pet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <PetCard
              key={pet.petId}
              pet={pet}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <PetFormModal
        open={formOpen || !!editingPet}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditingPet(null);
          }
        }}
        onSubmit={handleFormSubmit}
        pet={editingPet}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deletingPet}
        onOpenChange={(open) => {
          if (!open) setDeletingPet(null);
        }}
        onConfirm={() => {
          if (deletingPet) deleteMutation.mutate(deletingPet.petId);
        }}
        title="Delete Pet"
        description={`Are you sure you want to delete ${deletingPet?.name}? This will also delete all trackers and entries for this pet.`}
        isLoading={deleteMutation.isPending}
      />
    </main>
  );
}
