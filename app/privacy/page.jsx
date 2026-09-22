import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Mova Store",
  description: "Privacy policy describing how Mova Store handles customer data and Stellar transactions.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-mova-ink text-white py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="text-purple-400 hover:underline text-sm inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-white/80 leading-relaxed">
          At Mova Store, we value your privacy and security. This Privacy Policy explains our data collection and protection practices.
        </p>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-300">1. Information Collection</h2>
          <p className="text-white/70 leading-relaxed text-sm">
            We only collect essential information required for order fulfillment and customer communications,
            such as contact email, delivery address, and public blockchain transaction identifiers.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-300">2. Blockchain Transparency</h2>
          <p className="text-white/70 leading-relaxed text-sm">
            Please note that payment transactions conducted on the Stellar ledger are public by nature.
            We do not store private keys, seed phrases, or sensitive wallet signing material.
          </p>
        </section>
      </div>
    </main>
export const metadata = {
  title: "Privacy Policy · Mova Store",
  description: "Privacy policy for the Mova Store storefront.",
};

const sections = [
  {
    heading: "1. What we collect",
    body: "Account information you provide when signing in (email address and, if you choose, a display name and avatar). Order information such as shipping address and contact details. Payment happens on the Stellar network via your own wallet (Freighter); we never see your wallet seed or private keys.",
  },
  {
    heading: "2. How we use your data",
    body: "To fulfill and track your orders, communicate with you about purchases and customer service requests, and improve the Store. We do not sell your personal data.",
  },
  {
    heading: "3. Wallet and on-chain data",
    body: "Checkouts settle in USDC on the Stellar network through the Soroban escrow contract. Your wallet address, order id and payment amount are recorded on-chain as part of the public ledger. Transaction hashes are shared with you for verification.",
  },
  {
    heading: "4. Cookies and local storage",
    body: "The Store uses your browser's local storage to keep your shopping cart between visits and to remember your authenticated session (managed by Supabase Auth). No third-party advertising trackers are used.",
  },
  {
    heading: "5. Sharing",
    body: "We share the minimum information required to deliver your order (carriers, payment/escrow infrastructure, hosting). We may disclose data when required by law.",
  },
  {
    heading: "6. Retention and security",
    body: "Order records are kept for accounting and support purposes. We use reasonable technical and organizational measures to protect your data, and session credentials are stored only as encrypted tokens by the auth provider.",
  },
  {
    heading: "7. Your rights",
    body: "Depending on where you live, you may have rights to access, correct or delete your personal data. To exercise any of these rights, contact us via the Customer Service page.",
  },
  {
    heading: "8. Changes",
    body: "We may update this policy from time to time. The latest version will always be published on this page.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-mova-surface text-slate-900">
      <div className="container mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-purple-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: September 8, 2026
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold text-purple-900">
                {s.heading}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
