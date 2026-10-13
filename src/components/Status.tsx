import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type Kind = "loading" | "success" | "error";

export function StatusMessage({ kind, children }: { kind: Kind; children: ReactNode }) {
  const styles: Record<Kind, string> = {
    loading: "border-primary/30 bg-accent text-primary",
    success: "border-success/40 bg-success/10 text-success",
    error: "border-destructive/40 bg-destructive/10 text-destructive",
  };
  const Icon = kind === "loading" ? Loader2 : kind === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${styles[kind]}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${kind === "loading" ? "animate-spin" : ""}`} />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="break-all font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}
