import { BrowserProvider, Contract, JsonRpcProvider, isAddress, type Provider } from "ethers";
import { DEFAULT_CONTRACT_ADDRESS, EDUPROOF_ABI } from "@/config/contract";
import type { CertificateRecord, NetworkInfo } from "@/types";

// MetaMask injects window.ethereum
declare global {
  interface Window {
    ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
}

const ADDRESS_KEY = "eduproof.contractAddress";
const RPC_KEY = "eduproof.rpcUrl";

// ---------- Configuration (saved in the browser) ----------
export function getContractAddress(): string {
  if (typeof window === "undefined") return DEFAULT_CONTRACT_ADDRESS;
  return localStorage.getItem(ADDRESS_KEY) || DEFAULT_CONTRACT_ADDRESS;
}
export function getRpcUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(RPC_KEY) || "";
}
export function saveConfig(address: string, rpcUrl: string) {
  localStorage.setItem(ADDRESS_KEY, address.trim());
  localStorage.setItem(RPC_KEY, rpcUrl.trim());
}

export function hasMetaMask(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

function requireAddress(): string {
  const address = getContractAddress();
  if (!address) throw new Error("No contract address configured. Open Contract Setup and paste your deployed EduProof address.");
  if (!isAddress(address)) throw new Error("The configured contract address is not a valid Ethereum address.");
  return address;
}

// ---------- Wallet ----------
export async function connectWallet(): Promise<{ account: string; network: NetworkInfo }> {
  if (!hasMetaMask()) throw new Error("MetaMask is not installed. Install the MetaMask browser extension to continue.");
  const provider = new BrowserProvider(window.ethereum!);
  const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
  const net = await provider.getNetwork();
  return { account: accounts[0], network: { chainId: Number(net.chainId), name: net.name } };
}

/** Read-only provider: custom RPC URL if set, otherwise MetaMask. */
async function getReadProvider(): Promise<Provider> {
  const rpc = getRpcUrl();
  if (rpc) return new JsonRpcProvider(rpc);
  if (hasMetaMask()) return new BrowserProvider(window.ethereum!);
  throw new Error("No blockchain connection available. Install MetaMask or set an RPC URL in Contract Setup.");
}

async function ensureContractDeployed(provider: Provider, address: string) {
  const code = await provider.getCode(address);
  if (code === "0x") {
    const net = await provider.getNetwork();
    throw new Error(`No contract found at ${address} on network "${net.name}" (chain ${net.chainId}). Check the address and that MetaMask is on the right network.`);
  }
}

async function getWriteContract() {
  const address = requireAddress();
  if (!hasMetaMask()) throw new Error("MetaMask is required to send transactions.");
  const provider = new BrowserProvider(window.ethereum!);
  await provider.send("eth_requestAccounts", []);
  await ensureContractDeployed(provider, address);
  const signer = await provider.getSigner();
  const contract = new Contract(address, EDUPROOF_ABI, signer);
  const owner: string = await contract.owner();
  const me = await signer.getAddress();
  if (owner.toLowerCase() !== me.toLowerCase()) {
    throw new Error(`Connected wallet ${me} is not the contract owner (${owner}). Only the owner can issue or revoke certificates.`);
  }
  return contract;
}

/** Turns ethers/MetaMask errors into readable messages. */
export function readableError(err: unknown): string {
  const e = err as { code?: string | number; shortMessage?: string; reason?: string; message?: string };
  if (e?.code === "ACTION_REJECTED" || e?.code === 4001) return "Transaction was rejected in MetaMask.";
  return e?.reason || e?.shortMessage || e?.message || "Unknown error";
}

// ---------- Contract calls ----------
export async function issueCertificate(certificateId: string, certHash: string) {
  const contract = await getWriteContract();
  const existing = await contract.getCertificate(certificateId);
  if (existing.exists) throw new Error(`Certificate ID "${certificateId}" is already registered.`);
  const tx = await contract.issueCertificate(certificateId, certHash);
  const receipt = await tx.wait(); // wait for confirmation
  return { txHash: tx.hash as string, blockNumber: receipt?.blockNumber as number };
}

export async function revokeCertificate(certificateId: string) {
  const contract = await getWriteContract();
  const tx = await contract.revokeCertificate(certificateId);
  const receipt = await tx.wait();
  return { txHash: tx.hash as string, blockNumber: receipt?.blockNumber as number };
}

export async function getCertificate(certificateId: string): Promise<CertificateRecord> {
  const address = requireAddress();
  const provider = await getReadProvider();
  await ensureContractDeployed(provider, address);
  const contract = new Contract(address, EDUPROOF_ABI, provider);
  const r = await contract.getCertificate(certificateId);
  return { certHash: r.certHash, exists: r.exists, revoked: r.revoked, issuedAt: Number(r.issuedAt) };
}
