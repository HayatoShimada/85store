import Link from 'next/link';
import { Metadata } from 'next';

import Phrase from "@/components/Phrase";
export const metadata: Metadata = {
  title: 'ハコネコはこちらを見ている｜プライバシーポリシー',
};

export default function HakonekoPrivacyPage() {
  return (
    <div className="w-full bg-[#11131a] text-[#eaeaea] flex flex-col min-h-[calc(100vh-4rem)] font-sans">
      <div className="max-w-[760px] w-full mx-auto px-5 pt-8 pb-20 grow">
        <h1 className="text-[#ff8d1f] text-[26px] font-bold mb-1">プライバシーポリシー</h1>
        <div className="text-[#9aa0aa] text-[13px] mb-6">ゲーム「ハコネコはこちらを見ている」（提供：85-Store）</div>

        <div className="bg-[#1b1e27] rounded-[14px] px-[22px] py-[20px] mt-4">
          <p className="leading-[1.8] mb-4">
            85-Store（以下「当方」）は、本ゲーム「ハコネコはこちらを見ている」（以下「本アプリ」）における
            ランキング機能の提供にあたり、以下のとおり利用者情報を取り扱います。
          </p>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">1. 取得する情報</h2>
          <ul className="pl-5 list-disc leading-[1.8] mb-4">
            <li><Phrase>{"利用者が入力した"}</Phrase><strong><Phrase>{"ニックネーム"}</Phrase></strong></li>
            <li><strong><Phrase>{"スコア"}</Phrase></strong><Phrase>{"および"}</Phrase><strong><Phrase>{"プレイ日時"}</Phrase></strong></li>
            <li><Phrase>{"端末を区別するための"}</Phrase><strong><Phrase>{"匿名ID（アプリが生成するランダムな識別子）"}</Phrase></strong></li>
          </ul>
          <p className="leading-[1.8] mb-4 text-[15px]">
            <Phrase>{"※ 氏名・メールアドレス・電話番号・位置情報などの個人情報は取得しません。"}</Phrase><br className="hidden sm:block" />
            <Phrase>{"匿名IDは特定の個人を識別するものではありません。"}</Phrase>
          </p>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">2. 利用目的</h2>
          <ul className="pl-5 list-disc leading-[1.8] mb-4">
            <li><Phrase>{"グローバルランキングの表示および利用者自身の記録管理"}</Phrase></li>
            <li><Phrase>{"不正・迷惑行為の防止"}</Phrase></li>
          </ul>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">3. 利用する外部サービスおよび第三者提供</h2>
          <p className="leading-[1.8] mb-3 text-[15px]">
            <Phrase>{"ランキング機能の提供のため、以下の外部サービスを利用します。これらのサービスの利用にあたっては、各社のプライバシーポリシーが適用されます。"}</Phrase>
          </p>
          <ul className="pl-5 list-disc leading-[1.8] mb-4">
            <li><strong>Unity Gaming Services</strong>（Leaderboards / Authentication）— Unity Technologies。ランキング記録および匿名のプレイヤーIDの処理・保管に利用します。</li>
            <li><strong>Apple Game Center</strong>（iOS）— Apple Inc.</li>
            <li><strong>Google Play Games</strong>（Android）— Google LLC</li>
            <li><strong>Supabase</strong><Phrase>{"（クラウド基盤）— 取得した情報の保管に利用します（国外のサーバーに保管される場合があります）。"}</Phrase></li>
          </ul>
          <ul className="pl-5 list-disc leading-[1.8] mb-4">
            <li><Phrase>{"上記サービスの提供に必要な範囲、および法令に基づく場合を除き、取得した情報を第三者へ提供することはありません。"}</Phrase></li>
            <li><Phrase>{"広告目的の追跡（トラッキング）は行いません。"}</Phrase></li>
          </ul>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">4. データの削除</h2>
          <p className="leading-[1.8] mb-4">
            <Phrase>{"登録情報（ニックネーム・スコア等）の削除をご希望の場合は、下記窓口までご連絡ください。 速やかに対応します。"}</Phrase>
          </p>

          <h2 className="text-[#ff8d1f] text-[18px] font-bold mt-8 mb-2 border-b border-[#333] pb-1.5">5. 改定</h2>
          <p className="leading-[1.8] mb-4">
            <Phrase>{"本ポリシーは、必要に応じて予告なく変更されることがあります。 変更後の内容は本ページに掲載した時点で効力を生じます。"}</Phrase>
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
            advertising. The leaderboard is provided via Unity Gaming Services (Leaderboards /
            Authentication), Apple Game Center (iOS) and Google Play Games (Android), and data is
            stored on Supabase; each provider&apos;s own privacy policy applies. To request deletion, contact
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
