import ShopifyProductCard from "./ShopifyProductCard";
import { Product } from "@/types/notion";
import Link from "next/link";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="section-padding max-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary dark:text-white mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Featured products from our store
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.slice(0, 6).map((product) => (
            <ShopifyProductCard
              key={product.id}
              product={product}
              availableForSale={true}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="https://shop.85-store.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            View all Products in Online Shop
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
