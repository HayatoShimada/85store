"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { Banner } from "@/types/microcms";

interface HeroSectionProps {
  banners?: Banner[];
  transitionInterval?: number;
}

// デフォルトの画像パス（bannersが渡されない場合のフォールバック）
const DEFAULT_HERO_IMAGES = [
  "/hero/HeroSample.jpg",
  "/hero/HeroSample2.jpg",
  "/hero/HeroSample3.png",
];

export default function HeroSection({
  banners,
  transitionInterval = 10000
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // バナーがあればバナーを使用、なければデフォルト画像
  const hasBanners = banners && banners.length > 0;
  const totalSlides = hasBanners ? banners.length : DEFAULT_HERO_IMAGES.length;

  // 現在のバナー情報
  const currentBanner = hasBanners ? banners[currentIndex] : null;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
    }, transitionInterval);

    return () => clearInterval(interval);
  }, [transitionInterval, totalSlides]);

  // ボタン表示の判定（バナーがない場合はデフォルトで両方表示）
  const showOnlineShopButton = currentBanner?.showOnlineShopButton ?? true;
  const showBlogButton = currentBanner?.showBlogButton ?? true;
  const showDetailButton = currentBanner?.showDetailButton && currentBanner?.detailButtonUrl;

  return (
    <section className="relative h-screen flex items-center justify-center -mt-16 overflow-hidden">
      {/* 画像スライダー */}
      <div className="absolute inset-0 z-0">
        {hasBanners ? (
          // MicroCMSバナー
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex && isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={banner.image.url}
                alt={banner.title || `富山県南砺市井波の古着・セレクトショップ 85-Store バナー ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
              />
            </div>
          ))
        ) : (
          // デフォルト画像
          DEFAULT_HERO_IMAGES.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex && isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image}
                alt={`富山県南砺市井波の古着・セレクトショップ 85-Store ヒーロー画像 ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
              />
            </div>
          ))
        )}
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-20 text-center text-white px-4">
        {currentBanner?.title ? (
          <h1 className="text-xl md:text-2xl font-bold mb-4 tracking-wider">
            <span className="font-inter text-white">{currentBanner.title}</span>
          </h1>
        ) : (
          <h1 className="md:text-2xl font-bold mb-4 tracking-wider">
            <span className="font-inter text-white">&ldquo;今好きなもの&rdquo;が&ldquo;ずっと好きなもの&rdquo;をつくる</span>
          </h1>
        )}

        {currentBanner?.subtitle ? (
          <p className="text-xl md:text-2xl mb-8 font-noto text-white">
            {currentBanner.subtitle}
          </p>
        ) : (
          <p className="text-xl md:text-2xl mb-8 font-noto text-white">
            Short-Term &amp; Long-Term
          </p>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          {showOnlineShopButton && (
            <Link href="https://shop.85-store.com/" className="btn-primary">
              Online Shop
            </Link>
          )}
          {showBlogButton && (
            <Link href="/blog" className="btn-secondary">
              Blog
            </Link>
          )}
          {showDetailButton && (
            <Link
              href={currentBanner.detailButtonUrl!}
              className="btn-secondary"
            >
              {currentBanner.detailButtonText || "詳細を見る"}
            </Link>
          )}
        </div>
      </div>

      {/* インジケーター */}
      {totalSlides > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`画像 ${index + 1} に切り替え`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
