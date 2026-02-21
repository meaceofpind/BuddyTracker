"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { TrackerEntryWithData, TrackerListWithOptions } from "@/types";
import { EntryForm } from "@/components/entry-form";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditEntryPage() {
  const { trackerId, entryId } = useParams<{ trackerId: string; entryId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: entry, isLoading: entryLoading } = useQuery<
    TrackerEntryWithData & { tracker: TrackerListWithOptions }
  >({
    queryKey: ["entry", entryId],
    queryFn: async () => {
      const res = await fetch(`/api/entries/${entryId}`);
      if (!res.ok) throw new Error("Failed to fetch entry");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { fieldName: string; fieldType: string; fieldValue: string }[]) => {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error("Failed to update entry");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", trackerId] });
      queryClient.invalidateQueries({ queryKey: ["entry", entryId] });
      toast.success("Entry updated");
      router.push(`/trackers/${trackerId}/entries`);
    },
    onError: () => toast.error("Failed to update entry"),
  });

  if (entryLoading || !entry) {
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
          Back to {entry.tracker?.name ?? "Entries"}
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Entry</h1>
      <p className="text-muted-foreground mb-8">
        Update values for this entry
      </p>

      <EntryForm
        options={entry.tracker.options}
        defaultValues={entry.data.map((d) => ({
          fieldName: d.fieldName,
          fieldType: d.fieldType,
          fieldValue: d.fieldValue,
        }))}
        onSubmit={(data) => updateMutation.mutate(data)}
        isLoading={updateMutation.isPending}
        submitLabel="Save Changes"
      />
    </main>
  );
}
