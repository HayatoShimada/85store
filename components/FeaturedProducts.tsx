import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/microcms";
import { getProductUrl } from "@/lib/shopify";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="section-padding max-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600">
            Featured products from our store
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="https://shop.85-store.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
            View all Products in Online Shop
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.images?.[0]?.url || '/images/placeholder.svg';
  const productUrl = product.shopifyHandle
    ? getProductUrl(product.shopifyHandle)
    : '#';

  return (
    <article className="card-acrylic group">
      <a href={productUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative h-64 w-full overflow-hidden bg-gray-100 rounded-t-lg">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        </div>
        <div className="p-6">
          {product.category && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 mb-2 inline-block">
              {product.category}
            </span>
          )}
          <h3 className="text-xl font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.price && (
            <p className="text-lg font-bold text-primary">
              ¥{product.price.toLocaleString()}
            </p>
          )}
          {product.description && (
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </a>
    </article>
  );
}
