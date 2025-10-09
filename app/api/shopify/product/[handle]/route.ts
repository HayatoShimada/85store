import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/shopify";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;

    if (!handle) {
      return NextResponse.json(
        { error: "Product handle is required" },
        { status: 400 }
      );
    }

    const product = await getProduct(handle);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // 必要な情報だけを抽出
    const productData = {
      title: product.title,
      description: product.description || "",
      price: new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: product.priceRange.minVariantPrice.currencyCode || 'JPY',
      }).format(parseFloat(product.priceRange.minVariantPrice.amount)),
      imageUrl: product.images.edges[0]?.node.originalSrc || "",
      availableForSale: product.variants.edges.some(
        (edge: any) => edge.node.availableForSale
      ),
    };

    return NextResponse.json(productData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
