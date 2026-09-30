"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { STORE } from "@/lib/store-info";

const NAV_ITEMS = [
  { href: "/blog", label: "Blog", ja: "ブログ" },
  { href: "/about", label: "About", ja: "お店について" },
  { href: "/reserve", label: "Reserve", ja: "来店予約" },
  { href: "/contact", label: "Contact", ja: "お問い合わせ" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-bg">
      <div className="wrap grid h-16 grid-cols-[1fr_auto] items-center gap-4 min-[900px]:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="wordmark justify-self-start text-lg" aria-label="85-Store ホーム">
          85-Store
        </Link>

        <nav aria-label="メインメニュー" className="hidden min-[900px]:block">
          <ul className="flex gap-8 text-sm font-medium">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                  className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-left-bottom bg-no-repeat py-2 transition-[background-size] duration-200 hover:bg-[length:100%_1px] aria-[current=page]:bg-[length:100%_1px]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <a href={STORE.onlineShopUrl} className="btn btn-primary hidden min-[900px]:inline-flex">
            Online Store
          </a>
          <button
            type="button"
            className="btn btn-secondary min-[900px]:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="sp-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <nav id="sp-menu" aria-label="メインメニュー" hidden={!isMenuOpen} className="wrap border-t border-rule min-[900px]:hidden">
        <ul className="py-2">
          {[{ href: STORE.onlineShopUrl, label: "Online Store", ja: "オンラインストア" }, ...NAV_ITEMS].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-baseline justify-between border-b border-rule py-3"
              >
                <span className="font-display text-lg font-semibold">{item.label}</span>
                <span className="text-xs text-muted">{item.ja}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
