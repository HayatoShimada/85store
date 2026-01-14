"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlternateImage, setIsAlternateImage] = useState(false);

  return (
    <header className="fixed top-0 w-full header-acrylic z-50">
      <nav className="section-padding max-container">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="富山県南砺市井波の古着・セレクトショップ 85-Store ロゴ"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <Image
              src={isAlternateImage ? "/headersnoo2.png" : "/headersnoo.png"}
              alt="富山県南砺市井波の古着・セレクトショップ 85-Store（ハコストア）"
              width={120}
              height={40}
              className="h-10 w-auto cursor-pointer"
              style={{ width: 'auto' }}
              onClick={(e) => {
                e.preventDefault();
                setIsAlternateImage(!isAlternateImage);
              }}
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-charcoal hover:text-primary transition-colors font-inter uppercase tracking-wider text-sm">
              Home
            </Link>
            <Link href="https://shop.85-store.com/" className="text-charcoal hover:text-primary transition-colors font-inter uppercase tracking-wider text-sm">
              Online Shop
            </Link>
            <Link href="/blog" className="text-charcoal hover:text-primary transition-colors font-inter uppercase tracking-wider text-sm">
              Blog
            </Link>
            <Link href="/about" className="text-charcoal hover:text-primary transition-colors font-inter uppercase tracking-wider text-sm">
              About
            </Link>
            <Link href="/reserve" className="text-charcoal hover:text-primary transition-colors font-inter uppercase tracking-wider text-sm">
              Reserve
            </Link>
            <Link href="/upstore" className="text-charcoal hover:text-primary transition-colors font-inter uppercase tracking-wider text-sm">
              2nd Floor
            </Link>
            <Link href="/contact" className="text-charcoal hover:text-primary transition-colors font-inter uppercase tracking-wider text-sm">
              Contact
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6 text-charcoal"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-charcoal hover:text-primary transition-colors"
              >
                <span className="font-inter uppercase tracking-wider">Home</span>
                <span className="block text-xs text-gray-500 mt-0.5">ホーム</span>
              </Link>
              <Link
                href="https://shop.85-store.com/"
                className="block px-3 py-2 text-charcoal hover:text-primary transition-colors"
              >
                <span className="font-inter uppercase tracking-wider">Online Shop</span>
                <span className="block text-xs text-gray-500 mt-0.5">オンラインストア</span>
              </Link>
              <Link
                href="/blog"
                className="block px-3 py-2 text-charcoal hover:text-primary transition-colors"
              >
                <span className="font-inter uppercase tracking-wider">Blog</span>
                <span className="block text-xs text-gray-500 mt-0.5">ブログ</span>
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-charcoal hover:text-primary transition-colors"
              >
                <span className="font-inter uppercase tracking-wider">About</span>
                <span className="block text-xs text-gray-500 mt-0.5">店舗について</span>
              </Link>
              <Link
                href="/reserve"
                className="block px-3 py-2 text-charcoal hover:text-primary transition-colors"
              >
                <span className="font-inter uppercase tracking-wider">Reserve</span>
                <span className="block text-xs text-gray-500 mt-0.5">予約</span>
              </Link>
              <Link
                href="/upstore"
                className="block px-3 py-2 text-charcoal hover:text-primary transition-colors"
              >
                <span className="font-inter uppercase tracking-wider">2nd Floor</span>
                <span className="block text-xs text-gray-500 mt-0.5">2階店舗</span>
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-charcoal hover:text-primary transition-colors"
              >
                <span className="font-inter uppercase tracking-wider">Contact</span>
                <span className="block text-xs text-gray-500 mt-0.5">お問い合わせ</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}