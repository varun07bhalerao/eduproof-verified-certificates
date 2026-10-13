import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { VerifyPage } from "@/pages/VerifyPage";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify Certificate — EduProof" },
      { name: "description", content: "Check whether a certificate is valid, revoked or not found on the blockchain." },
      { property: "og:title", content: "Verify Certificate — EduProof" },
      { property: "og:description", content: "Public blockchain certificate verification." },
    ],
  }),
  component: () => <Layout><VerifyPage /></Layout>,
});
