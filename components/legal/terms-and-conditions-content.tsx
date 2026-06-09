import Link from "next/link"
import { Mail } from "lucide-react"
import { SUPPORT_EMAIL } from "@/lib/site-contact"

export function TermsAndConditionsContent() {
  return (
    <article className="space-y-10 text-base leading-relaxed [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-foreground">
      <section className="space-y-4">
        <h2>Agreement to these terms</h2>
        <p>
          These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of{" "}
          <strong>DressApp</strong> (&quot;DressApp,&quot; &quot;we,&quot; &quot;us,&quot; or
          &quot;our&quot;), including our website at{" "}
          <Link href="https://dressapp.me" target="_blank" rel="noopener noreferrer">
            dressapp.me
          </Link>
          , merchant dashboard, Shopify app, storefront widget, SDK, and Partner API (collectively,
          the &quot;Services&quot;).
        </p>
        <p>
          By creating an account, installing our Shopify app, integrating our SDK or API, or using
          virtual try-on on a participating storefront, you agree to these Terms and our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the
          Services.
        </p>
        <p>
          If you use the Services on behalf of a business, you represent that you have authority to
          bind that business to these Terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Who these terms apply to</h2>
        <p>These Terms apply to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Merchants</strong> - store owners and staff who install DressApp, subscribe to a
            plan, configure the widget, or use the SDK/API.
          </li>
          <li>
            <strong>Shoppers</strong> - visitors who use virtual try-on on a merchant&apos;s
            storefront.
          </li>
          <li>
            <strong>Developers and partners</strong> - anyone integrating DressApp via our SDK, API,
            or documentation.
          </li>
        </ul>
        <p>
          Shoppers use try-on at the direction of the merchant whose store they visit. Merchants are
          responsible for their own storefront policies, product listings, and lawful collection of
          shopper data.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Description of the Services</h2>
        <p>
          DressApp provides AI-powered virtual try-on for fashion and apparel retailers. Depending on
          your integration, the Services may include:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>A Shopify app with admin configuration, billing, and catalog sync</li>
          <li>A storefront widget that lets shoppers create a digital body model and preview products</li>
          <li>Partner API and SDK access for non-Shopify storefronts</li>
          <li>Usage dashboards, metering, and merchant support tools</li>
        </ul>
        <p>
          Try-on images are <strong>computer-generated visualizations</strong>. They are intended to
          help shoppers explore fit and style. They are not photographs, size guarantees, or
          professional fitting advice.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Eligibility</h2>
        <p>
          You must be at least 18 years old, or the age of majority in your jurisdiction, to create a
          merchant account or enter into a paid subscription. Shoppers under 16 should not upload
          body photos or measurements unless permitted by applicable law and with appropriate
          parental consent where required.
        </p>
        <p>
          You may not use the Services if you are barred from doing so under applicable law or if
          we have previously suspended or terminated your access for violation of these Terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Accounts and merchant obligations</h2>
        <h3>Account security</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials, API
          keys, and Shopify access tokens. Secret keys (for example, <code className="rounded bg-muted px-1 py-0.5 text-xs text-foreground">dress_sk_...</code>)
          must be stored server-side only. Notify us promptly at{" "}
          <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link> if you suspect unauthorized
          access.
        </p>

        <h3>Merchant responsibilities</h3>
        <p>If you are a merchant, you agree to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Provide accurate business and billing information</li>
          <li>Comply with Shopify&apos;s terms, app policies, and applicable commerce laws</li>
          <li>
            Publish appropriate privacy notices on your storefront for shopper try-on data, including
            photo uploads and measurements
          </li>
          <li>
            Obtain any required consents before enabling try-on that processes personal data,
            including biometric-style body data where applicable
          </li>
          <li>
            Use try-on outputs responsibly in marketing and not misrepresent generated images as
            real photographs or guaranteed fit results
          </li>
          <li>Keep product catalog data accurate so size, color, and inventory context is correct</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>Shopper use</h2>
        <p>
          When you use try-on on a merchant storefront, you agree to upload only photos you have the
          right to use, provide truthful measurements where requested, and use the feature for
          personal shopping purposes only.
        </p>
        <p>
          You understand that generated try-on images are approximations. Color, drape, texture,
          lighting, and fit may differ from real-world results. DressApp does not sell products to
          shoppers and is not a party to any purchase between you and the merchant.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Plans, billing, and usage limits</h2>
        <p>
          Paid features are offered through subscription plans shown on our website or in the Shopify
          admin. Billing may be processed through <strong>Shopify billing</strong>,{" "}
          <strong>PayPal</strong>, or other payment providers we support.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Fees, included try-ons, and plan limits are described at purchase and may change with notice</li>
          <li>Subscriptions renew according to the billing cycle you select unless canceled</li>
          <li>Overage, add-ons, or on-demand try-ons may incur additional charges where offered</li>
          <li>We may suspend or throttle usage if plan limits are exceeded or payment fails</li>
          <li>Except where required by law, fees are non-refundable once a billing period has started</li>
        </ul>
        <p>
          Taxes may apply based on your location. You authorize us and our payment partners to charge
          applicable fees to your selected payment method.
        </p>
      </section>

      <section className="space-y-4">
        <h2>API, SDK, and developer terms</h2>
        <p>
          If you integrate via our Partner API or SDK, you must follow our integration documentation
          and rate limits. You may not:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Expose secret keys in client-side code, public repositories, or browser bundles</li>
          <li>Resell, sublicense, or white-label the Services without written permission</li>
          <li>Reverse engineer, scrape, or attempt to extract our models, prompts, or underlying systems</li>
          <li>Use the API to build a competing virtual try-on service without our consent</li>
          <li>Register storefront domains that you do not control or have authorization to use</li>
        </ul>
        <p>
          We may issue publishable keys, rotate credentials, and restrict domains for security. API
          availability and response formats may evolve; we will use reasonable efforts to avoid
          breaking changes without notice where practicable.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Acceptable use</h2>
        <p>You may not use the Services to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Upload unlawful, infringing, explicit, hateful, or deceptive content</li>
          <li>Harass, impersonate, or violate the privacy or publicity rights of others</li>
          <li>Generate try-ons for non-apparel products unless explicitly supported</li>
          <li>Circumvent usage limits, billing, authentication, or abuse controls</li>
          <li>Probe or disrupt our infrastructure, or introduce malware</li>
          <li>Process personal data without a lawful basis or required notices</li>
        </ul>
        <p>
          We may investigate violations and remove content, suspend accounts, or terminate access
          without refund where permitted by law.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Intellectual property</h2>
        <p>
          DressApp and its licensors own the Services, software, branding, documentation, and
          underlying technology. These Terms do not grant you ownership of our intellectual property.
        </p>
        <p>
          You retain ownership of content you submit, including product images, shopper uploads, and
          store data. You grant DressApp a limited license to host, process, transform, and display
          that content solely to operate and improve the Services, including generating try-on outputs
          through AI providers under our agreements.
        </p>
        <p>
          Generated try-on images are provided for use in connection with the merchant&apos;s
          storefront experience. Merchants must not claim exclusive ownership over the underlying
          DressApp technology or use outputs to train competing models without permission.
        </p>
      </section>

      <section className="space-y-4">
        <h2>AI and third-party services</h2>
        <p>
          Virtual try-on relies on third-party infrastructure and AI models, including cloud hosting,
          storage, Shopify platform services, and providers such as <strong>Google Gemini</strong> and
          other inference services where enabled.
        </p>
        <p>
          Third-party services are subject to their own terms and outages. DressApp is not
          responsible for third-party acts or failures beyond our reasonable control. Our use of
          personal data with subprocessors is described in the{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Disclaimers</h2>
        <p>
          THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE MAXIMUM
          EXTENT PERMITTED BY LAW, DRESSAPP DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY OF
          TRY-ON RESULTS.
        </p>
        <p>
          We do not warrant that try-on images will match real-world fit, color, fabric behavior, or
          inventory availability. Merchants remain solely responsible for product descriptions,
          sizing charts, returns policies, and customer support for purchases.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, DRESSAPP AND ITS AFFILIATES, OFFICERS, EMPLOYEES,
          AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
          EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS
          INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICES OR THESE
          TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO DRESSAPP FOR THE SERVICES
          IN THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED US
          DOLLARS (USD $100).
        </p>
        <p>
          Some jurisdictions do not allow certain limitations, so some of the above may not apply to
          you.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless DressApp from claims, damages, losses, and
          expenses (including reasonable legal fees) arising out of your use of the Services, your
          content, your storefront policies, your violation of these Terms, or your violation of any
          law or third-party right.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Suspension and termination</h2>
        <p>
          You may stop using the Services at any time. Merchants may uninstall the Shopify app or
          cancel subscriptions according to the applicable billing flow.
        </p>
        <p>
          We may suspend or terminate access immediately if you breach these Terms, create security
          risk, fail to pay fees, or if required by law or platform partners such as Shopify. Upon
          termination, your right to use the Services ends. Sections that by nature should survive
          (including payment obligations, disclaimers, limitation of liability, and indemnification)
          will survive.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Governing law and disputes</h2>
        <p>
          These Terms are governed by the laws of <strong>Israel</strong>, without regard to conflict
          of law principles, except where mandatory consumer protections in your country apply.
        </p>
        <p>
          Any dispute arising from these Terms or the Services will be brought in the competent courts
          located in Israel, unless applicable law requires a different forum. Before filing suit,
          the parties agree to try to resolve disputes informally by contacting{" "}
          <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link> within thirty (30) days.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Changes to these terms</h2>
        <p>
          We may update these Terms from time to time. The revised version will be posted on this page
          with an updated date. Material changes may be communicated through the app, email, or
          dashboard notice where appropriate. Continued use after changes become effective constitutes
          acceptance where permitted by law.
        </p>
      </section>

      <section className="space-y-4">
        <h2>Contact us</h2>
        <p>
          Questions about these Terms, billing, or acceptable use can be sent to us using the contact
          details below.
        </p>
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Legal & account support</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Subject line: <span className="text-foreground">Terms - DressApp</span>
              </p>
            </div>
            <Link
              href={`mailto:${SUPPORT_EMAIL}?subject=Terms%20-%20DressApp`}
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
