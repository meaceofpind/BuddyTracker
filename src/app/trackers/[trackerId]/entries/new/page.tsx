"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { TrackerListWithOptions } from "@/types";
import { EntryForm } from "@/components/entry-form";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewEntryPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const router = useRouter();

  const { data: tracker, isLoading } = useQuery<TrackerListWithOptions & { pet: { petId: string; name: string } }>({
    queryKey: ["tracker", trackerId],
    queryFn: async () => {
      const res = await fetch(`/api/trackers/${trackerId}`);
      if (!res.ok) throw new Error("Failed to fetch tracker");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { fieldName: string; fieldType: string; fieldValue: string }[]) => {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackerId: parseInt(trackerId),
          petId: tracker!.petId,
          data,
        }),
      });
      if (!res.ok) throw new Error("Failed to create entry");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Entry created");
      router.push(`/trackers/${trackerId}/entries`);
    },
    onError: () => toast.error("Failed to create entry"),
  });

  if (isLoading || !tracker) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/trackers/${trackerId}/entries`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {tracker.name}
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">New Entry</h1>
      <p className="text-muted-foreground mb-8">
        Record a new entry for &ldquo;{tracker.name}&rdquo;
      </p>

      <EntryForm
        options={tracker.options}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </main>
  );
}
