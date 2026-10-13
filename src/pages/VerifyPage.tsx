import { useState, type FormEvent } from "react";
import { Ban, CheckCircle2, HelpCircle, SearchCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractSetup } from "@/components/ContractSetup";
import { Field, StatusMessage } from "@/components/Status";
import { getCertificate, readableError, revokeCertificate } from "@/services/blockchain";
import type { CertificateRecord } from "@/types";

type Verdict = "VALID" | "REVOKED" | "NOT FOUND" | "HASH MISMATCH";

export function VerifyPage() {
  const [certId, setCertId] = useState("");
  const [expectedHash, setExpectedHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<CertificateRecord | null>(null);
  const [checkedId, setCheckedId] = useState("");
  const [revoking, setRevoking] = useState(false);
  const [revokeTx, setRevokeTx] = useState("");

  const lookup = async (id: string) => {
    setError(""); setRecord(null); setLoading(true);
    try {
      setRecord(await getCertificate(id));
      setCheckedId(id);
    } catch (e) {
      setError("Could not reach the blockchain: " + readableError(e));
    } finally {
      setLoading(false);
    }
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    setRevokeTx("");
    if (!certId.trim()) { setError("Please enter a Certificate ID."); return; }
    lookup(certId.trim());
  };

  const revoke = async () => {
    setRevoking(true); setError("");
    try {
      const r = await revokeCertificate(checkedId);
      setRevokeTx(r.txHash);
      await lookup(checkedId);
    } catch (e) {
      setError(readableError(e));
    } finally {
      setRevoking(false);
    }
  };

  let verdict: Verdict | null = null;
  if (record) {
    const exp = expectedHash.trim().toLowerCase();
    const normalized = exp && !exp.startsWith("0x") ? "0x" + exp : exp;
    if (!record.exists) verdict = "NOT FOUND";
    else if (record.revoked) verdict = "REVOKED";
    else if (normalized && normalized !== record.certHash.toLowerCase()) verdict = "HASH MISMATCH";
    else verdict = "VALID";
  }

  const badge: Record<Verdict, { cls: string; Icon: typeof CheckCircle2; text: string }> = {
    VALID: { cls: "bg-success text-success-foreground", Icon: CheckCircle2, text: "Certificate exists on the blockchain and has not been revoked." },
    REVOKED: { cls: "bg-destructive text-destructive-foreground", Icon: Ban, text: "This certificate was revoked by the issuer." },
    "NOT FOUND": { cls: "bg-muted text-foreground", Icon: HelpCircle, text: "No certificate with this ID is registered." },
    "HASH MISMATCH": { cls: "bg-destructive text-destructive-foreground", Icon: XCircle, text: "The hash you provided does not match the stored hash." },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Verify Certificate</h1>
        <p className="text-sm text-muted-foreground">Public verification — no login needed.</p>
      </div>
      <ContractSetup />
      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-card p-5">
        <div className="space-y-1">
          <Label htmlFor="cid">Certificate ID</Label>
          <Input id="cid" placeholder="CERT-2026-001" value={certId} onChange={(e) => setCertId(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="eh">Certificate hash to compare (optional)</Label>
          <Input id="eh" placeholder="0x… (from the issued certificate)" value={expectedHash} onChange={(e) => setExpectedHash(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading}><SearchCheck /> {loading ? "Verifying…" : "Verify"}</Button>
      </form>

      {loading && <StatusMessage kind="loading">Querying the smart contract…</StatusMessage>}
      {error && <StatusMessage kind="error">{error}</StatusMessage>}

      {record && verdict && (
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${badge[verdict].cls}`}>
              {(() => { const I = badge[verdict].Icon; return <I className="h-4 w-4" />; })()} {verdict}
            </span>
            <span className="text-sm text-muted-foreground">{badge[verdict].text}</span>
          </div>
          <Field label="Certificate ID" value={checkedId} />
          {record.exists && (
            <>
              <Field label="Stored hash" value={record.certHash} />
              <Field label="Issued at" value={new Date(record.issuedAt * 1000).toLocaleString()} />
              <Field label="Status" value={record.revoked ? "Revoked" : "Active"} />
            </>
          )}
          {revokeTx && <StatusMessage kind="success">Revoked. Transaction hash: <span className="font-mono">{revokeTx}</span></StatusMessage>}
          {record.exists && !record.revoked && (
            <div className="border-t pt-4">
              <p className="mb-2 text-xs text-muted-foreground">Contract owner only: revoking sends a blockchain transaction from MetaMask.</p>
              <Button variant="destructive" onClick={revoke} disabled={revoking}>
                <Ban /> {revoking ? "Waiting for confirmation…" : "Revoke Certificate"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
