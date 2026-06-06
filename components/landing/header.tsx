"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { isFullyOnboarded } from "@/lib/onboarding-access"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowRight, Menu, X } from "lucide-react"

const navLinks = [
  { href: "/#how-it-works", label: "Get Started" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/integrations", label: "Integrations" },
  { href: "/#contact-us", label: "Contact us" },
]

const navLinkClass =
  "inline-flex items-center rounded-md border border-transparent px-3 py-1.5 text-base text-primary-foreground/75 transition-all duration-200 hover:border-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground"

function getPathFromHref(href: string) {
  const hashIndex = href.indexOf("#")
  return hashIndex === -1 ? href : href.slice(0, hashIndex) || "/"
}

function getHashFromHref(href: string) {
  const hashIndex = href.indexOf("#")
  return hashIndex === -1 ? null : href.slice(hashIndex + 1)
}

type HeaderProps = {
  /** Use with full-viewport app shells so content is not hidden under a fixed bar. */
  sticky?: boolean
}

function getUserInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
    }
    return name.trim().slice(0, 2).toUpperCase()
  }
  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase()
  }
  return "?"
}

function UserAccountMenu({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const { data: session } = useSession()
  const user = session?.user
  const initials = getUserInitials(user?.name, user?.email)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full ring-offset-primary transition-shadow hover:ring-2 hover:ring-primary-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50 focus-visible:ring-offset-2"
          aria-label="Account menu"
        >
          <Avatar className="size-9 border border-primary-foreground/25">
            <AvatarImage
              src={user?.image ?? undefined}
              alt={user?.name ?? user?.email ?? "Your profile"}
            />
            <AvatarFallback className="bg-primary-foreground/15 text-sm font-medium text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user?.email ? (
          <>
            <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/settings" onClick={onNavigate}>
            DressApp Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account" onClick={onNavigate}>
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            onNavigate?.()
            void signOut({ callbackUrl: "/" })
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Header({ sticky = false }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const authed =
    status === "authenticated" && isFullyOnboarded(session?.user)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = ""
    })
  }, [pathname])

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      const path = getPathFromHref(href)
      const hash = getHashFromHref(href)
      const isSamePage = path === pathname

      if (hash && isSamePage) {
        e.preventDefault()
        const target = document.getElementById(hash)
        if (target) {
          target.scrollIntoView({ behavior: "smooth" })
          window.history.pushState(null, "", href)
        } else {
          router.push(href)
        }
        return
      }

      if (!isSamePage) {
        e.preventDefault()
        document.documentElement.style.scrollBehavior = "auto"
        router.push(href)
      }
    },
    [pathname, router]
  )

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
      <div className="w-full px-6 lg:px-8">
        <nav className="flex w-full items-center gap-4 py-2 md:grid md:grid-cols-[1fr_auto_1fr] md:py-2.5">
          <Link href="/" className="flex shrink-0 items-center md:justify-self-start">
            <Image
              src="/DressApp%20logo%20without%20sub.webp"
              alt="DressApp"
              width={1540}
              height={1453}
              className="h-9 w-auto md:h-10"
              priority
            />
          </Link>

          <div className="hidden items-center justify-center gap-2 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto hidden shrink-0 items-center gap-2 md:ml-0 md:flex md:justify-self-end">
            {authed ? (
              <UserAccountMenu />
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-base text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-base text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
            <Button className="group text-base" asChild>
              <a
                href="https://dressapp-demo.myshopify.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Try DressApp in our demo store
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-1 md:hidden">
            {authed ? <UserAccountMenu onNavigate={() => setMobileMenuOpen(false)} /> : null}
            <button
              className="p-2 text-primary-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${navLinkClass} w-fit py-2`}
                  onClick={(e) => {
                    handleNavClick(e, link.href)
                    setMobileMenuOpen(false)
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-primary-foreground/15">
                {!authed ? (
                  <>
                    <Button
                      variant="ghost"
                      className="text-base text-primary-foreground justify-start"
                      asChild
                    >
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-base text-primary-foreground justify-start"
                      asChild
                    >
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </>
                ) : null}
                <Button className="group text-base w-fit" asChild>
                  <a
                    href="https://dressapp-demo.myshopify.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Try DressApp in our demo store
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
