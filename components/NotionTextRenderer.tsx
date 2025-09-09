import React from "react";

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

interface NotionTextRendererProps {
  richText: NotionText[];
  className?: string;
}

export function NotionTextRenderer({ richText, className = "" }: NotionTextRendererProps) {
  if (!richText || richText.length === 0) {
    return null;
  }

  return (
    <span className={className}>
      {richText.map((text, index) => {
        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text: textContent,
        } = text;

        const textElement = textContent.link ? (
          <a
            href={textContent.link.url}
            className="text-primary hover:text-primary/80 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {textContent.content}
          </a>
        ) : (
          textContent.content
        );

        const styledElement = (
          <span
            key={index}
            className={[
              bold ? "font-bold" : "",
              italic ? "italic" : "",
              underline ? "underline" : "",
              strikethrough ? "line-through" : "",
              code ? "bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" : "",
            ].join(" ")}
            style={color !== "default" ? { color } : {}}
          >
            {textElement}
          </span>
        );

        return styledElement;
      })}
    </span>
  );
}
