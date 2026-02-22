import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </main>
  );
}
