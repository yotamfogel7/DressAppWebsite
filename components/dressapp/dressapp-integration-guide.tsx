import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function DressAppIntegrationGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>What you are connecting</CardTitle>
          <CardDescription>
            The DressApp Shopify integration handles OAuth, registers your shop with DressApp after
            install, and can add virtual try-on to product pages through your theme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <span className="text-foreground font-medium">OAuth install</span> - Shopify issues
              an Admin API access token for your store.
            </li>
            <li>
              <span className="text-foreground font-medium">Register with DressApp</span> - Your
              app backend tells DressApp which shop is connected so catalog and try-on work for
              that storefront.
            </li>
            <li>
              <span className="text-foreground font-medium">Storefront (optional)</span> - A theme
              app extension can load DressApp on product pages using the web SDK.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Before you go live</CardTitle>
          <CardDescription>
            Confirm these items so installs and try-on work end-to-end in production.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="text-foreground font-medium">HTTPS backend</span> - Your Shopify app
            must be served at a stable public <code className="rounded bg-muted px-1 text-xs">https://</code>{" "}
            URL that Shopify and DressApp can reach.
          </p>
          <p>
            <span className="text-foreground font-medium">DressApp credentials</span> - Use the
            publishable key and partner secret issued for your production integration. Keep the
            secret on the server only; never expose it in the theme or browser bundles.
          </p>
          <p>
            <span className="text-foreground font-medium">Configuration</span> - Set the environment
            variables your hosting provider expects for the running app (see below). Allowed
            origins for the DressApp API must include your storefront origin if required by your
            contract.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment variables</CardTitle>
          <CardDescription>
            Typical values for a production Shopify app that talks to DressApp. Names may match your
            host template; align with your deployment checklist.
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
                <td className="py-2">Partners app client secret</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 font-mono text-xs">SCOPES</td>
                <td className="py-2">
                  Admin API scopes your integration needs (for example{" "}
                  <code className="rounded bg-muted px-1">read_products</code>
                  ), comma-separated as required by Shopify
                </td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 font-mono text-xs">HOST</td>
                <td className="py-2">Public base URL of your deployed app backend (HTTPS)</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-2 pr-4 font-mono text-xs">DRESSAPP_API_BASE</td>
                <td className="py-2">
                  Production DressApp API origin (for example{" "}
                  <code className="rounded bg-muted px-1">https://dressapp.me</code>)
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">DRESSAPP_PARTNER_SECRET_KEY</td>
                <td className="py-2">
                  Partner secret for server-side DressApp calls (starts with{" "}
                  <code className="rounded bg-muted px-1">dress_sk_live_…</code>)
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DressApp endpoints your server uses</CardTitle>
          <CardDescription>
            After OAuth, your backend registers the shop; the storefront loads public embed
            configuration for the SDK.
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
              - Bearer token: your{" "}
              <code className="rounded bg-muted px-1 text-xs">DRESSAPP_PARTNER_SECRET_KEY</code>.
            </p>
            <p className="text-xs text-muted-foreground mb-2">Request body:</p>
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
              <code className="rounded bg-muted px-1 text-xs">/partner/v1/embed-config</code> -
              called with your publishable key so the SDK can load correctly on the theme.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
