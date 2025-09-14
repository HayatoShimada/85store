import React from "react";
import { NotionTextRenderer } from "./NotionTextRenderer";
import { NotionImage } from "./NotionImage";

// ブロックを階層構造を考慮して処理する関数
function processBlocks(blocks: unknown[], level: number = 0): unknown[] {
  const processed: unknown[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i] as any;
    const { type } = block;

    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      const listGroup = [];
      const currentType = type;
      
      // 同じタイプのリストアイテムをグループ化
      while (i < blocks.length) {
        const currentBlock = blocks[i] as any;
        if (currentBlock.type === currentType) {
          // 子要素がある場合は再帰的に処理
          const processedBlock = { ...currentBlock };
          if (currentBlock.children) {
            processedBlock.children = processBlocks(currentBlock.children, level + 1);
          }
          listGroup.push(processedBlock);
          i++;
        } else {
          break;
        }
      }
      
      // リストグループを処理
      processed.push({
        type: currentType === "bulleted_list_item" ? "bulleted_list_group" : "numbered_list_group",
        id: `list-group-${processed.length}`,
        items: listGroup,
        level: level
      });
    } else if (type === "toggle") {
      // トグルブロック内の子ブロックも処理
      const toggleBlock = { ...block };
      if (block.children) {
        toggleBlock.children = processBlocks(block.children, level);
      }
      processed.push(toggleBlock);
      i++;
    } else {
      processed.push(block);
      i++;
    }
  }

  return processed;
}

interface NotionRendererProps {
  blocks: unknown[];
}

interface NotionText {
  annotations: {
    bold?: boolean;
    code?: boolean;
    color?: string;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
  };
  text: {
    content: string;
    link?: {
      url: string;
    };
  };
}

export function NotionRenderer({ blocks }: NotionRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>コンテンツがありません</p>
      </div>
    );
  }

  // デバッグ用: ブロック構造をログ出力
  console.log('NotionRenderer - Original blocks:', blocks.map((block: any) => ({
    type: block.type,
    id: block.id,
    hasChildren: !!block.children,
    children: block.children?.map((child: any) => ({
      type: child.type,
      id: child.id
    })) || []
  })));

  // ブロックをグループ化してリストを適切に処理
  const processedBlocks = processBlocks(blocks);
  
  console.log('NotionRenderer - Processed blocks:', processedBlocks.map((block: any) => ({
    type: block.type,
    id: block.id,
    itemsCount: block.items?.length || 0
  })));

  return (
    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-img:mx-auto prose-headings:scroll-mt-20">
      {processedBlocks.map((block) => {
        const { type, id } = block as any;
        const value = (block as any)[type];

        switch (type) {
          case "paragraph":
            return (
              <p key={id} className="mb-4 leading-relaxed">
                <NotionTextRenderer richText={value.rich_text} />
              </p>
            );

          case "heading_1":
            return (
              <h1 key={id} id={`heading-${id}`} className="text-3xl font-bold text-secondary mb-6 mt-8 scroll-mt-20">
                <NotionTextRenderer richText={value.rich_text} />
              </h1>
            );

          case "heading_2":
            return (
              <h2 key={id} id={`heading-${id}`} className="text-2xl font-bold text-secondary mb-4 mt-6 scroll-mt-20">
                <NotionTextRenderer richText={value.rich_text} />
              </h2>
            );

          case "heading_3":
            return (
              <h3 key={id} id={`heading-${id}`} className="text-xl font-bold text-secondary mb-3 mt-4 scroll-mt-20">
                <NotionTextRenderer richText={value.rich_text} />
              </h3>
            );

          case "bulleted_list_group":
            return (
              <ul 
                key={id} 
                className="list-disc list-inside mb-4 space-y-1"
                style={{ marginLeft: `${(block as any).level * 20}px` }}
              >
                {(block as any).items.map((item: any) => (
                  <li key={item.id} className="leading-relaxed">
                    <NotionTextRenderer richText={item.bulleted_list_item.rich_text} />
                    {item.children && item.children.length > 0 && (
                      <div className="mt-2">
                        <NotionRenderer blocks={item.children} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            );

          case "numbered_list_group":
            return (
              <ol 
                key={id} 
                className="list-decimal list-inside mb-4 space-y-1"
                style={{ marginLeft: `${(block as any).level * 20}px` }}
              >
                {(block as any).items.map((item: any) => (
                  <li key={item.id} className="leading-relaxed">
                    <NotionTextRenderer richText={item.numbered_list_item.rich_text} />
                    {item.children && item.children.length > 0 && (
                      <div className="mt-2">
                        <NotionRenderer blocks={item.children} />
                      </div>
                    )}
                  </li>
                ))}
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
                  <NotionTextRenderer richText={value.rich_text} />
                </span>
              </div>
            );

          case "toggle":
            return (
              <details key={id} className="mb-4">
                <summary className="cursor-pointer font-semibold">
                  <NotionTextRenderer richText={value.rich_text} />
                </summary>
                <div className="mt-2 pl-4">
                  {(block as any).children && (
                    <NotionRenderer blocks={(block as any).children} />
                  )}
                </div>
              </details>
            );

          case "code":
            return (
              <pre key={id} className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <code className={`language-${value.language}`}>
                  <NotionTextRenderer richText={value.rich_text} />
                </code>
              </pre>
            );

          case "quote":
            return (
              <blockquote key={id} className="border-l-4 border-primary pl-4 italic text-gray-600 mb-4">
                <NotionTextRenderer richText={value.rich_text} />
              </blockquote>
            );

          case "divider":
            return <hr key={id} className="my-8 border-gray-200" />;

          case "image":
            const imageUrl = value.type === "external" ? value.external.url : value.file.url;
            const caption = value.caption?.[0]?.text?.content || "";
            
            return (
              <NotionImage
                key={id}
                src={imageUrl}
                alt={caption}
                caption={caption}
              />
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
                      <NotionTextRenderer richText={value.rich_text} />
                    </p>
                  </div>
                </div>
              </div>
            );

          case "table_of_contents":
            return (
              <div key={id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">目次</h4>
                <div className="text-sm text-gray-600">
                  <p>目次は自動生成されます</p>
                </div>
              </div>
            );

          case "column_list":
            return (
              <div key={id} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* カラムの内容は別途処理が必要 */}
                <div className="text-sm text-gray-500">カラムレイアウト</div>
              </div>
            );

          case "column":
            return (
              <div key={id} className="mb-4">
                {/* カラムの内容は別途処理が必要 */}
                <div className="text-sm text-gray-500">カラム内容</div>
              </div>
            );

          case "table":
            return (
              <div key={id} className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      {value.table_width && Array.from({ length: value.table_width }).map((_, i) => (
                        <th key={i} className="px-4 py-2 border-b border-gray-200 text-left text-sm font-medium text-gray-700">
                          列 {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={value.table_width || 1} className="px-4 py-2 text-sm text-gray-500 text-center">
                        テーブルの内容は別途処理が必要です
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );

          case "table_row":
            return (
              <tr key={id} className="border-b border-gray-200">
                {value.cells?.map((cell: unknown, i: number) => (
                  <td key={i} className="px-4 py-2 text-sm">
                    {(cell as any)?.map((text: NotionText) => text.text.content).join("")}
                  </td>
                ))}
              </tr>
            );

          case "synced_block":
            return (
              <div key={id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">同期ブロック</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>同期されたブロックの内容は別途処理が必要です</p>
                </div>
              </div>
            );

          case "template":
            return (
              <div key={id} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">テンプレート</span>
                </div>
                <div className="text-sm text-green-600">
                  <p>テンプレートの内容は別途処理が必要です</p>
                </div>
              </div>
            );

          case "link_to_page":
            return (
              <div key={id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm text-blue-700">
                    ページリンク: {(value as any).page_id || "不明なページ"}
                  </span>
                </div>
              </div>
            );

          case "child_page":
            return (
              <div key={id} className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-purple-700">
                    子ページ: {(value as any).title || "タイトルなし"}
                  </span>
                </div>
              </div>
            );

          case "child_database":
            return (
              <div key={id} className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <span className="text-sm text-orange-700">
                    子データベース: {(value as any).title || "タイトルなし"}
                  </span>
                </div>
              </div>
            );

          case "equation":
            return (
              <div key={id} className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <code className="text-lg font-mono bg-white px-3 py-2 rounded border">
                    {(value as any).expression || "数式"}
                  </code>
                </div>
              </div>
            );

          case "video":
            const videoUrl = (value as any).type === "external" ? (value as any).external.url : (value as any).file.url;
            return (
              <div key={id} className="my-8">
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="動画"
                  />
                </div>
                {(value as any).caption?.[0]?.text?.content && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    {(value as any).caption[0].text.content}
                  </p>
                )}
              </div>
            );

          case "file":
            const fileUrl = (value as any).type === "external" ? (value as any).external.url : (value as any).file.url;
            const fileName = (value as any).name || "ファイル";
            return (
              <div key={id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {fileName}
                  </a>
                </div>
              </div>
            );

          case "pdf":
            const pdfUrl = (value as any).type === "external" ? (value as any).external.url : (value as any).file.url;
            return (
              <div key={id} className="my-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-red-700">PDFファイル</span>
                  </div>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDFを開く
                  </a>
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
