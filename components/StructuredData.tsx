interface StructuredDataProps {
  type: 'Organization' | 'LocalBusiness' | 'WebSite' | 'Blog';
  data?: Record<string, any>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85-store.com';

  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: '85-Store（ハコストア）',
          alternateName: '85-Store',
          url: baseUrl,
          logo: `${baseUrl}/logo.svg`,
          description: '富山県南砺市井波の古着・セレクトショップ。オーセンティックな古着とニューアイテムを提案するセレクトショップです。',
          address: {
            '@type': 'PostalAddress',
            addressRegion: '富山県',
            addressLocality: '南砺市井波',
            addressCountry: 'JP',
          },
          sameAs: [
            'https://www.instagram.com/85store_inami/',
            'https://www.facebook.com/profile.php?id=61580629616145',
            'https://www.tiktok.com/@85store85',
            'https://shop.85-store.com/',
          ],
        };

      case 'LocalBusiness':
        return {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: '85-Store（ハコストア）',
          image: `${baseUrl}/logo.svg`,
          '@id': baseUrl,
          url: baseUrl,
          telephone: '',
          priceRange: '¥',
          address: {
            '@type': 'PostalAddress',
            addressRegion: '富山県',
            addressLocality: '南砺市井波',
            addressCountry: 'JP',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: '',
            longitude: '',
          },
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Saturday', 'Sunday'],
            opens: '10:00',
            closes: '17:00',
          },
          description: '富山県南砺市井波の古着・セレクトショップ。オーセンティックな古着とニューアイテムを提案するセレクトショップです。',
        };

      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: '85-Store',
          url: baseUrl,
          description: '富山県南砺市井波の古着・セレクトショップ。オーセンティックな古着とニューアイテムを提案するセレクトショップです。',
          publisher: {
            '@type': 'Organization',
            name: '85-Store（ハコストア）',
          },
        };

      case 'Blog':
        return {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: '85-Store Blog',
          url: `${baseUrl}/blog`,
          description: '富山県南砺市井波の古着・セレクトショップ「85-Store」のブログ。スタイリング情報やトレンドをお届けします。',
          publisher: {
            '@type': 'Organization',
            name: '85-Store（ハコストア）',
          },
        };

      default:
        return null;
    }
  };

  const structuredData = { ...getStructuredData(), ...data };

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

