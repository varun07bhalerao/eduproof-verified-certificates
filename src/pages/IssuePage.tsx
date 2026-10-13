import { useState, type FormEvent } from "react";
import { FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContractSetup } from "@/components/ContractSetup";
import { Field, StatusMessage } from "@/components/Status";
import { getContractAddress, issueCertificate, readableError } from "@/services/blockchain";
import { canonicalize, hashCertificate } from "@/utils/hash";
import type { CertificateData } from "@/types";

const empty: CertificateData = {
  studentName: "", studentId: "", degree: "", branch: "", institution: "", graduationYear: "", certificateId: "",
};

const fields: { key: keyof CertificateData; label: string; placeholder: string }[] = [
  { key: "studentName", label: "Student Name", placeholder: "Asha Rao" },
  { key: "studentId", label: "Student ID", placeholder: "S2026001" },
  { key: "degree", label: "Degree", placeholder: "B.Tech" },
  { key: "branch", label: "Branch", placeholder: "Computer Engineering" },
  { key: "institution", label: "Institution Name", placeholder: "ABC College of Engineering" },
  { key: "graduationYear", label: "Graduation Year", placeholder: "2026" },
  { key: "certificateId", label: "Certificate ID", placeholder: "CERT-2026-001" },
];

type Result = { certificateId: string; hash: string; txHash: string; blockNumber: number };

export function IssuePage() {
  const [form, setForm] = useState<CertificateData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof CertificateData, string>>>({});
  const [status, setStatus] = useState<{ kind: "loading" | "error"; text: string } | null>(null);
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const validate = () => {
    const e: typeof errors = {};
    fields.forEach((f) => { if (!form[f.key].trim()) e[f.key] = `${f.label} is required`; });
    if (form.graduationYear && !/^(19|20)\d{2}$/.test(form.graduationYear.trim())) e.graduationYear = "Enter a valid 4-digit year";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setResult(null);
    if (!validate()) return;
    try {
      setStatus({ kind: "loading", text: "Generating SHA-256 hash…" });
      const h = await hashCertificate(form);
      setHash(h);
      if (!getContractAddress()) {
        setStatus({ kind: "error", text: "Hash generated, but no contract is configured. Open Contract Setup, paste your deployed EduProof address, then submit again. Nothing was written to the blockchain." });
        return;
      }
      setStatus({ kind: "loading", text: "Please confirm the transaction in MetaMask, then wait for confirmation…" });
      const r = await issueCertificate(form.certificateId.trim(), h);
      setResult({ certificateId: form.certificateId.trim(), hash: h, ...r });
      setStatus(null);
    } catch (e) {
      setStatus({ kind: "error", text: readableError(e) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Issue Certificate</h1>
        <p className="text-sm text-muted-foreground">Only the smart contract owner (the institution's wallet) is authorized to issue certificates.</p>
      </div>
      <ContractSetup />
      <form onSubmit={submit} className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2" noValidate>
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input id={f.key} placeholder={f.placeholder} value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
            {errors[f.key] && <p className="text-xs text-destructive">{errors[f.key]}</p>}
          </div>
        ))}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={status?.kind === "loading"} className="w-full sm:w-auto">
            <FileCheck2 /> Generate Hash & Issue on Blockchain
          </Button>
        </div>
      </form>

      {status && <StatusMessage kind={status.kind}>{status.text}</StatusMessage>}

      {hash && !result && (
        <div className="space-y-2 rounded-xl border bg-card p-5">
          <Field label="Hashed data format" value={canonicalize(form)} />
          <Field label="SHA-256 hash" value={hash} />
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-success/40 bg-card p-5">
          <StatusMessage kind="success">Certificate registered on the blockchain (confirmed in block {result.blockNumber}).</StatusMessage>
          <Field label="Certificate ID" value={result.certificateId} />
          <Field label="SHA-256 hash" value={result.hash} />
          <Field label="Transaction hash" value={result.txHash} />
          <Button variant="outline" onClick={() => { setForm(empty); setResult(null); setHash(""); }}>Issue another</Button>
        </div>
      )}
    </div>
  );
}
