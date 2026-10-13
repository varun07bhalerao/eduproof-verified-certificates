// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title EduProof - Blockchain-Based Certificate Verification
/// @notice Stores a SHA-256 hash for each certificate ID.
///         Only the contract owner (the institution) can issue or revoke.
///         Anyone can read certificate records.
contract EduProof {
    // One record per certificate
    struct Certificate {
        bytes32 certHash; // SHA-256 hash of the certificate data
        bool exists;      // true once issued
        bool revoked;     // true if the owner revoked it
        uint256 issuedAt; // block timestamp of issuance
    }

    // The account that deployed the contract = authorized issuer
    address public owner;

    // Certificate ID (e.g. "CERT-2026-001") => record
    mapping(string => Certificate) private certificates;

    event CertificateIssued(string certificateId, bytes32 certHash, uint256 issuedAt);
    event CertificateRevoked(string certificateId, uint256 revokedAt);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can do this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Register a new certificate hash (owner only)
    function issueCertificate(string memory certificateId, bytes32 certHash) public onlyOwner {
        require(bytes(certificateId).length > 0, "Certificate ID is required");
        require(certHash != bytes32(0), "Hash is required");
        require(!certificates[certificateId].exists, "Certificate ID already exists");

        certificates[certificateId] = Certificate(certHash, true, false, block.timestamp);
        emit CertificateIssued(certificateId, certHash, block.timestamp);
    }

    /// @notice Revoke an existing certificate (owner only)
    function revokeCertificate(string memory certificateId) public onlyOwner {
        require(certificates[certificateId].exists, "Certificate not found");
        require(!certificates[certificateId].revoked, "Already revoked");

        certificates[certificateId].revoked = true;
        emit CertificateRevoked(certificateId, block.timestamp);
    }

    /// @notice Read a certificate record (anyone)
    function getCertificate(string memory certificateId)
        public
        view
        returns (bytes32 certHash, bool exists, bool revoked, uint256 issuedAt)
    {
        Certificate memory c = certificates[certificateId];
        return (c.certHash, c.exists, c.revoked, c.issuedAt);
    }
}
