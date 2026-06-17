/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["@electric-sql/pglite", "pg", "bcryptjs"],
  transpilePackages: ["@dressapp/web-sdk", "@dressapp/react-widget"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/partner/:path*",
        has: [{ type: "host", value: "dressapp-preview.com" }],
        destination: "https://frontend.dressapp-preview.com/partner/:path*",
        permanent: false,
      },
      {
        source: "/partner/:path*",
        has: [{ type: "host", value: "dressapp.me" }],
        destination: "https://frontend.dressapp.me/partner/:path*",
        permanent: false,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "dressapp.ai" }],
        destination: "https://dressapp.me/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.dressapp.ai" }],
        destination: "https://dressapp.me/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
