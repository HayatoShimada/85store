import Link from "next/link";

interface SectionHeadingProps {
  id?: string;
  title: string; // 英語の見出し
  description?: string; // 日本語の補足
  as?: "h1" | "h2";
  link?: { href: string; label: string };
}

// セクション見出し: 英語の見出し + 日本語の補足 + 右側に「すべて見る」リンク
export default function SectionHeading({ id, title, description, as: Tag = "h2", link }: SectionHeadingProps) {
  return (
    <div className="sec-head">
      <div>
        <Tag id={id}>{title}</Tag>
        {description && <p>{description}</p>}
      </div>
      {link && <Link href={link.href}>{link.label}</Link>}
    </div>
  );
}
