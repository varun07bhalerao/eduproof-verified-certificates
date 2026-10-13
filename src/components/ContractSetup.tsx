import { useEffect, useState } from "react";
import { Settings, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  connectWallet, getContractAddress, getRpcUrl, hasMetaMask, readableError, saveConfig,
} from "@/services/blockchain";
import { StatusMessage } from "./Status";

/** Panel to configure the contract address and connect MetaMask. */
export function ContractSetup({ onChange }: { onChange?: () => void }) {
  const [address, setAddress] = useState("");
  const [rpc, setRpc] = useState("");
  const [open, setOpen] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [metamask, setMetamask] = useState(true);

  useEffect(() => {
    setAddress(getContractAddress());
    setRpc(getRpcUrl());
    setMetamask(hasMetaMask());
    if (!getContractAddress()) setOpen(true);
  }, []);

  const save = () => {
    saveConfig(address, rpc);
    setMsg({ kind: "success", text: "Configuration saved in this browser." });
    onChange?.();
  };

  const connect = async () => {
    try {
      const r = await connectWallet();
      setWallet(r.account);
      setNetwork(`${r.network.name} (chain ${r.network.chainId})`);
      setMsg(null);
    } catch (e) {
      setMsg({ kind: "error", text: readableError(e) });
    }
  };

  const configured = !!address;

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <div className="font-semibold text-foreground">Blockchain connection</div>
          <div className="text-muted-foreground">
            {wallet ? <>Wallet <span className="font-mono">{wallet.slice(0, 6)}…{wallet.slice(-4)}</span> · {network}</> : "Wallet not connected"}
            {" · "}
            {configured ? "Contract configured" : <span className="text-destructive">No contract configured</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
            <Settings /> Contract Setup
          </Button>
          <Button size="sm" onClick={connect}><Wallet /> {wallet ? "Reconnect" : "Connect MetaMask"}</Button>
        </div>
      </div>

      {!metamask && (
        <div className="mt-3"><StatusMessage kind="error">MetaMask was not detected. Install the MetaMask extension to issue certificates.</StatusMessage></div>
      )}

      {open && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Deploy <code>contracts/EduProof.sol</code> using Remix (see README), then paste the deployed contract address here.
            Make sure MetaMask is on the same network.
          </p>
          <div className="space-y-1">
            <Label htmlFor="addr">Contract address</Label>
            <Input id="addr" placeholder="0x…" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rpc">RPC URL (optional, for read-only verification without MetaMask)</Label>
            <Input id="rpc" placeholder="https://… (e.g. a public Sepolia RPC)" value={rpc} onChange={(e) => setRpc(e.target.value)} />
          </div>
          <Button size="sm" onClick={save}>Save configuration</Button>
        </div>
      )}
      {msg && <div className="mt-3"><StatusMessage kind={msg.kind}>{msg.text}</StatusMessage></div>}
    </div>
  );
}
