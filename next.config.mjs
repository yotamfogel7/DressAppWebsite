/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@dressapp/web-sdk", "@dressapp/react-widget"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
