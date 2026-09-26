"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Menu, X } from "lucide-react";
import "./navigation-12.css";

type NavLink = { label: string; href: string };

export type Navigation12Props = {
  brand: string;
  brandHref: string;
  navigationLabel: string;
  closeLabel: string;
  links: readonly NavLink[];
  desktopActions: ReactNode;
  mobileActions: ReactNode;
};

const menuStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const menuItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

// Adapted from React Bits Pro navigation-12: animated active pill, expanding
// mobile panel and staggered menu items, with the site's own navigation data.
export default function Navigation12({ brand, brandHref, navigationLabel, closeLabel, links, desktopActions, mobileActions }: Navigation12Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => { setOpen(false); }, [pathname]);

  const currentPath = pathname === "/" ? brandHref : pathname;
  const activeHref = [...links].sort((a, b) => b.href.length - a.href.length)
    .find(link => currentPath === link.href || (link.href !== brandHref && currentPath.startsWith(`${link.href}/`)))?.href;

  return (
    <header className="rb-nav12">
      <div className="rb-nav12-container">
        <motion.nav
          initial={reduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rb-nav12-bar"
          aria-label={navigationLabel}
        >
          <a href={brandHref} className="rb-nav12-brand" aria-label={`${brand} ${links[0]?.label ?? ''}`}>
            <span className="brand-mark" aria-hidden="true"><i/><i/><i/></span>
            <span>{brand}</span>
          </a>

          <div className="rb-nav12-links">
            {links.map(link => <a
              key={link.href}
              href={link.href}
              aria-current={activeHref === link.href ? "page" : undefined}
              className={`rb-nav12-link${activeHref === link.href ? " is-active" : ""}`}
            >
              {activeHref === link.href && <motion.span layoutId="nav12-active" className="rb-nav12-pill" transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }} />}
              <span className="rb-nav12-link-label">{link.label}</span>
            </a>)}
          </div>

          <div className="rb-nav12-desktop-actions">{desktopActions}</div>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen(value => !value)}
            aria-expanded={open}
            aria-controls="nav12-mobile-menu"
            aria-label={open ? closeLabel : navigationLabel}
            className="rb-nav12-toggle"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </motion.nav>

        <AnimatePresence>
          {open && <motion.div
            id="nav12-mobile-menu"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rb-nav12-mobile-wrap"
          >
            <motion.nav initial={reduceMotion ? false : "hidden"} animate="visible" variants={menuStagger} className="rb-nav12-mobile" aria-label={navigationLabel}>
              {links.map(link => <motion.a
                key={link.href}
                href={link.href}
                variants={menuItem}
                aria-current={activeHref === link.href ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`rb-nav12-mobile-link${activeHref === link.href ? " is-active" : ""}`}
              >
                {link.label}
                {activeHref === link.href && <span className="rb-nav12-dot" aria-hidden="true" />}
              </motion.a>)}
              <motion.div variants={menuItem} className="rb-nav12-mobile-actions">{mobileActions}</motion.div>
            </motion.nav>
          </motion.div>}
        </AnimatePresence>
      </div>
    </header>
  );
}
