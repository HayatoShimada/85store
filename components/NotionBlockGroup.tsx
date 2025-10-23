import React from "react";
import { NotionBlockRenderer } from "./NotionBlockRenderer";

interface NotionBlockGroupProps {
  blocks: any[];
  startIndex?: number;
  endIndex?: number;
}


export function NotionBlockGroup({ blocks, startIndex = 0, endIndex }: NotionBlockGroupProps) {
  const blocksToRender = blocks.slice(startIndex, endIndex);
  
  return (
    <>
      {blocksToRender.map((block, index) => {
        const { type } = block;
        
        // リストアイテムの場合は、同じタイプの連続するブロックをグループ化
        if (type === "bulleted_list_item" || type === "numbered_list_item") {
          const listItems = [];
          let currentIndex = startIndex + index;
          
          // 同じタイプの連続するブロックを収集
          while (currentIndex < blocks.length && blocks[currentIndex].type === type) {
            listItems.push(blocks[currentIndex]);
            currentIndex++;
          }
          
          // リストコンテナをレンダリング
          const ListComponent = type === "bulleted_list_item" ? "ul" : "ol";
          const listClassName = type === "bulleted_list_item" 
            ? "list-disc list-inside mb-4" 
            : "list-decimal list-inside mb-4";
          
          return (
            <ListComponent key={`${type}-${index}`} className={listClassName}>
              {listItems.map((item) => (
                <NotionBlockRenderer key={item.id} block={item} />
              ))}
            </ListComponent>
          );
        }
        
        // 通常のブロックをレンダリング
        return <NotionBlockRenderer key={block.id} block={block} />;
      })}
    </>
  );
}
