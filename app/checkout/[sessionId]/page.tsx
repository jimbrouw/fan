import { notFound } from "next/navigation";
import { CheckoutClient } from "./CheckoutClient";

export default async function CheckoutPage({ params }: { params: Promise<{ sessionId: string }> }) {
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  const resolvedParams = await params;
  
  if (!resolvedParams.sessionId.startsWith("mock_sess_")) {
    notFound();
  }

  return <CheckoutClient sessionId={resolvedParams.sessionId} />;
}
