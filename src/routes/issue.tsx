import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { IssuePage } from "@/pages/IssuePage";

export const Route = createFileRoute("/issue")({
  head: () => ({
    meta: [
      { title: "Issue Certificate — EduProof" },
      { name: "description", content: "Hash a certificate with SHA-256 and register it on the EduProof smart contract." },
      { property: "og:title", content: "Issue Certificate — EduProof" },
      { property: "og:description", content: "Register certificate hashes on the blockchain." },
    ],
  }),
  component: () => <Layout><IssuePage /></Layout>,
});
