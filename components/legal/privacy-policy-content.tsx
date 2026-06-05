import type { ReactNode } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"

const SUPPORT_EMAIL = "dressappsupport@gmail.com"

export function PrivacyPolicyContent() {
  return (
    <article className="space-y-10 text-base leading-relaxed [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-foreground">
      <section className="space-y-4">
        <h2>Introduction</h2>
        <p>
          Our commitment to privacy and data protection is reflected in this Privacy Policy. It
          explains how <strong>DressApp</strong> (“we,” “us,” or “our”) handles information that
          identifies you or your business-such as contact details, store identifiers, try-on photos,
          and measurements-as well as other data we process to run our services.
        </p>
        <p>
          DressApp provides AI-powered virtual try-on for Shopify: shoppers can build a digital body
          model and preview how products may look on them. By installing our app, using the merchant
          admin, or using try-on on a participating storefront, you agree to this policy. If you do
          not agree, please do not install the app or use try-on features.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Scope of this policy</h2>
        <p>
          This policy applies to our website, Shopify app, storefront widget, and related DressApp
          services. It covers how we collect, use, share, and protect information for:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Merchants</strong> who install DressApp from the Shopify App Store (store owners
            and staff).
          </li>
          <li>
            <strong>Shoppers</strong> who use virtual try-on on a merchant’s Shopify storefront.
          </li>
        </ul>
        <p>
          It does not cover third-party websites, themes, or apps outside DressApp. Shopify’s own
          practices are governed by{" "}
          <Link href="https://www.shopify.com/legal/privacy" target="_blank" rel="noopener noreferrer">
            Shopify’s Privacy Policy
          </Link>
          .
        </p>

        <PolicyTable
          headers={["Audience", "Our role", "What we process"]}
          rows={[
            [
              <strong key="m">Merchants</strong>,
              "We process store and account data to deliver the app, billing, and support.",
              "Shop domain, API tokens, catalog sync, subscription usage, merchant contact details.",
            ],
            [
              <strong key="s">Shoppers</strong>,
              "We process data on behalf of the merchant to deliver try-on. Merchants are responsible for storefront notices and lawful bases for shopper data.",
              "Photos, measurements, try-on outputs, session IDs, optional feedback.",
            ],
          ]}
        />

        <p className="text-sm">
          <strong>Service provider:</strong> DressApp ·{" "}
          <Link href="https://dressapp-preview.com" target="_blank" rel="noopener noreferrer">
            dressapp-preview.com
          </Link>
        </p>
      </section>

      <section className="space-y-4">
        <h2>Information collection</h2>
        <p>
          We collect information directly from merchants and shoppers, automatically through use of
          our services, and from trusted partners-only as needed to operate virtual try-on within
          Shopify’s platform rules. We do <strong>not</strong> sell personal information.
        </p>

        <h3>Direct collection</h3>
        <p>
          <strong>From merchants</strong> (app install and admin): store domain and configuration;
          OAuth tokens to call Shopify on your behalf; product and catalog data (images, variants,
          sizes, metaobjects where used); contact email, plan status, usage metrics, widget
          settings; billing via <strong>Shopify billing APIs</strong> (we do not store full card
          numbers). We do not request scopes for staff passwords or full payment instruments.
        </p>
        <p>
          <strong>From shoppers</strong> (storefront widget): session references (e.g. via Shopify app
          proxy); photos and measurements for digital models; try-on activity (products viewed,
          generated images, feedback); optional data in browser <strong>session storage</strong> for
          short-lived UI state. We do not intentionally collect shopper emails through granted Shopify
          API scopes.
        </p>

        <h3>Automatic collection</h3>
        <p>Our services may automatically collect:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Device and browser information</li>
          <li>IP address, timestamps, and technical logs for security and operations</li>
          <li>Usage data such as try-on counts and feature interactions</li>
        </ul>

        <h3>Third-party and AI processing</h3>
        <p>
          We use subprocessors to host data and run try-on (e.g. cloud storage,{" "}
          <strong>Google Gemini</strong> and other AI providers). Photos and measurements are sent
          only to perform the service you request, under our agreements. We may receive limited
          information from Shopify and infrastructure partners as part of normal app operation.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Use of information</h2>
        <p>We use information to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Install, authenticate, and operate the app with your Shopify store</li>
          <li>Sync catalog data and deliver virtual try-on on product pages</li>
          <li>Create body models, generate try-on images, and save shopper preferences</li>
          <li>Enforce plan limits, metering, and abuse prevention</li>
          <li>Provide dashboards, usage reporting, and customer support</li>
          <li>Improve quality, safety, and reliability of our models</li>
          <li>Comply with law and enforce our terms</li>
        </ul>
        <p>
          We do not use shopper photos or measurements for third-party advertising profiles.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Information sharing</h2>
        <p>We share information only when necessary:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>With your direction or consent</strong> where applicable
          </li>
          <li>
            <strong>Service providers</strong> (Shopify, cloud hosting, AI APIs) who assist delivery
            under confidentiality and data-processing terms
          </li>
          <li>
            <strong>Legal and safety</strong> when required by law, to protect rights, or during
            corporate transactions where permitted
          </li>
        </ul>
        <PolicyTable
          headers={["Recipient", "Purpose"]}
          rows={[
            [<strong key="shopify">Shopify</strong>, "Installation, billing, app proxy, platform APIs"],
            [
              <strong key="cloud">Cloud infrastructure</strong>,
              "Hosting, databases, file storage (e.g. AWS S3 when configured)",
            ],
            [
              <strong key="ai">AI providers</strong>,
              "Image generation and validation (e.g. Google Gemini, Replicate where enabled)",
            ],
            [<strong key="auth">Authorities</strong>, "Legal requests and safety"],
          ]}
        />
        <p>
          We may share <strong>aggregated or de-identified</strong> statistics that do not identify
          individuals. Merchants generally do <strong>not</strong> receive shoppers’ original upload
          photos unless a feature explicitly enables that.
        </p>
      </section>

      <section className="space-y-4">
        <h2>International transfers</h2>
        <p>
          DressApp may operate from <strong>Israel</strong> and use providers in the{" "}
          <strong>United States</strong>, <strong>European Union</strong>, and other regions. Where
          required, we use appropriate safeguards (such as standard contractual clauses) for
          cross-border transfers.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Data protection</h2>
        <p>
          We use administrative, technical, and organizational measures appropriate to the risk-
          including HTTPS, access controls, and secured credentials. No method of transmission or
          storage is completely secure; protect your Shopify admin access and use strong passwords.
        </p>
        <p>
          If we become aware of a data breach that affects your personal information, we will notify
          affected users and merchants as required by law so you can take protective steps.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Data retention</h2>
        <p>
          We retain information only as long as needed for the purposes above, unless law requires
          longer:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Merchant and billing records:</strong> For the subscription term and a reasonable
            period after for accounting and disputes
          </li>
          <li>
            <strong>Shopper models and try-ons:</strong> Until deletion request, uninstall, or
            automated cleanup, subject to backups
          </li>
          <li>
            <strong>Upload photos:</strong> Removed from active storage after model creation where
            configured; restricted copies may remain for quality review if enabled
          </li>
          <li>
            <strong>Logs:</strong> Typically months unless needed for security incidents
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Your rights</h2>
        <h3>General rights</h3>
        <p>
          Depending on your location, you may have the right to <strong>access</strong>,{" "}
          <strong>correct</strong>, <strong>delete</strong>, <strong>restrict</strong>,{" "}
          <strong>object to</strong>, or <strong>port</strong> your data, and to{" "}
          <strong>withdraw consent</strong> where processing is consent-based. We may verify your
          identity before fulfilling requests.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Merchants:</strong> Contact us using the email below. Uninstalling the app
            starts shop data handling described under Shopify requirements.
          </li>
          <li>
            <strong>Shoppers:</strong> Contact the merchant whose store you used first; we will
            assist them or respond where we are the controller.
          </li>
        </ul>

        <h3>Region-specific rights</h3>
        <p>
          <strong>EEA, UK, and Switzerland:</strong> Where GDPR applies, we rely on contract,
          legitimate interests, consent (e.g. for body photos on storefronts), and legal obligation.
          You may lodge a complaint with your supervisory authority.
        </p>
        <p>
          <strong>California (CCPA/CPRA):</strong> We do not sell personal information. You may
          request access, deletion, and correction as applicable.
        </p>
        <p>
          <strong>Israel:</strong> You may have rights to review and correct personal data under
          applicable law.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Shopify app requirements</h2>
        <p>
          As a Shopify App Store app, we implement mandatory compliance webhooks (
          <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
            customers/data_request
          </code>
          ,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
            customers/redact
          </code>
          ,{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">shop/redact</code>)
          per{" "}
          <Link
            href="https://shopify.dev/docs/apps/build/privacy-law-compliance"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shopify’s privacy compliance guidance
          </Link>
          .
        </p>
        <p>
          When you uninstall the app, we revoke tokens and delete shop configuration and linked
          shopper data, except where retention is required for law, security, or backups. The
          storefront may use Shopify’s{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">
            logged_in_customer_id
          </code>{" "}
          only to maintain a consistent try-on session-not to access customer records beyond granted
          scopes.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Children</h2>
        <p>
          Our services are not directed at children under 16 (or the age required in your
          jurisdiction). We do not knowingly collect children’s personal data. Contact us if you
          believe we have.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Cookies and tracking</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Merchant admin:</strong> Shopify and our embedded UI may use cookies for
            authentication and sessions.
          </li>
          <li>
            <strong>Storefront widget:</strong> Primarily API calls and optional session storage-we
            do not run third-party ad trackers in the widget. Other apps or themes may set their own
            cookies.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted here with an
          updated date. Material changes may be communicated via the app or email where appropriate.
          Continued use after changes constitutes acceptance where permitted by law.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Contact us</h2>
        <p>
          If you have questions about this Privacy Policy or need to exercise your rights, reach out
          to us-we’re happy to help merchants and shoppers.
        </p>
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Privacy & data requests</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Subject line: <span className="text-foreground">Privacy - DressApp</span>
              </p>
            </div>
            <Link
              href={`mailto:${SUPPORT_EMAIL}?subject=Privacy%20%E2%80%94%20DressApp`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-foreground no-underline transition-opacity hover:opacity-90"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {SUPPORT_EMAIL}
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}

function PolicyTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: ReactNode[][]
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold text-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-top text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
