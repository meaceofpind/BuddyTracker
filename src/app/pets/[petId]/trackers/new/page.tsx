"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Pet } from "@/types";
import type { TrackerFormData } from "@/lib/validations";
import { TrackerForm } from "@/components/tracker-form";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewTrackerPage() {
  const { petId } = useParams<{ petId: string }>();
  const router = useRouter();

  const { data: pet } = useQuery<Pet>({
    queryKey: ["pet", petId],
    queryFn: async () => {
      const res = await fetch(`/api/pets/${petId}`);
      if (!res.ok) throw new Error("Failed to fetch pet");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TrackerFormData) => {
      const res = await fetch("/api/trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create tracker");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Tracker created successfully");
      router.push(`/pets/${petId}/trackers`);
    },
    onError: () => toast.error("Failed to create tracker"),
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/pets/${petId}/trackers`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {pet?.name ? `${pet.name}'s Trackers` : "Trackers"}
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">New Tracker</h1>
      <p className="text-muted-foreground mb-8">
        Define the fields you want to track for {pet?.name ?? "your pet"}
      </p>

      <TrackerForm
        petId={petId}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </main>
  );
}
