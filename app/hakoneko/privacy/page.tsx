import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ハコネコは見ている｜プライバシーポリシー',
};

export default function HakonekoPrivacyPage() {
  return (
    <div className="w-full bg-[#11131a] text-[#eaeaea] flex flex-col min-h-[calc(100vh-4rem)] font-sans">
      <div className="max-w-[760px] w-full mx-auto px-5 pt-8 pb-20 flex-grow">
        <h1 className="text-[#ff8d1f] text-[26px] font-bold mb-1">プライバシーポリシー</h1>
        <div className="text-[#9aa0aa] text-[13px] mb-6">ゲーム「ハコネコは見ている」（提供：85-Store）</div>

        <div className="bg-[#1b1e27] rounded-[14px] px-[22px] py-[20px] mt-4">
          <p className="leading-[1.8] mb-4">
            85-Store（以下「当方」）は、本ゲーム「ハコネコは見ている」（以下「本アプリ」）における
            ランキング機能の提供にあたり、以下のとおり利用者情報を取り扱います。
          </p>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">1. 取得する情報</h2>
          <ul className="pl-5 list-disc leading-[1.8] mb-4">
            <li>利用者が入力した<strong>ニックネーム</strong></li>
            <li><strong>スコア</strong>および<strong>プレイ日時</strong></li>
            <li>端末を区別するための<strong>匿名ID（アプリが生成するランダムな識別子）</strong></li>
          </ul>
          <p className="leading-[1.8] mb-4 text-[15px]">
            ※ 氏名・メールアドレス・電話番号・位置情報などの個人情報は取得しません。<br className="hidden sm:block" />
            匿名IDは特定の個人を識別するものではありません。
          </p>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">2. 利用目的</h2>
          <ul className="pl-5 list-disc leading-[1.8] mb-4">
            <li>グローバルランキングの表示および利用者自身の記録管理</li>
            <li>不正・迷惑行為の防止</li>
          </ul>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">3. 保管および第三者提供</h2>
          <ul className="pl-5 list-disc leading-[1.8] mb-4">
            <li>取得した情報はクラウド基盤「Supabase」に保管されます（国外のサーバーに保管される場合があります）。</li>
            <li>法令に基づく場合を除き、取得した情報を第三者へ提供することはありません。</li>
            <li>広告目的の追跡（トラッキング）は行いません。</li>
          </ul>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">4. データの削除</h2>
          <p className="leading-[1.8] mb-4">
            登録情報（ニックネーム・スコア等）の削除をご希望の場合は、下記窓口までご連絡ください。
            速やかに対応します。
          </p>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">5. 改定</h2>
          <p className="leading-[1.8] mb-4">
            本ポリシーは、必要に応じて予告なく変更されることがあります。
            変更後の内容は本ページに掲載した時点で効力を生じます。
          </p>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">6. お問い合わせ</h2>
          <p className="leading-[1.8] mb-8">
            85-Store　<a href="mailto:info@85-store.com" className="text-[#ff8d1f] hover:underline">info@85-store.com</a><br />
            <Link href="/" className="text-[#ff8d1f] hover:underline">https://85-store.com</Link>
          </p>

          <h2 className="text-[#9aa0aa] text-[14px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">English summary</h2>
          <p className="text-[#9aa0aa] text-[14px] leading-[1.8]">
            &quot;Haco Neco wa Miteiru&quot; collects a player-chosen nickname, score, play date, and an
            anonymous app-generated device identifier solely to provide a global leaderboard.
            It does <strong>not</strong> collect email, name, phone, or location, and does not track users for
            advertising. Data is stored on Supabase. To request deletion, contact
            {' '}<a href="mailto:info@85-store.com" className="text-[#ff8d1f] hover:underline">info@85-store.com</a>.
          </p>
        </div>

        <footer className="text-[#9aa0aa] text-[12px] mt-10 text-center">
          © 85-Store
        </footer>
      </div>
    </div>
  );
}
