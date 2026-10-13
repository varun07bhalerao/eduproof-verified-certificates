import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const link = "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary";
  const active = { className: "rounded-md px-3 py-2 text-sm font-semibold text-primary bg-accent" };
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <ShieldCheck className="h-6 w-6" /> EduProof
          </Link>
          <div className="flex gap-1">
            <Link to="/" className={link} activeProps={active} activeOptions={{ exact: true }}>Home</Link>
            <Link to="/issue" className={link} activeProps={active}>Issue</Link>
            <Link to="/verify" className={link} activeProps={active}>Verify</Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        EduProof — Blockchain Certificate Verification · College Mini-Project
      </footer>
    </div>
  );
}
