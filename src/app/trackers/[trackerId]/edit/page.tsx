"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { TrackerListWithOptions } from "@/types";
import type { TrackerFormData } from "@/lib/validations";
import { TrackerForm } from "@/components/tracker-form";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditTrackerPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: tracker, isLoading } = useQuery<TrackerListWithOptions & { pet: { petId: string; name: string } }>({
    queryKey: ["tracker", trackerId],
    queryFn: async () => {
      const res = await fetch(`/api/trackers/${trackerId}`);
      if (!res.ok) throw new Error("Failed to fetch tracker");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TrackerFormData) => {
      const res = await fetch(`/api/trackers/${trackerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update tracker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      queryClient.invalidateQueries({ queryKey: ["tracker", trackerId] });
      toast.success("Tracker updated successfully");
      if (tracker) router.push(`/pets/${tracker.petId}/trackers`);
    },
    onError: () => toast.error("Failed to update tracker"),
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </main>
    );
  }

  if (!tracker) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Tracker not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/pets/${tracker.petId}/trackers`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {tracker.pet?.name ? `${tracker.pet.name}'s Trackers` : "Trackers"}
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Tracker</h1>
      <p className="text-muted-foreground mb-8">
        Modify fields and settings for &ldquo;{tracker.name}&rdquo;
      </p>

      <TrackerForm
        petId={tracker.petId}
        defaultValues={{
          name: tracker.name,
          options: tracker.options.map((o) => ({
            fieldName: o.fieldName,
            fieldType: o.fieldType as "Text" | "Date" | "Decimal" | "Integer" | "Image",
          })),
        }}
        onSubmit={(data) => updateMutation.mutate(data)}
        isLoading={updateMutation.isPending}
        submitLabel="Save Changes"
      />
    </main>
  );
}
