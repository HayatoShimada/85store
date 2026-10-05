import Link from "next/link";
import IrregularHolidayNote from "@/components/IrregularHolidayNote";
import { STORE, STORE_FULL_ADDRESS } from "@/lib/store-info";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: STORE.onlineShopUrl, label: "オンラインストア" },
      { href: "/reserve", label: "来店予約" },
      { href: "/shipping", label: "配送について" },
      { href: "/returns", label: "返品・交換" },
    ],
  },
  {
    title: "85-Store",
    links: [
      { href: "/about", label: "お店について" },
      { href: "/upstore", label: "85-UpStore（2F）" },
      { href: "/blog", label: "ブログ" },
      { href: "/works", label: "つくったもの" },
      { href: "/contact", label: "お問い合わせ" },
    ],
  },
  {
    title: "Follow",
    links: [
      { href: STORE.sns.instagram, label: "Instagram" },
      { href: STORE.sns.note, label: "note" },
      { href: STORE.sns.spotify, label: "Podcast" },
      { href: STORE.sns.tiktok, label: "TikTok" },
      { href: STORE.sns.facebook, label: "Facebook" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-[var(--section)] bg-footer pt-16 pb-8 text-on-footer">
      <div className="wrap">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <h2 className="mb-3 text-sm font-semibold text-footer-muted">{STORE.name}</h2>
            <p className="text-sm">
              {STORE_FULL_ADDRESS}
              <br />
              <span className="num">{STORE.hours.label}</span>　{STORE.hours.closedLabel}
            </p>
            <IrregularHolidayNote className="mt-1 text-footer-muted" />
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="mb-3 text-sm font-semibold text-footer-muted">{column.title}</h2>
              <ul className="grid gap-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline hover:underline-offset-4">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="wordmark mt-16 mb-4 text-[clamp(2.5rem,1rem+7vw,7rem)] leading-[0.85]" aria-hidden="true" data-snoo-trigger>
          85-Store
        </p>
        <div className="flex flex-wrap justify-between gap-4 border-t border-on-footer/20 pt-4 text-xs text-footer-muted">
          <span>© 2025 85-Store</span>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            <li><Link href="/terms" className="hover:underline">利用規約</Link></li>
            <li><Link href="/privacy" className="hover:underline">プライバシーポリシー</Link></li>
            <li><a href={`${STORE.onlineShopUrl}policies/legal-notice`} className="hover:underline">特定商取引法に基づく表記</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
