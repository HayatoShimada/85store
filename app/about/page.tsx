import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Zenn from '@/components/icons/Zenn';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

export const metadata: Metadata = {
  title: "About Us | 富山県南砺市井波の古着・セレクトショップ 85-Store",
  description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」について。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
  keywords: [
    "富山",
    "南砺市",
    "井波",
    "古着",
    "セレクトショップ",
    "85-Store",
    "ハコストア",
    "富山県",
    "古着屋",
    "セレクトショップ 富山",
    "古着 井波",
    "南砺市 古着",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: `${siteUrl}/about`,
    siteName: "85-Store（ハコストア）",
    title: "About Us | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」について。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
    images: [
      {
        url: `${siteUrl}/logo.svg`,
        width: 1200,
        height: 630,
        alt: "85-Store（ハコストア）",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | 富山県南砺市井波の古着・セレクトショップ 85-Store",
    description: "富山県南砺市井波の古着・セレクトショップ「85-Store（ハコストア）」について。オーセンティックな古着とニューアイテムを提案するセレクトショップです。",
    images: [`${siteUrl}/logo.svg`],
  },
};

export default function About() {
  return (
    <div className="min-h-screen section-bg-gradient">
      <div className="section-padding max-container py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-8 ">
            About Us
          </h1>

        </div>

        <div className="max-w-4xl mx-auto">
          <div className="card-acrylic p-8 mb-8">

            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <Image
                  src="/logo.svg"
                  alt="85-Store"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="space-y-8 text-gray-700 leading-relaxed">
              <h2 className="text-2xl font-bold text-secondary mb-4 ">
                85-Store(ハコストア)
              </h2>
              
              {/* 85-Storeとは？セクション */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  85-Storeとは？
                </h3>
                <p className="mb-4">
                  85-Store（ハコストア）は古着と新品を扱うセレクトショップです。<br />
                  商品のセレクト基準には<br />
                  <strong className="text-secondary">「オーセンティック + アルファ」</strong><br />
                  を掲げ、自分がずっと好きなもの（軸）と今好きなもの（まわり）をバランス良くミックスして、変化する感性、変化しない感性を表現するお店です。
                </p>
                <p className="mb-4">
                  洋服が軸にはありますが、場所（ハコ）を作って、その周りに色んな人や物が集まることで、常に変化していくことを受け入れながら進んでいくコンセプトで<br />
                  洋服以外の創作活動（小説、デザイン、イラスト、写真、動画）を楽しみながら表現し、ブレながら進んでいくことを是としています。
                </p>
              </section>

              {/* 3人の店員についてセクション */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  3人の店員について
                </h3>
                <p className="mb-6">
                  「会社員を辞めたいが、やりたいことが無い」ゆいまる<br />
                  「洋服屋をやりたいが、時間が無い」はやとの夫婦と<br />
                  「決まった時間に投薬が必要な」スヌー（猫）の３人が楽しみながら生きる事を中心にデザインされたお店になります。
                </p>

                <div className="space-y-6">
                  {/* ゆいまる */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-bold text-secondary mb-3 ">
                      ゆいまる（販売担当・店主）
                    </h4>
                    <p className="mb-2">
                      長年接客業で会社員として勤めながら、毎日数字に追われ、人間関係にも疲れストレスで突発性難聴も発症。その後会社員を辞める決意を固めて、アパレルという異業種に挑戦。
                    </p>
                    <p className="mb-2">
                      洋服は畳めません（練習中）が、販売・接客が好き。<br />
                      前職では、顧客満足度(NPS)の上位常連で、全国規模の接客コンテストで入賞するなど、人と接し、その人が笑顔で帰ってくれる、来てよかったと感じる接客に定評がある。
                    </p>
                    <p className="text-sm text-gray-600">
                      基本性格はギャル。
                    </p>
                  </div>

                  {/* はやと */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-bold text-secondary mb-3 ">
                      はやと（仕入れ・EC担当）
                    </h4>
                    <p className="mb-2">
                      某総合機械メーカーで、AIとロボットの自律制御の開発を行うなど、機械とプログラムに滅法強い85-Storeの頭脳。
                    </p>
                    <p className="mb-2">
                      以前はアパレルメーカーに勤めていたり、デザイン雑貨のお店に勤めていたり、セレクトショップに勤めていたり、多様なデザイン視点とモノづくりの視点から独自の審美眼を培う。
                    </p>
                    <p className="text-sm text-gray-600">
                      考えすぎてショートするのが偶に瑕。<br />
                      平日は会社員。85-Storeには土日のみ参加。
                    </p>
                  </div>

                  {/* スヌー */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-lg font-bold text-secondary mb-3 ">
                      スヌー（店長）
                    </h4>
                    <p className="mb-2">
                      職業は猫。裏の顔は名探偵(迷探偵)。85-Storeの店長も務めるパラレルワーカー。基本的にはツンが多めのまれにデレのビビりまん。
                    </p>
                    <p className="mb-2">
                      生まれつき心臓が肥大する疾患を持つ。<br />
                      平常時の心拍数が高く、心臓が肺を圧迫し、少しの運動で口を開ける（息が速くなる）症状を抑えるための薬（よくなーると呼んでいる）を処方されている。
                    </p>
                    <p className="mb-2">
                      毎日決まった時間の処方が必要で、時間をコントロールできる働き方としての85-Storeの中心にいる存在。
                    </p>
                    <p className="text-sm text-gray-600">
                      数年の命と言われていたが、5歳になった今もなんだかんだで元気。<br />
                      5歳なのに永遠のベイビー。声が子猫で可愛すぎる。
                    </p>
                  </div>
                </div>
              </section>

              {/* 店舗情報 */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  1st Floor (85-Store) 店舗情報
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">住所</p>
                    <p className="text-gray-700">
                      〒932-0217<br />
                      富山県南砺市本町４丁目１００<br />
                      85-Store
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">営業時間</p>
                    <p className="text-gray-700">
                      12:00 ~ 18:00（木曜定休）
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      事前予約で木曜と18:00～20:00延長営業可<br />
                      <Link href="/reserve" className="text-primary hover:text-primary-dark transition-colors underline">
                        事前予約はこちら
                      </Link>
                    </p>
                  </div>
                </div>
              </section>

              {/* 沿革 */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  沿革
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 font-medium">2025年9月9日</td>
                        <td className="py-3 px-4">富山県南砺市井波に物件を取得し、現在オープン準備中。</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 font-medium">2025年11月15日</td>
                        <td className="py-3 px-4"><Link href="https://shop.85-store.com/" className="text-primary hover:text-primary-dark transition-colors">
                        オンラインストア</Link>をオープン。</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 font-medium">2025年11月16日</td>
                        <td className="py-3 px-4"><Link href="https://85-store.com/blog/limitedstore" className="text-primary hover:text-primary-dark transition-colors">
                        週末限定のストア</Link>の予約開始。</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 font-medium">2025年</td>
                        <td className="py-3 px-4"><Link href="/upstore" className="text-primary hover:text-primary-dark transition-colors">
                        2nd Floor構想</Link>の立ち上げ。</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>

          {/* SNS Links Section */}
          <div className="card-acrylic p-8">
            <h2 className="text-2xl font-bold text-secondary mb-6 text-center ">
              Follow Us
            </h2>
            <div className="flex justify-center space-x-6">
              <a
                href="https://www.instagram.com/85store_inami/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61580629616145"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@85store85"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              <a
                href="https://github.com/HayatoShimada/85store"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://zenn.dev/85store"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                aria-label="Zenn"
              >
                <div className="w-8 h-8">
                  <Zenn />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
