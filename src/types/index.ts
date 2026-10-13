export interface CertificateData {
  studentName: string;
  studentId: string;
  degree: string;
  branch: string;
  institution: string;
  graduationYear: string;
  certificateId: string;
}

export interface CertificateRecord {
  certHash: string; // 0x-prefixed bytes32
  exists: boolean;
  revoked: boolean;
  issuedAt: number; // unix seconds
}

export interface NetworkInfo {
  chainId: number;
  name: string;
}
