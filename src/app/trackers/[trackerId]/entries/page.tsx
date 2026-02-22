"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import type { TrackerListWithOptions, TrackerEntryWithData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { ImagePreviewModal } from "@/components/image-preview-modal";
import { PlusCircle, ArrowLeft, Pencil, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function EntriesPage() {
  const { trackerId } = useParams<{ trackerId: string }>();
  const queryClient = useQueryClient();
  const [deletingEntry, setDeletingEntry] = useState<TrackerEntryWithData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: tracker } = useQuery<TrackerListWithOptions & { pet: { petId: string; name: string } }>({
    queryKey: ["tracker", trackerId],
    queryFn: async () => {
      const res = await fetch(`/api/trackers/${trackerId}`);
      if (!res.ok) throw new Error("Failed to fetch tracker");
      return res.json();
    },
  });

  const { data: entries = [], isLoading } = useQuery<TrackerEntryWithData[]>({
    queryKey: ["entries", trackerId],
    queryFn: async () => {
      const res = await fetch(`/api/entries?trackerId=${trackerId}`);
      if (!res.ok) throw new Error("Failed to fetch entries");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const res = await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete entry");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", trackerId] });
      setDeletingEntry(null);
      toast.success("Entry deleted");
    },
    onError: () => toast.error("Failed to delete entry"),
  });

  const fieldOptions = tracker?.options ?? [];

  function getFieldValue(entry: TrackerEntryWithData, fieldName: string) {
    return entry.data.find((d) => d.fieldName === fieldName)?.fieldValue ?? "";
  }

  function renderCell(entry: TrackerEntryWithData, fieldName: string, fieldType: string) {
    const val = getFieldValue(entry, fieldName);
    if (!val) return <span className="text-muted-foreground">—</span>;

    if (fieldType === "Image") {
      return (
        <button
          type="button"
          className="relative h-10 w-10 cursor-pointer overflow-hidden rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setPreviewImage(val)}
          aria-label={`View ${fieldName} image`}
        >
          <Image src={val} alt={`${fieldName} thumbnail`} fill className="object-cover" />
        </button>
      );
    }

    if (fieldType === "Date") {
      try {
        return new Date(val).toLocaleDateString();
      } catch {
        return val;
      }
    }

    return <span className="max-w-[200px] truncate block">{val}</span>;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={tracker ? `/pets/${tracker.petId}/trackers` : "/"}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to {tracker?.pet?.name ? `${tracker.pet.name}'s Trackers` : "Trackers"}
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {tracker?.name ?? "Entries"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {entries.length} entr{entries.length === 1 ? "y" : "ies"} recorded
          </p>
        </div>
        <Link href={`/trackers/${trackerId}/entries/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded border bg-muted" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold">No entries yet</h2>
          <p className="text-muted-foreground mt-1 mb-4">
            Record your first entry for this tracker
          </p>
          <Link href={`/trackers/${trackerId}/entries/new`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add First Entry
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Date</TableHead>
                {fieldOptions.map((opt) => (
                  <TableHead key={opt.id}>{opt.fieldName}</TableHead>
                ))}
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </TableCell>
                  {fieldOptions.map((opt) => (
                    <TableCell key={opt.id}>
                      {renderCell(entry, opt.fieldName, opt.fieldType)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/trackers/${trackerId}/entries/${entry.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit entry">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingEntry(entry)}
                        aria-label="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deletingEntry}
        onOpenChange={(open) => { if (!open) setDeletingEntry(null); }}
        onConfirm={() => { if (deletingEntry) deleteMutation.mutate(deletingEntry.id); }}
        title="Delete Entry"
        description="Are you sure you want to delete this entry? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />

      <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
    </main>
  );
}
