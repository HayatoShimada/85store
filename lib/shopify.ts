import { createStorefrontApiClient } from "@shopify/storefront-api-client";

const client = createStorefrontApiClient({
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN || "",
  apiVersion: "2024-01",
  publicAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
});

export async function getProducts(first: number = 10) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            description
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  originalSrc
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  const { data, errors } = await client.request(query, {
    variables: { first },
  });

  if (errors) {
    throw new Error(errors.message || "Failed to fetch products");
  }

  return data.products.edges.map((edge: any) => edge.node);
}

export async function getProduct(handle: string) {
  const query = `
    query getProduct($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        description
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 10) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
              availableForSale
            }
          }
        }
      }
    }
  `;

  const { data, errors } = await client.request(query, {
    variables: { handle },
  });

  if (errors) {
    throw new Error(errors.message || "Failed to fetch product");
  }

  return data.productByHandle;
}

export async function createCheckout(variantId: string, quantity: number = 1) {
  const mutation = `
    mutation createCheckout($variantId: ID!, $quantity: Int!) {
      checkoutCreate(input: {
        lineItems: [{
          variantId: $variantId,
          quantity: $quantity
        }]
      }) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          field
          message
        }
      }
    }
  `;

  const { data, errors } = await client.request(mutation, {
    variables: { variantId, quantity },
  });

  if (errors) {
    throw new Error(errors.message || "Failed to create checkout");
  }

  if (data.checkoutCreate.checkoutUserErrors.length > 0) {
    throw new Error(data.checkoutCreate.checkoutUserErrors[0].message);
  }

  return data.checkoutCreate.checkout;
}