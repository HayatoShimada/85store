'use client';

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const PLACEHOLDER = '/images/placeholder.svg';

interface FallbackImageProps extends Omit<ImageProps, "src" | "onError"> {
  src?: string;
}

// 画像の読み込みに失敗したらプレースホルダーに差し替える
export default function FallbackImage({ src, ...props }: FallbackImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      {...props}
      src={!hasError && src ? src : PLACEHOLDER}
      onError={() => setHasError(true)}
    />
  );
}
