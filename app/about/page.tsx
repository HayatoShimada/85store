import Image from 'next/image';
import Link from 'next/link';
import Zenn from '@/components/icons/Zenn';

export default function About() {
  return (
    <div className="min-h-screen section-bg-gradient">
      <div className="section-padding max-container py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-8 font-inter">
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

            <div className="space-y-6 text-gray-700 leading-relaxed">
              <h2 className="text-2xl font-bold text-secondary mb-4 font-inter">
                85-Store(ハコストア)
              </h2>
              <p>
                A面はオーセンティック。B面は心のままに<br />
                そんな二面性を楽しむための、小さなセレクトショップを作っています。
              </p>
              <p>
              <strong>「今好きなもの」が、「ずっと好きなもの」をつくる。</strong>
                <br />
                その想いを軸に、
                <br />
                オーセンティック＋αな古着とニューアイテムのスタイルを提案します。
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">

                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">2025年9月9日</td>
                      <td className="py-3 px-4">富山県井波に物件を取得し、現在オープン準備中。</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">2025年11月15日</td>
                      <td className="py-3 px-4"><Link href="https://shop.85-store.com/" className="text-primary hover:text-primary-dark transition-colors">
                      オンラインストア</Link>をオープン。</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">2025年11月16日</td>
                      <td className="py-3 px-4"><Link href="https://85-store.com/blog/limitedstore" className="text-primary hover:text-primary-dark transition-colors">
                      週末限定のストア</Link>の予約開始。</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* SNS Links Section */}
          <div className="card-acrylic p-8">
            <h2 className="text-2xl font-bold text-secondary mb-6 text-center font-inter">
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
