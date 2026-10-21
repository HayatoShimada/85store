import { Fragment } from "react";
import { hasJapanese, phrases } from "@/lib/phrase";

// 見出し・短い文を文節で改行する（「媚／びない」のように語の途中で折れないように）。
// サーバーコンポーネントで使う（BudouX をクライアントに送らないため）
export default function Phrase({ children }: { children: string }) {
  // 日本語が無ければそのまま。全体が1つの文節でも keep-all で包む（語の途中で折れず、空白でだけ折れる）
  if (!hasJapanese(children)) return <>{children}</>;
  const parts = phrases(children);
  return (
    <span className="ja-phrase">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {part}
        </Fragment>
      ))}
    </span>
  );
}
