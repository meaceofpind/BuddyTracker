"use client";

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
import { MoreVertical, Pencil, Trash2, PawPrint } from "lucide-react";
import Link from "next/link";

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (pet: Pet) => void;
}

export function PetCard({ pet, onEdit, onDelete }: PetCardProps) {
  return (
    <Card className="group relative transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{pet.name}</CardTitle>
            <CardDescription>
              {pet.species} &middot; {pet.breed}
            </CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(pet)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(pet)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Gender:</span>{" "}
            {pet.gender}
          </div>
          <div>
            <span className="font-medium text-foreground">Age:</span> {pet.age}{" "}
            {pet.age === 1 ? "year" : "years"}
          </div>
        </div>
        <Link
          href={`/pets/${pet.petId}/trackers`}
          className="mt-4 inline-flex w-full"
        >
          <Button variant="outline" className="w-full">
            View Trackers
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
