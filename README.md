# EduProof – Blockchain-Based Certificate Verification

*Secure Certificates. Simple Verification.* A college mini-project that shows how to:

1. Generate a SHA-256 hash of certificate details (browser Web Crypto API)
2. Register the hash in a Solidity smart contract
3. Read certificate records from the blockchain
4. Check validity (VALID / REVOKED / NOT FOUND)
5. Revoke a certificate with an owner-only transaction

## Project structure

```
contracts/EduProof.sol        Solidity smart contract
src/config/contract.ts        Contract ABI + optional default address
src/services/blockchain.ts    Ethers.js service (MetaMask, issue, verify, revoke)
src/utils/hash.ts             SHA-256 hashing with a fixed data format
src/types/                    TypeScript types
src/pages/                    Home, Issue, Verify pages
src/components/               Navbar/footer layout, setup panel, status messages
src/routes/                   URL routes that render the pages
```

## Hash format

Fields are trimmed and joined with `|` in this fixed order:
`certificateId|studentName|studentId|degree|branch|institution|graduationYear`
The SHA-256 of that string (32 bytes) is stored as `bytes32`.

## 1. Try the contract in Remix VM

1. Open https://remix.ethereum.org and create `EduProof.sol` with the contents of `contracts/EduProof.sol`.
2. **Solidity Compiler** tab → version 0.8.20+ → *Compile*.
3. **Deploy & Run** tab → Environment *Remix VM* → *Deploy*.
4. Expand the deployed contract and call `issueCertificate("CERT-1", 0x<64 hex chars>)`, then `getCertificate("CERT-1")` and `revokeCertificate("CERT-1")`.

Note: Remix VM runs only inside the Remix browser tab, so the web app cannot connect to it. To use the web app, deploy to a network MetaMask can reach (step 2).

## 2. Deploy for the web app (testnet, e.g. Sepolia)

1. Install MetaMask, switch to Sepolia, and get free test ETH from a Sepolia faucet.
2. In Remix **Deploy & Run**, choose Environment *Injected Provider – MetaMask*.
3. Click *Deploy* and confirm in MetaMask. The deploying account becomes the **owner** (authorized issuer).
4. Copy the deployed contract address.
5. In the app, open **Contract Setup**, paste the address, and click *Save* (or set `VITE_CONTRACT_ADDRESS=0x...` in a `.env` file).
   Optionally add a public RPC URL so verification works without MetaMask.

A local network (Hardhat/Ganache on `http://127.0.0.1:8545`) also works: add it to MetaMask and deploy with Injected Provider.

## 3. Use the app

- **Issue**: fill the form with the owner wallet connected → confirm in MetaMask → see Certificate ID, hash and transaction hash.
- **Verify**: enter the Certificate ID (optionally the hash) → VALID / REVOKED / NOT FOUND.
- **Revoke**: on the verify result, the owner can click *Revoke Certificate*.

Non-owner wallets are rejected by the contract (`onlyOwner`). The app never fakes a transaction — all results come from the chain.

## Run locally

```
bun install
bun run dev
```
