"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface HeroSectionProps {
  subtitle?: string;
  transitionInterval?: number; // ミリ秒単位
}

// /public/heroフォルダ内の画像パス
const HERO_IMAGES = [
  "/hero/HeroSample.jpg",
  "/hero/HeroSample2.jpg",
];

export default function HeroSection({ 
  subtitle = "Short-Term & Long-Term",
  transitionInterval = 5000 // デフォルト5秒
}: HeroSectionProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // 画像を自動的に切り替える
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % HERO_IMAGES.length
      );
    }, transitionInterval);

    return () => clearInterval(interval);
  }, [transitionInterval]);

  return (
    <section className="relative h-screen flex items-center justify-center -mt-16 overflow-hidden">
      {/* 画像スライダー */}
      <div className="absolute inset-0 z-0">
        {HERO_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex && isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt={`Hero background ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              quality={90}
            />
          </div>
        ))}
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-black/40 z-10" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-20 text-center text-white">
        <h1 className="md:text-2xl font-bold mb-4 tracking-wider">
          <span className="font-futura text-white">&ldquo;今好きなもの&rdquo;が&ldquo;ずっと好きなもの&rdquo;をつくる</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-noto text-white">
          {subtitle}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="https://shop.85-store.com/" className="btn-primary">
            Online Shop
          </Link>
          <Link href="/blog" className="btn-outline border-white text-white hover:bg-white hover:text-charcoal">
            Blog
          </Link>
        </div>
      </div>

      {/* インジケーター（オプション） */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? "bg-white w-8" 
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`画像 ${index + 1} に切り替え`}
          />
        ))}
      </div>
    </section>
  );
}