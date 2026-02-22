"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Pet } from "@/types";
import type { TrackerListWithOptions } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import {
  PlusCircle,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  ClipboardList,
  FileText,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useCallback } from "react";

const LONG_PRESS_MS = 500;

function TrackerCard({
  tracker,
  onDelete,
}: {
  tracker: TrackerListWithOptions;
  onDelete: (t: TrackerListWithOptions) => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const didLongPress = useRef(false);

  const handleTouchStart = useCallback(() => {
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setMenuOpen(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, LONG_PRESS_MS);
  }, []);

  const cancelLongPress = useCallback(() => {
    clearTimeout(longPressTimer.current);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (didLongPress.current) {
        didLongPress.current = false;
        e.preventDefault();
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest("[data-dropdown-trigger]") || target.closest("[role='menu']")) {
        return;
      }
      router.push(`/trackers/${tracker.id}/entries`);
    },
    [router, tracker.id]
  );

  return (
    <Card
      className="group transition-shadow hover:shadow-md cursor-pointer select-none touch-manipulation"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      role="article"
      aria-label={`${tracker.name} — ${tracker.options.length} field${tracker.options.length !== 1 ? "s" : ""}. Tap to view entries, long press for options.`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
            aria-hidden="true"
          >
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{tracker.name}</CardTitle>
            <CardDescription>
              {tracker.options.length} field{tracker.options.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </div>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              data-dropdown-trigger
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              aria-label={`Actions for ${tracker.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/trackers/${tracker.id}/edit`);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              Edit Tracker
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(tracker);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          {tracker.options.map((opt) => (
            <span
              key={opt.id}
              className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium"
            >
              {opt.fieldName}
              <span className="ml-1 text-muted-foreground">({opt.fieldType})</span>
            </span>
          ))}
        </div>
        <div className="flex items-center text-sm font-medium text-primary">
          View Entries
          <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrackersPage() {
  const { petId } = useParams<{ petId: string }>();
  const queryClient = useQueryClient();
  const [deletingTracker, setDeletingTracker] = useState<TrackerListWithOptions | null>(null);

  const { data: pet } = useQuery<Pet>({
    queryKey: ["pet", petId],
    queryFn: async () => {
      const res = await fetch(`/api/pets/${petId}`);
      if (!res.ok) throw new Error("Failed to fetch pet");
      return res.json();
    },
  });

  const { data: trackers = [], isLoading } = useQuery<TrackerListWithOptions[]>({
    queryKey: ["trackers", petId],
    queryFn: async () => {
      const res = await fetch(`/api/trackers?petId=${petId}`);
      if (!res.ok) throw new Error("Failed to fetch trackers");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (trackerId: number) => {
      const res = await fetch(`/api/trackers/${trackerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete tracker");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers", petId] });
      setDeletingTracker(null);
      toast.success("Tracker deleted successfully");
    },
    onError: () => toast.error("Failed to delete tracker"),
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
          Back to Pets
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {pet?.name ? `${pet.name}'s Trackers` : "Trackers"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage treatment and health trackers
          </p>
        </div>
        <Link href={`/pets/${petId}/trackers/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            New Tracker
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border bg-muted" />
          ))}
        </div>
      ) : trackers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
          <h2 className="text-xl font-semibold">No trackers yet</h2>
          <p className="text-muted-foreground mt-1 mb-4">
            Create a tracker to start logging entries for {pet?.name}
          </p>
          <Link href={`/pets/${petId}/trackers/new`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Create First Tracker
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {trackers.map((tracker) => (
            <TrackerCard
              key={tracker.id}
              tracker={tracker}
              onDelete={setDeletingTracker}
            />
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deletingTracker}
        onOpenChange={(open) => { if (!open) setDeletingTracker(null); }}
        onConfirm={() => { if (deletingTracker) deleteMutation.mutate(deletingTracker.id); }}
        title="Delete Tracker"
        description={`Are you sure you want to delete "${deletingTracker?.name}"? All entries will be permanently deleted.`}
        isLoading={deleteMutation.isPending}
      />
    </main>
  );
}
