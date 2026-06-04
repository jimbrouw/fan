import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Kitface",
  description: "How Kitface uses account, photo, poster, payment, and notification data.",
};

const sections = [
  {
    title: "Last updated",
    body: ["June 4, 2026"],
  },
  {
    title: "Who we are",
    body: [
      "Kitface is a football poster app that helps you turn uploaded photos into official-style football media. This policy explains what we collect, how we use it, and the choices you have.",
    ],
  },
  {
    title: "Information we collect",
    body: [
      "We collect account information such as your email address when you sign in, photos and prompts you provide to create posters, generated poster outputs, checkout and order details when you buy a product, and basic technical information such as device, browser, and error logs.",
      "If you choose notification features, we may store notification preferences and delivery details so we can send creation, order, or product updates.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "We use your information to provide the app, generate and save posters, manage your account, process purchases, fulfil orders, send requested updates, troubleshoot problems, prevent abuse, and improve the product.",
      "Photos are used for poster creation and related product features. Do not upload photos unless you have permission to use them.",
    ],
  },
  {
    title: "Service providers",
    body: [
      "We use trusted providers to run Kitface, including authentication, hosting, database, image generation, payment, fulfilment, email, analytics, and error monitoring services. These providers process information only as needed to provide their services to us.",
      "Depending on the feature you use, providers may include Supabase, Google, Vercel, Stripe, image generation providers, and fulfilment partners.",
    ],
  },
  {
    title: "Sharing",
    body: [
      "We do not sell your personal information. We may share information with service providers, when required by law, to protect Kitface and its users, or as part of a business transfer such as a merger or acquisition.",
    ],
  },
  {
    title: "Retention",
    body: [
      "We keep information for as long as needed to provide Kitface, maintain records, resolve disputes, comply with legal obligations, and improve safety and reliability. You can ask us to delete account data, subject to legal or operational limits.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can choose not to upload photos, stop using notification features, or contact us to request access, correction, or deletion of your account information.",
      "If you sign in with Google, Google may also provide controls for managing the connection between your Google account and Kitface.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For privacy questions or requests, contact Kitface through the support channel shown in the app or email support@kitface.app.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="How Kitface handles the information used to create and manage your football posters."
      sections={sections}
    />
  );
}
