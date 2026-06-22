import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ハコネコは見ている | 85-Store',
  description: '富山県南砺市井波のセレクトショップ「85-Store」の看板猫ハコネコによる、コズミック・ホラー風スイカ系パズルゲーム。',
};

export default function HakonekoPage() {
  return (
    <div className="w-full bg-[#11131a] text-[#eaeaea] flex flex-col min-h-[calc(100vh-4rem)] font-sans">
      <div className="max-w-[680px] w-full mx-auto px-5 py-16 flex flex-col justify-center items-center flex-grow text-center">
        <div>
          <h1 className="text-[#ff8d1f] text-[30px] font-bold mb-6">ハコネコは見ている</h1>
          
          <p className="leading-[1.9] text-[#cfcfcf] mb-8">
            富山県南砺市井波のセレクトショップ「85-Store」の看板猫ハコネコによる、<br />
            コズミック・ホラー風スイカ系パズルゲーム。
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-[20px] mb-8">
            <Link 
              href="/hakoneko/privacy" 
              className="inline-block px-[22px] py-[12px] rounded-[10px] bg-[#ff8d1f]/[0.18] text-[#ff8d1f] hover:bg-[#ff8d1f]/30 transition-colors"
            >
              プライバシーポリシー
            </Link>
            <Link 
              href="/" 
              className="inline-block px-[22px] py-[12px] rounded-[10px] bg-[#ff8d1f]/[0.18] text-[#ff8d1f] hover:bg-[#ff8d1f]/30 transition-colors"
            >
              85-Store 公式サイト
            </Link>
          </div>
          
          <p className="leading-[1.9] text-[#cfcfcf] mb-12">
            お問い合わせ：<a href="mailto:info@85-store.com" className="text-[#ff8d1f] hover:underline">info@85-store.com</a>
          </p>
          
          <footer className="text-[#9aa0aa] text-[12px] mt-12">
            © 85-Store
          </footer>
        </div>
      </div>
    </div>
  );
}
