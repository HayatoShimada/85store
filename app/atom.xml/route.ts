import { Feed } from 'feed';
import { getBlogPosts } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // サイトの基本情報
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://85store.com';
    const siteName = '85-Store Blog';
    const siteDescription = '85-Storeの最新ブログ記事をお届けします';
    
    // Feedインスタンスを作成
    const feed = new Feed({
      title: siteName,
      description: siteDescription,
      id: siteUrl,
      link: siteUrl,
      language: 'ja',
      favicon: `${siteUrl}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, 85-Store`,
      updated: new Date(),
      generator: '85-Store Feed Generator',
      feedLinks: {
        rss2: `${siteUrl}/feed.xml`,
        atom: `${siteUrl}/atom.xml`,
      },
      author: {
        name: '85-Store',
        link: siteUrl,
      },
    });

    // ブログポストを取得
    const posts = await getBlogPosts(50); // 最新50件を取得

    // 各ブログポストをフィードに追加
    posts.forEach((post) => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      
      feed.addItem({
        title: post.title,
        id: post.id,
        link: postUrl,
        description: post.excerpt,
        content: post.excerpt,
        author: [
          {
            name: post.author,
          },
        ],
        date: new Date(post.date),
        category: [
          ...(post.category ? [{ name: post.category }] : []),
          ...post.tags.map(tag => ({ name: tag })),
        ],
        image: post.coverImage || undefined,
      });
    });

    // Atom 1.0形式でフィードを生成
    const atom = feed.atom1();

    return new NextResponse(atom, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error('Error generating Atom feed:', error);
    return new NextResponse('Error generating Atom feed', { status: 500 });
  }
}

