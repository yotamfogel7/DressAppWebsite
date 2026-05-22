import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

export const metadata: Metadata = {
  title: 'DressApp | Virtual Try-On Engine for Fashion Retail',
  description: 'Transform your e-commerce with AI-powered virtual try-on technology. Reduce returns, increase conversions, and deliver exceptional customer experiences.',
  keywords: ['virtual try-on', 'fashion tech', 'e-commerce', 'AI', 'augmented reality', 'retail technology'],
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/DressApp%20Hanger.png', type: 'image/png' }],
    apple: '/DressApp%20Hanger.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FAFBFC',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
