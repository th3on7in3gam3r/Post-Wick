"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { TextureButton } from "./ui/texture-button";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/#pricing" },
] as const;

export function Navbar() {
  const scrollVisible = useScrollDirection();
  const [menuOpen, setMenuOpen] = useState(false);
  const visible = scrollVisible || menuOpen;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: visible ? 0 : "-110%" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 will-change-transform md:px-6"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="flex min-h-11 items-center justify-between gap-4 rounded-full border border-white/60 bg-white/50 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150 md:min-h-12 md:px-6 md:py-3">
            <BrandLogo className="self-center" />

            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map((item) => (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    className="text-[0.9rem] font-medium text-near-black transition-colors hover:text-near-black/70"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <TextureButton asChild variant="secondary" size="default">
                <Link href="/sign-in">Log in</Link>
              </TextureButton>
              <TextureButton asChild variant="primary" size="default">
                <Link href="/sign-up">Get started →</Link>
              </TextureButton>
            </div>

            <motion.button
              type="button"
              className="flex items-center justify-center rounded-full p-2 md:hidden"
              onClick={() => setMenuOpen(true)}
              whileTap={{ scale: 0.92 }}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-near-black" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-cream/95 px-6 pt-28 backdrop-blur-md md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <motion.button
              type="button"
              className="absolute right-6 top-6 rounded-full p-2"
              onClick={closeMenu}
              whileTap={{ scale: 0.92 }}
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-near-black" />
            </motion.button>

            <div className="flex flex-col gap-6">
              {navLinks.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.08 + 0.08 }}
                >
                  <Link
                    href={item.href}
                    className="font-playfair text-2xl italic text-near-black"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                className="mt-4 flex flex-col gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <TextureButton asChild variant="primary" size="lg">
                  <Link href="/sign-up" onClick={closeMenu}>
                    Get started →
                  </Link>
                </TextureButton>
                <TextureButton asChild variant="secondary" size="lg">
                  <Link href="/sign-in" onClick={closeMenu}>
                    Log in
                  </Link>
                </TextureButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
