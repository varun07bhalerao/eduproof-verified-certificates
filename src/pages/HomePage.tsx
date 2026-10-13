import { Link } from "@tanstack/react-router";
import { Blocks, FileCheck2, Hash, SearchCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Blocks, title: "Blockchain", text: "Certificate records are stored in a Solidity smart contract, so they cannot be secretly changed." },
  { icon: Hash, title: "Certificate Hashing", text: "Certificate details are turned into a SHA-256 fingerprint. Only the hash goes on-chain." },
  { icon: SearchCheck, title: "Verification", text: "Anyone can enter a Certificate ID to check if it is valid, revoked or not found." },
];

export function HomePage() {
  return (
    <div className="space-y-12">
      <section className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">EduProof</h1>
        <p className="mt-3 text-lg font-medium text-foreground">Secure Certificates. Simple Verification.</p>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          EduProof is a blockchain-based certificate verification system. An institution (the smart contract owner)
          registers a hash of each certificate on the blockchain, and employers or anyone else can verify it instantly.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/issue"><FileCheck2 /> Issue Certificate</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/verify"><SearchCheck /> Verify Certificate</Link></Button>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-5 shadow-sm">
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
