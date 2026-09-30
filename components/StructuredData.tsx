import { STORE, STORE_OPEN_DAYS_SCHEMA } from "@/lib/store-info";

interface StructuredDataProps {
  type: 'Organization' | 'LocalBusiness' | 'WebSite' | 'Blog';
  data?: Record<string, any>;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

const postalAddress = {
  '@type': 'PostalAddress',
  postalCode: STORE.address.postalCode,
  addressRegion: STORE.address.region,
  addressLocality: STORE.address.locality,
  streetAddress: STORE.address.street,
  addressCountry: 'JP',
};

const sameAs = [
  STORE.sns.instagram,
  STORE.sns.facebook,
  STORE.sns.tiktok,
  STORE.sns.note,
  STORE.onlineShopUrl,
];

function getStructuredData(type: StructuredDataProps['type']) {
  switch (type) {
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: STORE.name,
        alternateName: STORE.shortName,
        url: baseUrl,
        logo: `${baseUrl}/logo.svg`,
        description: STORE.description,
        address: postalAddress,
        sameAs,
      };

    case 'LocalBusiness':
      return {
        '@context': 'https://schema.org',
        '@type': 'ClothingStore',
        '@id': `${baseUrl}/#store`,
        name: STORE.name,
        url: baseUrl,
        image: `${baseUrl}/images/shop.jpg`,
        priceRange: '¥¥',
        address: postalAddress,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: STORE.geo.latitude,
          longitude: STORE.geo.longitude,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: STORE_OPEN_DAYS_SCHEMA,
          opens: STORE.hours.opens,
          closes: STORE.hours.closes,
        },
        parentOrganization: { '@id': `${baseUrl}/#organization` },
        description: STORE.description,
        sameAs,
      };

    case 'WebSite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        name: STORE.shortName,
        url: baseUrl,
        inLanguage: 'ja',
        description: STORE.description,
        publisher: { '@id': `${baseUrl}/#organization` },
      };

    case 'Blog':
      return {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: '85-Store Blog',
        url: `${baseUrl}/blog`,
        inLanguage: 'ja',
        description: '富山県南砺市井波の古着・セレクトショップ「85-Store」のブログ。スタイリング情報やトレンドをお届けします。',
        publisher: { '@id': `${baseUrl}/#organization` },
      };
  }
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = { ...getStructuredData(type), ...data };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
