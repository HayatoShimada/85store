import { STORE, STORE_OPEN_DAYS_SCHEMA, STORE_TELEPHONE_INTL } from "@/lib/store-info";

interface StructuredDataProps {
  type: 'Organization' | 'LocalBusiness' | 'WebSite' | 'Blog' | 'BlogPosting' | 'BreadcrumbList' | 'FAQPage' | 'ItemList' | 'Event';
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
  STORE.sns.spotify,
  STORE.onlineShopUrl,
];

// 取り扱っているもの（AI や検索が「何の店か」を判断する手がかり）
const knowsAbout = ['古着', 'セレクトショップ', 'ヴィンテージ', ...STORE.vintage, ...STORE.brands];

const paymentAccepted = ['現金', 'クレジットカード', ...STORE.payment.creditCards, '電子マネー', ...STORE.payment.eMoney, 'QRコード決済', ...STORE.payment.qr].join(', ');

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
        email: STORE.email,
        telephone: STORE_TELEPHONE_INTL,
        address: postalAddress,
        knowsAbout,
        sameAs,
      };

    case 'LocalBusiness':
      return {
        '@context': 'https://schema.org',
        '@type': 'ClothingStore',
        '@id': `${baseUrl}/#store`,
        name: STORE.name,
        url: baseUrl,
        alternateName: ['ハコストア', STORE.shortName],
        image: `${baseUrl}/images/shop.jpg`,
        logo: `${baseUrl}/logo.svg`,
        telephone: STORE_TELEPHONE_INTL,
        email: STORE.email,
        priceRange: STORE.priceRange,
        currenciesAccepted: 'JPY',
        paymentAccepted,
        address: postalAddress,
        hasMap: STORE.mapUrl,
        areaServed: STORE.areaServed.map((name) => ({ '@type': 'AdministrativeArea', name })),
        knowsAbout,
        keywords: '古着, 古着屋, セレクトショップ, 富山, 南砺市, 井波, ヴィンテージ',
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: '駐車場', value: true },
        ],
        // 2階の共創スペース
        containsPlace: {
          '@type': 'Place',
          name: '85-UpStore',
          url: `${baseUrl}/upstore`,
          description: '85-Store の2階にある共創スペース。ポップアップ、展示、ワークショップに使える。',
        },
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

    // 記事ごとの値は data で渡す
    case 'BlogPosting':
      return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        inLanguage: 'ja',
        publisher: { '@id': `${baseUrl}/#organization` },
      };

    case 'BreadcrumbList':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
      };

    // mainEntity（質問と回答）は data で渡す
    case 'FAQPage':
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: 'ja',
      };

    // イベントの記事（CMS の「イベント情報」）。名前・日時・会場は data で渡す
    case 'Event':
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        inLanguage: 'ja',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        organizer: { '@id': `${baseUrl}/#organization` },
      };

    // itemListElement は data で渡す
    case 'ItemList':
      return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
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
