// ABI of contracts/EduProof.sol (human-readable format for ethers.js).
// If you change the contract, update these lines to match.
export const EDUPROOF_ABI = [
  "function owner() view returns (address)",
  "function issueCertificate(string certificateId, bytes32 certHash)",
  "function revokeCertificate(string certificateId)",
  "function getCertificate(string certificateId) view returns (bytes32 certHash, bool exists, bool revoked, uint256 issuedAt)",
  "event CertificateIssued(string certificateId, bytes32 certHash, uint256 issuedAt)",
  "event CertificateRevoked(string certificateId, uint256 revokedAt)",
];

// Optional default address from .env (VITE_CONTRACT_ADDRESS=0x...).
// You can also paste the address in the app's "Contract Setup" panel.
export const DEFAULT_CONTRACT_ADDRESS: string = import.meta.env["VITE_CONTRACT_ADDRESS"] ?? "";
