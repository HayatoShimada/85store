import Image from 'next/image';
import Link from 'next/link';

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
        </div>
      </div>
    </div>
  );
}
