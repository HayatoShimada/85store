import Image from "next/image";
import Link from "next/link";
import IrregularHolidayNote from "@/components/IrregularHolidayNote";
import StoreActions from "@/components/StoreActions";
import { STORE } from "@/lib/store-info";

// 店舗情報（深緑のパネル + 店内写真 + フロア案内）
export default function StoreInfoSection() {
  return (
    <section className="section" aria-labelledby="store-heading">
      <div className="grid-lines grid-cols-12">
        <div className="col-span-7 grid content-start gap-8 bg-accent-2 p-[clamp(24px,4vw,56px)] text-on-accent-2 max-[900px]:col-span-12">
          <div>
            <h2 id="store-heading" className="font-display text-2xl font-bold tracking-tight">Store</h2>
            <p className="mt-1 text-sm opacity-85">お店の情報</p>
          </div>
          <dl>
            {[
              { label: "住所", value: <>〒{STORE.address.postalCode}<br />{STORE.address.region}{STORE.address.locality}{STORE.address.street}</> },
              { label: "営業時間", value: <><span className="num">{STORE.hours.label}</span><span className="block text-sm opacity-85">{STORE.hours.note}</span></> },
              { label: "定休日", value: <>{STORE.hours.closedDays}<IrregularHolidayNote className="opacity-85" /></> },
              { label: "駐車場", value: <span className="text-sm">{STORE.parkingNote}</span> },
              { label: "取り扱い", value: "River、VOIRY、SOWBOW、Macmahon Knitting Mills、Building ほか" },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-[7em_minmax(0,1fr)] gap-4 border-t border-on-accent-2/30 py-4 max-[900px]:grid-cols-[5.5em_minmax(0,1fr)]">
                <dt className="pt-0.5 text-sm opacity-85">{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          <StoreActions
            variant="inverse"
            showOnlineStore={false}
            leading={<Link href="/reserve" className="btn btn-inverse">来店予約をする</Link>}
          />
        </div>

        <figure className="relative col-span-5 min-h-80 bg-surface max-[900px]:col-span-12 max-[900px]:aspect-[3/2]">
          <Image src="/images/shop.jpg" alt="85-Store の店内" fill sizes="(max-width: 900px) 100vw, 40vw" className="object-cover" />
        </figure>

        <div className="col-span-12 grid grid-cols-2 gap-px bg-rule max-[560px]:grid-cols-1">
          <Link href="/about" className="group grid gap-1 bg-bg p-6">
            <b className="font-display text-lg font-semibold group-hover:underline group-hover:underline-offset-4">1F 85-Store</b>
            <span className="text-sm text-muted">セレクトショップ</span>
          </Link>
          <Link href="/upstore" className="group grid gap-1 bg-bg p-6">
            <b className="font-display text-lg font-semibold group-hover:underline group-hover:underline-offset-4">2F 85-UpStore</b>
            <span className="text-sm text-muted">ポップアップや制作に使える共創スペース</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
