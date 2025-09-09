import React from "react";
import { NotionTextRenderer } from "./NotionTextRenderer";

interface NotionBlockRendererProps {
  block: any;
  children?: React.ReactNode;
}

export function NotionBlockRenderer({ block, children }: NotionBlockRendererProps) {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p key={id} className="mb-4 leading-relaxed">
          <NotionTextRenderer richText={value.rich_text} />
        </p>
      );

    case "heading_1":
      return (
        <h1 key={id} className="text-3xl font-bold text-secondary mb-6 mt-8">
          <NotionTextRenderer richText={value.rich_text} />
        </h1>
      );

    case "heading_2":
      return (
        <h2 key={id} className="text-2xl font-bold text-secondary mb-4 mt-6">
          <NotionTextRenderer richText={value.rich_text} />
        </h2>
      );

    case "heading_3":
      return (
        <h3 key={id} className="text-xl font-bold text-secondary mb-3 mt-4">
          <NotionTextRenderer richText={value.rich_text} />
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li key={id} className="mb-2">
          <NotionTextRenderer richText={value.rich_text} />
          {children}
        </li>
      );

    case "numbered_list_item":
      return (
        <li key={id} className="mb-2">
          <NotionTextRenderer richText={value.rich_text} />
          {children}
        </li>
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
            {children}
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

    default:
      return null;
  }
}
