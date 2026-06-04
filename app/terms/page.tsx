import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Kitface",
  description: "Terms for using Kitface to create football poster media.",
};

const sections = [
  {
    title: "Last updated",
    body: ["June 4, 2026"],
  },
  {
    title: "Using Kitface",
    body: [
      "Kitface lets you create football poster media from photos, team selections, and other inputs you provide. By using Kitface, you agree to these terms.",
      "You must use Kitface lawfully and must not use the app to create, upload, or distribute content that is illegal, harmful, abusive, misleading, infringing, or violates another person's privacy or rights.",
    ],
  },
  {
    title: "Your content",
    body: [
      "You are responsible for the photos, names, prompts, and other content you provide. You confirm that you have the rights and permissions needed to upload and use that content with Kitface.",
      "You allow Kitface and its service providers to process your content so we can provide the app, generate posters, save results, fulfil orders, troubleshoot issues, and improve safety and reliability.",
    ],
  },
  {
    title: "Generated posters",
    body: [
      "Generated outputs may vary and may not always be accurate, available, or suitable for every use. You are responsible for reviewing outputs before sharing, printing, or relying on them.",
      "Kitface is not affiliated with, endorsed by, or sponsored by any football club, league, kit manufacturer, or rights holder unless we say so explicitly.",
    ],
  },
  {
    title: "Purchases and fulfilment",
    body: [
      "If you buy a product through Kitface, checkout, payment, taxes, shipping, refunds, and fulfilment may be handled by third-party providers. Additional provider terms may apply.",
      "We may refuse, cancel, or refund an order where required by law, provider rules, product availability, safety checks, or suspected abuse.",
    ],
  },
  {
    title: "Accounts",
    body: [
      "You are responsible for keeping your account secure. If you believe your account has been used without permission, contact us promptly.",
    ],
  },
  {
    title: "Service changes",
    body: [
      "We may change, suspend, or stop parts of Kitface at any time. We may also update these terms. Continued use of Kitface after changes means you accept the updated terms.",
    ],
  },
  {
    title: "Disclaimers and limits",
    body: [
      "Kitface is provided as is and as available. To the maximum extent allowed by law, we disclaim warranties and are not liable for indirect, incidental, special, consequential, or punitive damages.",
      "Nothing in these terms limits rights that cannot be limited under applicable law.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For questions about these terms, contact Kitface through the support channel shown in the app or email support@kitface.app.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="The terms for using Kitface to create, save, share, and order football poster media."
      sections={sections}
    />
  );
}
