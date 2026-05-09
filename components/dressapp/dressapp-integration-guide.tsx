import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DressAppIntegrationMerchantKeyButton } from "@/components/dressapp/dressapp-integration-merchant-key-button"

export function DressAppIntegrationGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>What you are connecting</CardTitle>
          <CardDescription>
            The Shopify app in{" "}
            <code className="rounded bg-muted px-1 text-xs">integrations/shopify</code>{" "}
            is a no-code path for merchants: OAuth, register the shop with DressApp, then
            optionally inject the try-on loader on product pages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <span className="text-foreground font-medium">OAuth install</span> — Shopify
              gives your app an Admin API access token for that shop.
            </li>
            <li>
              <span className="text-foreground font-medium">Register with DressApp</span> — Your
              server calls DressApp with your partner secret so the catalog and try-on APIs know
              that shop.
            </li>
            <li>
              <span className="text-foreground font-medium">Storefront (optional)</span> — A theme
              app extension can load the DressApp script on product pages using the web SDK.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Save a publishable key to your database</CardTitle>
          <CardDescription>
            One-click merchant creation for internal tooling: the publishable key is upserted into
            Postgres (table is created automatically if missing).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DressAppIntegrationMerchantKeyButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Before you start</CardTitle>
          <CardDescription>Checklist so installs do not fail halfway.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="text-foreground font-medium">DressApp API reachable</span> — In
            development, expose your backend with a tunnel (for example Cloudflare Tunnel or
            ngrok) so Shopify and DressApp can call it.
          </p>
          <p>
            <span className="text-foreground font-medium">Partner merchant</span> — Create one with{" "}
            <code className="rounded bg-muted px-1 text-xs">
              POST /partner/v1/admin/merchants
            </code>{" "}
            and header{" "}
            <code className="rounded bg-muted px-1 text-xs">X-Partner-Admin-Secret</code>. Store
            both <code className="rounded bg-muted px-1 text-xs">secret_key</code> and{" "}
            <code className="rounded bg-muted px-1 text-xs">publishable_key</code> from the
            response.
          </p>
          <p>
            <span className="text-foreground font-medium">Env file</span> — Copy{" "}
            <code className="rounded bg-muted px-1 text-xs">.env.example</code> from the Shopify
            integration folder and fill in the values below.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment variables</CardTitle>
          <CardDescription>
            Typical names from <code className="rounded bg-muted px-1 text-xs">README.md</code> —
            your template may use slightly different names; align with{" "}
            <code className="rounded bg-muted px-1 text-xs">.env.example</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 font-medium text-foreground">Variable</th>
                <th className="py-2 font-medium text-foreground">Role</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 font-mono text-xs">SHOPIFY_API_KEY</td>
                <td className="py-2">From Shopify Partners for your app</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 font-mono text-xs">SHOPIFY_API_SECRET</td>
                <td className="py-2">Partners app secret</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 font-mono text-xs">SCOPES</td>
                <td className="py-2">
                  Example: <code className="rounded bg-muted px-1">read_products</code> (add
                  scopes as you need)
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 font-mono text-xs">HOST</td>
                <td className="py-2">Public URL of this Node app (often your tunnel URL)</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 font-mono text-xs">DRESSAPP_API_BASE</td>
                <td className="py-2">
                  DressApp API origin, e.g.{" "}
                  <code className="rounded bg-muted px-1">https://dressapp.me</code>
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">DRESSAPP_PARTNER_SECRET_KEY</td>
                <td className="py-2">
                  Partner <code className="rounded bg-muted px-1">dress_sk_live_…</code> from
                  bootstrap
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run the Shopify integration locally</CardTitle>
          <CardDescription>
            After dependencies install, use Shopify CLI for tunnel and install URL once{" "}
            <code className="rounded bg-muted px-1 text-xs">shopify.app.toml</code> matches your
            Partners app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-xs leading-relaxed">
            {`cd integrations/shopify
npm install
npm run dev`}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DressApp endpoints your server uses</CardTitle>
          <CardDescription>
            The minimal OAuth server registers the shop; the storefront reads public embed config.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div>
            <p className="font-medium text-foreground mb-2">
              Register the Shopify shop after OAuth
            </p>
            <p className="text-muted-foreground mb-2">
              <code className="rounded bg-muted px-1 text-xs">POST</code>{" "}
              <code className="rounded bg-muted px-1 text-xs">
                /partner/v1/platforms/shopify/install
              </code>
              — authenticate with Bearer{" "}
              <code className="rounded bg-muted px-1 text-xs">DRESSAPP_PARTNER_SECRET_KEY</code>.
            </p>
            <p className="text-xs text-muted-foreground mb-2">Example JSON body:</p>
            <pre className="overflow-x-auto rounded-md border bg-muted p-3 text-xs">
              {`{
  "shop_domain": "your-store.myshopify.com",
  "access_token": "shpat_…"
}`}
            </pre>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">Storefront embed config</p>
            <p className="text-muted-foreground">
              <code className="rounded bg-muted px-1 text-xs">GET</code>{" "}
              <code className="rounded bg-muted px-1 text-xs">/partner/v1/embed-config</code> —
              use your <code className="rounded bg-muted px-1 text-xs">publishable_key</code> so
              the SDK knows how to load on the theme.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where the code lives</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <code className="rounded bg-muted px-1 text-xs">server.mjs</code> — OAuth plus
            registration to DressApp (Node 18+).
          </p>
          <p>
            <code className="rounded bg-muted px-1 text-xs">shopify.app.toml</code> — Shopify CLI
            / Partners template.
          </p>
          <p>
            <code className="rounded bg-muted px-1 text-xs">extensions/theme-app-extension/</code>{" "}
            — Optional theme snippet that pulls in{" "}
            <code className="rounded bg-muted px-1 text-xs">@dressapp/web-sdk</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
