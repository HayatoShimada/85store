import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ハコネコはこちらを見ている | 85-Store',
  description: '富山県南砺市井波のセレクトショップ「85-Store」の看板猫ハコネコによる、コズミック・ホラー風スイカ系パズルゲーム。',
};

export default function HakonekoPage() {
  return (
    <div className="w-full bg-[#08080b] text-[#eaeaea] flex flex-col min-h-[calc(100vh-4rem)] font-sans relative overflow-hidden">
      {/* Background ambient glow - Cosmic Horror feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#ff5500] rounded-full blur-[150px] opacity-[0.05] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[50%] bg-[#8a2be2] rounded-full blur-[180px] opacity-[0.04] pointer-events-none mix-blend-screen"></div>

      <div className="max-w-[800px] w-full mx-auto px-5 py-20 flex flex-col justify-start items-center flex-grow text-center relative z-10">

        <div className="mb-14">
          <h1 className="text-[#ff8d1f] text-[36px] md:text-[50px] font-extrabold mb-3 tracking-[0.1em] drop-shadow-[0_0_15px_rgba(255,141,31,0.6)]">
            ハコネコはこちらを見ている
          </h1>
          <p className="text-[12px] md:text-[14px] text-[#ff8d1f]/60 tracking-[0.4em] font-light uppercase">
            Haconeco is watching you
          </p>
        </div>

        {/* Intro */}
        <div className="w-full mb-16 leading-[2.2] text-[#cfcfcf] text-[15px] md:text-[17px]">
          <p className="mb-8">
            『ハコネコはこちらを見ている』は、85-Storeがお届けする、<br className="hidden md:block" />
            一見キュート、中身はハードな<span className="text-[#ff8d1f] font-bold">コズミックホラー・マージパズルゲーム</span>です。
          </p>

          <blockquote className="italic text-[#9aa0aa] border-y border-[#ff8d1f]/30 py-8 my-12 text-center max-w-[540px] mx-auto bg-gradient-to-b from-transparent via-[#ff8d1f]/[0.02] to-transparent">
            「深淵をのぞく時、深淵もまたこちらをのぞいている」<br />
            <span className="text-[13px] text-[#7a808a] mt-4 block tracking-widest">――ニーチェ</span>
          </blockquote>

          <p className="mb-6">
            この宇宙において、その「深淵」は、<br className="hidden md:block" />
            モフモフの毛玉にまみれた、名状しがたき猫の姿をしていました。
          </p>
          <p className="text-[20px] md:text-[22px] text-[#ff8d1f] font-bold drop-shadow-[0_0_8px_rgba(255,141,31,0.4)] mt-12 mb-8">
            あなたは、その視線に耐えられますか？
          </p>
        </div>

        {/* Visuals */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-24 opacity-90">
          <div className="rounded-2xl overflow-hidden border border-[#ff8d1f]/20 shadow-[0_0_25px_rgba(255,141,31,0.15)] relative group transition-transform duration-500 hover:scale-105">
            <div className="absolute inset-0 bg-[#ff8d1f]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
            <img src="/images/1.png" alt="Cosmic Cat" className="w-[160px] h-[160px] md:w-[240px] md:h-[240px] object-cover" />
          </div>
          <div className="rounded-2xl overflow-hidden border border-[#ff8d1f]/20 shadow-[0_0_25px_rgba(255,141,31,0.15)] relative group transition-transform duration-500 hover:scale-105 hidden sm:block">
            <div className="absolute inset-0 bg-[#ff8d1f]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
            <img src="/images/2.png" alt="Cosmic Cat" className="w-[160px] h-[160px] md:w-[240px] md:h-[240px] object-cover" />
          </div>
        </div>

        {/* Details Cards */}
        <div className="w-full text-left space-y-10 mb-20">
          <div className="bg-[#11131a]/90 backdrop-blur-md border border-[#ff8d1f]/20 rounded-2xl p-6 md:p-10 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden group hover:border-[#ff8d1f]/40 transition-colors duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff8d1f]/50 to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>

            <h2 className="text-[#ff8d1f] text-[24px] font-bold mb-8 flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-[#ff8d1f] animate-pulse shadow-[0_0_8px_#ff8d1f]"></span>
              使命とシステム
            </h2>
            <p className="mb-10 text-[#b8bccc] leading-[1.9] text-[16px]">
              あなたの使命は、増え続ける「モフモフ」から宇宙を救うこと。同じ姿の「ハコネコ」を寄り添わせ、進化させ、最果ての姿で対消滅させなければなりません。さもなくば、世界は静寂のモフモフへ還るでしょう…。
            </p>
            <div className="space-y-8 text-[#eaeaea] text-[15px] leading-[1.8]">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-8">
                <strong className="text-[#ff8d1f] sm:w-[150px] shrink-0 text-[16px]">ドラッグ＆ドロップ</strong>
                <span className="text-[#9aa0aa]">ハコネコをドラッグして、好きな場所に落としましょう。</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-8">
                <strong className="text-[#ff8d1f] sm:w-[150px] shrink-0 text-[16px]">進化（マージ）</strong>
                <span className="text-[#9aa0aa]">同じ姿のハコネコどうしが触れると、ひとつ上の姿へと変化します。</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-8">
                <strong className="text-[#ff8d1f] sm:w-[150px] shrink-0 text-[16px]">対消滅</strong>
                <span className="text-[#9aa0aa]">進化の最果て。最果ての姿どうしが触れると「対消滅」が起こり、膨大なエネルギーが解き放たれます。画面が埋め尽くされる前に、すべてを対消滅させれば、宇宙に平穏が訪れます。</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-8">
                <strong className="text-[#ff8d1f] sm:w-[150px] shrink-0 text-[16px]">ブラックホール</strong>
                <span className="text-[#9aa0aa]">たまったエネルギーを使って、ブラックホールをタップ！画面上のハコネコを一匹、消し去ることができます。危機を脱する鍵です。</span>
              </div>
            </div>
          </div>

          <div className="bg-[#11131a]/90 backdrop-blur-md border border-[#ff8d1f]/20 rounded-2xl p-6 md:p-10 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden group hover:border-[#ff8d1f]/40 transition-colors duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff8d1f]/50 to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>

            <h2 className="text-[#ff8d1f] text-[24px] font-bold mb-10 flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-[#ff8d1f] animate-pulse shadow-[0_0_8px_#ff8d1f]"></span>
              正気（サンニティ）を試す魅力
            </h2>
            <div className="space-y-10 text-[#eaeaea] text-[15px] leading-[1.9]">
              <div>
                <strong className="block text-[#ff8d1f] text-[18px] mb-3 font-bold tracking-wide">レトロ＆ネオンな世界観</strong>
                <p className="text-[#9aa0aa]">ハコネコのキュートなビジュアルと、不気味なネオンオレンジの発光が融合した、唯一無二のヴィジュアル。</p>
              </div>
              <div>
                <strong className="block text-[#ff8d1f] text-[18px] mb-3 font-bold tracking-wide">深まる「名状しがたき」メッセージ</strong>
                <p className="text-[#9aa0aa]">ゲームオーバー時、スコアに応じてコズミック・ホラー調のメッセージが表示されます。0点から10000点以上まで、500点刻みで変化するメッセージは、あなたの正気が毛玉のようにほどけていく様を描きます。</p>
              </div>
              <div>
                <strong className="block text-[#ff8d1f] text-[18px] mb-3 font-bold tracking-wide">猫好きへの警鐘</strong>
                <p className="text-[#9aa0aa]">これは普通の猫ゲームではありません。増え続けるモフモフの奥で囁いている何か。次元の裂け目から伸びる白い爪。宇宙とは巨大な毛皮にすぎない…。その真実に気づいた時、あなたはもうかつての何かではないかもしれません。</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download & Social Links */}
        <div className="w-full max-w-[640px] mb-16 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          {/* App Store Card */}
          <a
            href="https://apps.apple.com/jp/app/%E3%83%8F%E3%82%B3%E3%83%8D%E3%82%B3%E3%81%AF%E8%A6%8B%E3%81%A6%E3%81%84%E3%82%8B/id6782921863"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between items-center p-6 bg-[#11131a]/80 backdrop-blur-md border border-[#ff8d1f]/20 rounded-2xl hover:border-[#ff8d1f]/60 hover:shadow-[0_0_30px_rgba(255,141,31,0.25)] transition-all duration-300 transform hover:-translate-y-1 text-center overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff8d1f]/5 to-[#ff8d1f]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="flex flex-col items-center gap-2 mb-6 z-10">
              <span className="text-[12px] uppercase tracking-[0.2em] text-[#ff8d1f] font-semibold">Download</span>
              <h3 className="text-white text-[18px] font-bold tracking-wider">App Store</h3>
              <p className="text-[13px] text-[#9aa0aa] mt-1">iOSアプリをインストール</p>
            </div>
            
            <div className="relative h-[40px] flex items-center justify-center transition-transform group-hover:scale-105 z-10">
              <img
                src="/images/app_store_badge.svg"
                alt="Download on the App Store"
                className="h-full w-auto"
              />
            </div>
          </a>

          {/* Instagram Card */}
          <a
            href="https://www.instagram.com/85neco_game/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between items-center p-6 bg-[#11131a]/80 backdrop-blur-md border border-purple-500/20 rounded-2xl hover:border-purple-500/60 hover:shadow-[0_0_30px_rgba(214,36,159,0.25)] transition-all duration-300 transform hover:-translate-y-1 text-center overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#fd5949]/10 to-[#d6249f]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="flex flex-col items-center gap-2 mb-6 z-10">
              <span className="text-[12px] uppercase tracking-[0.2em] text-purple-400 font-semibold">Official Instagram</span>
              <h3 className="text-white text-[18px] font-bold tracking-wider">@85neco_game</h3>
              <p className="text-[13px] text-[#9aa0aa] mt-1">公式アカウントで最新情報をチェック</p>
            </div>
            
            <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#fdf497]/20 via-[#fd5949]/20 to-[#d6249f]/20 rounded-full border border-purple-500/30 group-hover:border-purple-500/60 transition-colors z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-pink-500 transition-transform group-hover:rotate-6"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span className="text-[14px] font-medium tracking-wide text-gray-200 group-hover:text-white">フォローする</span>
            </div>
          </a>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-20">
          <Link
            href="/hakoneko/privacy"
            className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl border border-[#ff8d1f]/40 bg-black/60 text-[#ff8d1f] hover:bg-[#ff8d1f]/20 hover:border-[#ff8d1f]/80 hover:shadow-[0_0_20px_rgba(255,141,31,0.2)] transition-all duration-300 font-bold tracking-widest overflow-hidden"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center px-8 py-4 rounded-xl border border-[#ff8d1f]/40 bg-black/60 text-[#ff8d1f] hover:bg-[#ff8d1f]/20 hover:border-[#ff8d1f]/80 hover:shadow-[0_0_20px_rgba(255,141,31,0.2)] transition-all duration-300 font-bold tracking-widest overflow-hidden"
          >
            85-Store 公式サイト
          </Link>
        </div>

        <div className="border-t border-[#ff8d1f]/20 pt-12 w-full max-w-[400px] mx-auto">
          <p className="leading-[2] text-[#7a808a] mb-6 text-[14px]">
            お問い合わせ：<br />
            <a href="mailto:info@85-store.com" className="text-[#ff8d1f]/80 hover:text-[#ff8d1f] hover:underline hover:drop-shadow-[0_0_8px_rgba(255,141,31,0.5)] transition-all text-[16px] tracking-wider">info@85-store.com</a>
          </p>

          <footer className="text-[#555a66] text-[12px] tracking-widest mt-8">
            © 85-Store
          </footer>
        </div>
      </div>
    </div>
  );
}
