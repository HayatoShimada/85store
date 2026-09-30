import Image from "next/image";
import { getStorefrontProductUrl, type StorefrontProduct } from "@/lib/shopify-storefront";

// 商品名の先頭の [ブランド名] をラベルとして分ける（例: "[VOIRY] SUNDAY PANTS" → VOIRY / SUNDAY PANTS）
function splitBrand(title: string): { brand?: string; name: string } {
  const match = title.match(/^\[([^\]]+)\]\s*(.+)$/);
  return match ? { brand: match[1], name: match[2] } : { name: title };
}

const yen = new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" });

export default function ProductGrid({ products }: { products: StorefrontProduct[] }) {
  return (
    <ul className="grid-lines grid-cols-4 max-[900px]:grid-cols-2">
      {products.map((product) => {
        const { brand, name } = splitBrand(product.title);
        return (
          <li key={product.handle}>
            <a href={getStorefrontProductUrl(product.handle)} className="group grid h-full">
              <div className="media-frame aspect-[2/3]">
                {product.image && (
                  <Image
                    src={product.image.url}
                    alt={product.image.altText ?? ""}
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                  />
                )}
              </div>
              <div className="grid content-start gap-1 p-4">
                {brand && <span className="text-xs text-muted">{brand}</span>}
                <span className="font-semibold leading-normal group-hover:underline group-hover:underline-offset-4">{name}</span>
                <span className="num text-sm">{yen.format(product.price)}</span>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
