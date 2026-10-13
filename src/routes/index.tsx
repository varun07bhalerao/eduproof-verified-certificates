import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduProof — Blockchain Certificate Verification" },
      { name: "description", content: "Secure Certificates. Simple Verification. Issue and verify certificates on the blockchain." },
      { property: "og:title", content: "EduProof — Blockchain Certificate Verification" },
      { property: "og:description", content: "Secure Certificates. Simple Verification." },
    ],
  }),
  component: () => <Layout><HomePage /></Layout>,
});
