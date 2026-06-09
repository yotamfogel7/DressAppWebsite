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
