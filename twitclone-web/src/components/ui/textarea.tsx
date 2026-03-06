import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-2 border-border min-h-32 w-full min-w-0 rounded-none bg-background text-foreground px-4 py-3 text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
        "focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] dark:focus-visible:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.4)] focus-visible:-translate-y-0.5 focus-visible:translate-x-0.5",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
