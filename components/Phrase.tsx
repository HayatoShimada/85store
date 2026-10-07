import { Fragment, type ReactNode } from "react";
import { OPENING_PAIR, hasJapanese, phrases } from "@/lib/phrase";

// 見出しと短い文を文節で改行する（「媚／びない」のように語の途中で折れないように）。
// サーバーコンポーネントで使う（BudouX をクライアントに送らないため）。
// 本文に使うときは max={SHORT_TEXT_LENGTH}（lib/phrase.ts）を渡す。長い段落は文字単位のまま（行末が揃う）。
// 文字列でないもの（改行を含む住所など）はそのまま出す
export default function Phrase({ children, max = Infinity }: { children: ReactNode; max?: number }) {
  if (typeof children !== "string" || children.length > max || !hasJapanese(children)) return <>{children}</>;
  // 全体が1つの文節でも keep-all で包む（語の途中で折れず、空白でだけ折れる）
  const parts = phrases(children);
  return (
    <span className="ja-phrase">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {withNobr(part)}
        </Fragment>
      ))}
    </span>
  );
}

// 開きかっこと次の1文字を改行しない組にする（Safari が keep-all のとき「（」の後ろで改行するため。lib/phrase.ts）
function withNobr(text: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(OPENING_PAIR)) {
    out.push(text.slice(last, match.index));
    out.push(<span key={match.index} className="ja-nobr">{match[0]}</span>);
    last = match.index + match[0].length;
  }
  if (!out.length) return text;
  out.push(text.slice(last));
  return out;
}
