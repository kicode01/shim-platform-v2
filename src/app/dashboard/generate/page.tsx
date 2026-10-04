import type { Metadata } from "next";
import GenerateClient from "./GenerateClient";

export const metadata: Metadata = {
  title: "Issue Credential",
  description: "Generate single or bulk certificates for your events.",
};


import { Suspense } from "react";

export default function GenerateCertificatesPage() {
  return (
    <div className="dashboard-bg" style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <main className="page-container-wide animate-fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, paddingBottom: "2rem", paddingTop: "2rem" }}>
        <Suspense fallback={<div className="h-full flex items-center justify-center text-zinc-500">Loading...</div>}>
          <GenerateClient />
        </Suspense>
      </main>
    </div>
  );
}
