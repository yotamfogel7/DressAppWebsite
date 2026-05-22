"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navLinks = [
  { href: "/#solution", label: "Solution" },
  { href: "/#product", label: "Product" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/integration", label: "Integration" },
  { href: "/usage", label: "Usage" },
  { href: "mailto:dressappsupport@gmail.com", label: "Contact us" },
]

const navLinkClass =
  "inline-flex items-center rounded-md border border-transparent px-3 py-1.5 text-base text-primary-foreground/75 transition-all duration-200 hover:border-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground"

type HeaderProps = {
  /** Use with full-viewport app shells so content is not hidden under a fixed bar. */
  sticky?: boolean
}

export function Header({ sticky = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const positionClass = sticky
    ? "sticky top-0 z-50 w-full shrink-0"
    : "fixed top-0 left-0 right-0 z-50"

  return (
    <motion.header
      initial={sticky ? false : { y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`${positionClass} bg-primary text-primary-foreground border-b border-primary-foreground/10 transition-all duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <nav className="flex items-center justify-between py-4 md:py-5">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/DressApp%20Logo%20Transparent.png"
              alt="DressApp"
              width={400}
              height={112}
              className="h-14 w-auto md:h-[4.5rem]"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) =>
              link.href.startsWith("mailto:") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className={navLinkClass}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClass}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="secondary" className="text-base" asChild>
              <a
                href="https://dressapp-preview.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Try it out
              </a>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-primary-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary border-b border-primary-foreground/10"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) =>
                link.href.startsWith("mailto:") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`${navLinkClass} w-fit py-2`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${navLinkClass} w-fit py-2`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-primary-foreground/15">
                <Button variant="secondary" className="text-base" asChild>
                  <a
                    href="https://dressapp-preview.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Try it out
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
