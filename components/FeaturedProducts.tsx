import ShopifyProductCard from "./ShopifyProductCard";
import { Product } from "@/types/notion";
import { getProductUrl } from "@/lib/shopify";
import Link from "next/link";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
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
            <ShopifyProductCard
              key={product.id}
              product={product}
              availableForSale={true}
              productUrl={getProductUrl(product.shopifyHandle)}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="https://shop.85-store.com" target="_blank" rel="noopener noreferrer" className="btn-outline">
            View all Products in Online Shop
          </Link>
        </div>
      </div>
    </section>
  );
}
