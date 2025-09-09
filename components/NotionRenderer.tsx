import React from "react";
import Image from "next/image";

interface NotionRendererProps {
  blocks: any[];
}

export function NotionRenderer({ blocks }: NotionRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>コンテンツがありません</p>
      </div>
    );
  }

  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map((block, index) => {
        const { type, id } = block;
        const value = block[type];

        switch (type) {
          case "paragraph":
            return (
              <p key={id} className="mb-4 leading-relaxed">
                {value.rich_text?.map((text: any, i: number) => {
                  const {
                    annotations: { bold, code, color, italic, strikethrough, underline },
                    text,
                  } = text;
                  
                  return (
                    <span
                      key={i}
                      className={[
                        bold ? "font-bold" : "",
                        italic ? "italic" : "",
                        underline ? "underline" : "",
                        strikethrough ? "line-through" : "",
                        code ? "bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" : "",
                      ].join(" ")}
                      style={color !== "default" ? { color } : {}}
                    >
                      {text.link ? (
                        <a
                          href={text.link.url}
                          className="text-primary hover:text-primary/80 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {text.content}
                        </a>
                      ) : (
                        text.content
                      )}
                    </span>
                  );
                })}
              </p>
            );

          case "heading_1":
            return (
              <h1 key={id} className="text-3xl font-bold text-secondary mb-6 mt-8">
                {value.rich_text?.map((text: any) => text.plain_text).join("")}
              </h1>
            );

          case "heading_2":
            return (
              <h2 key={id} className="text-2xl font-bold text-secondary mb-4 mt-6">
                {value.rich_text?.map((text: any) => text.plain_text).join("")}
              </h2>
            );

          case "heading_3":
            return (
              <h3 key={id} className="text-xl font-bold text-secondary mb-3 mt-4">
                {value.rich_text?.map((text: any) => text.plain_text).join("")}
              </h3>
            );

          case "bulleted_list_item":
            return (
              <ul key={id} className="list-disc list-inside mb-2">
                <li>
                  {value.rich_text?.map((text: any) => text.plain_text).join("")}
                </li>
              </ul>
            );

          case "numbered_list_item":
            return (
              <ol key={id} className="list-decimal list-inside mb-2">
                <li>
                  {value.rich_text?.map((text: any) => text.plain_text).join("")}
                </li>
              </ol>
            );

          case "to_do":
            return (
              <div key={id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={value.checked}
                  readOnly
                  className="mr-3"
                />
                <span className={value.checked ? "line-through text-gray-500" : ""}>
                  {value.rich_text?.map((text: any) => text.plain_text).join("")}
                </span>
              </div>
            );

          case "toggle":
            return (
              <details key={id} className="mb-4">
                <summary className="cursor-pointer font-semibold">
                  {value.rich_text?.map((text: any) => text.plain_text).join("")}
                </summary>
                <div className="mt-2 pl-4">
                  {/* ネストされたブロックは別途処理が必要 */}
                </div>
              </details>
            );

          case "code":
            return (
              <pre key={id} className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <code className={`language-${value.language}`}>
                  {value.rich_text?.map((text: any) => text.plain_text).join("")}
                </code>
              </pre>
            );

          case "quote":
            return (
              <blockquote key={id} className="border-l-4 border-primary pl-4 italic text-gray-600 mb-4">
                {value.rich_text?.map((text: any) => text.plain_text).join("")}
              </blockquote>
            );

          case "divider":
            return <hr key={id} className="my-8 border-gray-200" />;

          case "image":
            const imageUrl = value.type === "external" ? value.external.url : value.file.url;
            const caption = value.caption?.[0]?.plain_text || "";
            
            return (
              <div key={id} className="my-8">
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={caption}
                    fill
                    className="object-cover"
                  />
                </div>
                {caption && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {caption}
                  </p>
                )}
              </div>
            );

          case "callout":
            return (
              <div key={id} className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-blue-400 text-xl">
                      {value.icon?.emoji || "💡"}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-blue-800">
                      {value.rich_text?.map((text: any) => text.plain_text).join("")}
                    </p>
                  </div>
                </div>
              </div>
            );

          default:
            console.log(`Unsupported block type: ${type}`);
            return (
              <div key={id} className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  未対応のブロックタイプ: {type}
                </p>
                <pre className="text-xs mt-2 overflow-x-auto">
                  {JSON.stringify(block, null, 2)}
                </pre>
              </div>
            );
        }
      })}
    </div>
  );
}
