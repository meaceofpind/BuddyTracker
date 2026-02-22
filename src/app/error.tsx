"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center" role="alert">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </main>
  );
}
