"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Pet } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, PawPrint, ChevronRight } from "lucide-react";

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
}

const LONG_PRESS_MS = 500;

export function PetCard({ pet, onEdit, onDelete }: PetCardProps) {
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
      router.push(`/pets/${pet.petId}/trackers`);
    },
    [router, pet.petId]
  );

  return (
    <Card
      className="group relative transition-shadow hover:shadow-lg cursor-pointer select-none touch-manipulation"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      role="article"
      aria-label={`${pet.name} — ${pet.species}, ${pet.breed}. Tap to view trackers, long press for options.`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
            aria-hidden="true"
          >
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{pet.name}</CardTitle>
            <CardDescription>
              {pet.species} &middot; {pet.breed}
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
              aria-label={`Actions for ${pet.name}`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(pet);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(pet);
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
        <dl className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>
            <dt className="inline font-medium text-foreground">Gender:</dt>{" "}
            <dd className="inline">{pet.gender}</dd>
          </div>
          <div>
            <dt className="inline font-medium text-foreground">Age:</dt>{" "}
            <dd className="inline">
              {pet.age} {pet.age === 1 ? "year" : "years"}
            </dd>
          </div>
        </dl>
        <div className="mt-3 flex items-center text-sm font-medium text-primary">
          View Trackers
          <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
