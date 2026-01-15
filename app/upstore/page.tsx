import Image from 'next/image';
import Link from 'next/link';

export default function UpStore() {
  return (
    <div className="min-h-screen section-bg-gradient">
      <div className="section-padding max-container py-16">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <Image
                src="/images/85upstore_logo.png"
                alt="85-UpStore Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4 ">
            85-UpStore
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            2nd Floor Co-creation Space
          </p>
          <p className="text-lg text-gray-500">
            共に創り、共に育てる、二階の余白
          </p>
        </div>

        {/* ステートメント */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="card-acrylic p-8 md:p-12">
            <div className="text-center space-y-6 text-gray-700 leading-relaxed">
              <p className="text-2xl md:text-3xl font-bold text-secondary mb-6">
                一段ごとに、店を広くする。
              </p>
              <p className="text-lg">
                85-UpStore 2nd Floor Co-creation Space
              </p>
              <p>
                ここは、まだ何もない8畳の和室です。
                <br />
                私たちが提供するのは、電源と、Wi-Fiと、少しのスペースだけ。
                <br />
                でも、そこには無限の「余白」があります。
              </p>
              <p>
                利用する人のアイデアが加わり、
                <br />
                応援する人の寄付が設備を変え、
                <br />
                この場所は少しずつ、理想のイベントスペースへとアップデートされていきます。
              </p>
              <p className="font-bold text-secondary">
                使う人が、作る人になる。
                <br />
                来る人が、支える人になる。
              </p>
              <p>
                85-Storeの二階から、
                <br />
                井波の新しい景色を、共に創り（Co-creation）ませんか。
              </p>
            </div>
          </div>
        </div>

        {/* 3つの柱 */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 text-center ">
            3つの柱
          </h2>
          <div className="space-y-8">
            {/* Co-creation */}
            <div className="card-acrylic p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-64 h-48 md:h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/upstore1.JPG"
                    alt="Co-creation"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-secondary mb-2 ">
                    Co-creation
                  </h3>
                  <p className="text-lg text-gray-600 mb-4">
                    完璧な場所より、未完成な興奮を
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    ここは、最初からすべてが揃ったレンタルスペースではありません。
                    「エアコンがないなら、どう涼むか？」「棚がないなら、どう見せるか？」
                    そんな不便さを逆手に取り、利用者とオーナー、そしてお客さまが知恵を出し合い、
                    <strong>設備の一つひとつをアップデートしていくプロセスそのものを楽しむ場所</strong>です。
                  </p>
                </div>
              </div>
            </div>

            {/* 2nd Floor */}
            <div className="card-acrylic p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-64 h-48 md:h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/upstore2.JPG"
                    alt="2nd Floor"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-secondary mb-2 ">
                    2nd Floor
                  </h3>
                  <p className="text-lg text-gray-600 mb-4">
                    街へ出る前の、一番近い「二歩目」
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    1階の85-Storeが、街に開かれた「一歩目」の顔。
                    2階のこのスペースは、事業者が自身の夢やアイデアを初めて形にする「二歩目（2nd Floor）」の場所です。
                    店舗を持つ前のプレ・オープン、個展、実験的なワークショップ。
                    <strong>挑戦者が階段を一段上がる（Upする）ための、最も身近なアクセラレーター（加速器）</strong>としての役割を担います。
                  </p>
                </div>
              </div>
            </div>

            {/* Space */}
            <div className="card-acrylic p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-64 h-48 md:h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src="/images/upstore3.JPG"
                    alt="Space"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-secondary mb-2 ">
                    Space
                  </h3>
                  <p className="text-lg text-gray-600 mb-4">
                    繋がりが「醸成」される場所
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    ここは多様な事業者の活動が混ざり合う場所です。
                    清掃や管理を利用者自らが行うことで、場所への愛着が生まれ、利用者同士のネットワークが自然と形成されます。
                    <strong>空間（Space）を共有するだけでなく、未来の井波を面白くする「企み」を共有するコミュニティ</strong>を目指します。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 利用ガイドライン */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="card-acrylic p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center ">
              利用ガイドライン
            </h2>

            <div className="space-y-8 text-gray-700">
              {/* 基本コンセプト */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  1. 基本コンセプト
                </h3>
                <p className="leading-relaxed">
                  本スペースは、井波で活動する事業者の「種」を育てるための共同実験場です。設備をみんなで持ち寄り、育てていく文化を大切にします。
                </p>
              </section>

              {/* 利用資格・目的 */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  2. 利用資格・目的
                </h3>
                <ul className="list-disc list-inside space-y-2 leading-relaxed ml-4">
                  <li>井波を中心に活動する個人事業主、作家、クリエイター。</li>
                  <li>展示会、ワークショップ、ポップアップショップ、打ち合わせ、撮影等。</li>
                  <li><strong>1階「85-Store」のブランドイメージを損なわない活動であること。</strong></li>
                </ul>
              </section>

              {/* 利用料金と設備協力金 */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  3. 利用料金と「設備協力金」
                </h3>
                <ul className="list-disc list-inside space-y-2 leading-relaxed ml-4">
                  <li><strong>スペース利用料：</strong> 無料。</li>
                  <li>
                    <strong>設備協力金（任意）：</strong> スペース維持・設備充実（エアコン設置等）のため、ドネーション（寄付）を募っています。
                    金額の目安は設定しませんが、応援の気持ちを可視化するため、掲示板への記名をお願いする場合があります。
                  </li>
                </ul>
              </section>

              {/* 利用時間と予約 */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  4. 利用時間と予約
                </h3>
                <ul className="list-disc list-inside space-y-2 leading-relaxed ml-4">
                  <li><strong>利用可能時間：</strong> 11:00 〜 18:00（85-Storeの営業時間に準ずる）</li>
                  <li><strong>予約方法：</strong> 指定の予約フォーム、または公式LINEより事前申請。</li>
                  <li><strong>キャンセル：</strong> 無償提供のため、キャンセル時は早急に連絡すること。</li>
                </ul>
              </section>

              {/* 設備と管理 */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  5. 設備と管理
                </h3>
                <ul className="list-disc list-inside space-y-2 leading-relaxed ml-4">
                  <li><strong>提供設備：</strong> 電源、Wi-Fi、テーブル（1台）、水道（共用）。</li>
                  <li><strong>冷暖房：</strong> 現在未設置です。各自で対策をお願いします。</li>
                  <li><strong>清掃・ゴミ：</strong> <strong>「来た時よりも美しく」</strong>が原則です。利用後は床の清掃（クイックルワイパー等）を行い、ゴミはすべて持ち帰ってください。</li>
                  <li><strong>火気厳禁：</strong> 建物内およびベランダでの火気使用（カセットコンロ、タバコ、お香等）は一切禁止です。</li>
                </ul>
              </section>

              {/* 安全と防犯 */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  6. 安全と防犯
                </h3>
                <ul className="list-disc list-inside space-y-2 leading-relaxed ml-4">
                  <li>
                    <strong>ベランダ利用：</strong> 4畳のベランダは利用可能ですが、手すりに登る、重いものを置く等の危険行為は禁止します。
                    また、強風時は利用を制限します。
                  </li>
                  <li><strong>入退室：</strong> スマートロックのパスワードは他者に共有しないでください。</li>
                  <li>
                    <strong>事故・盗難：</strong> 貴重品は各自で管理してください。
                    スペース内での事故、盗難、利用者同士のトラブルについて、85-Storeは一切の責任を負いません。
                  </li>
                </ul>
              </section>

              {/* 禁止事項 */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  7. 禁止事項
                </h3>
                <ul className="list-disc list-inside space-y-2 leading-relaxed ml-4">
                  <li>騒音、異臭の発生など、近隣や1階店舗の営業を妨げる行為。</li>
                  <li>法律に抵触する物品の販売や勧誘活動。</li>
                  <li>壁・床への釘打ち、粘着力の強いテープの使用（現状復帰が困難な加工）。</li>
                </ul>
              </section>

              {/* ネットワークの形成 */}
              <section>
                <h3 className="text-xl font-bold text-secondary mb-4 ">
                  8. ネットワークの形成
                </h3>
                <ul className="list-disc list-inside space-y-2 leading-relaxed ml-4">
                  <li>利用時は、1階のスタッフへ一言挨拶をお願いします。</li>
                  <li>SNS等での発信時は「#85Store」などのハッシュタグを活用し、お互いの活動を応援し合いましょう。</li>
                </ul>
              </section>
            </div>
          </div>
        </div>

        {/* お問い合わせ */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="card-acrylic p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6 ">
              お問い合わせ・ご予約
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              85-UpStoreのご利用をご希望の方は、下記よりお問い合わせください。
            </p>
            <Link href="/contact" className="btn-primary inline-block">
              お問い合わせフォームへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
