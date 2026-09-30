"use client";

import { useEffect, useRef, useState } from "react";

// 記事の画像（.image-zoom のボタン）をクリック・タップしたら拡大表示する
// 本文はサーバーで生成したHTMLなので、個別にイベントを付けずに document でまとめて受け取る
export default function ImageLightbox() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>(".image-zoom");
      // リンクの中の画像はリンクを優先する
      if (!button?.dataset.zoomSrc || button.closest("a")) return;

      triggerRef.current = button;
      setImage({ src: button.dataset.zoomSrc, alt: button.querySelector("img")?.alt ?? "" });
      dialogRef.current?.showModal();
      document.documentElement.style.overflow = "hidden";
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      aria-label="画像の拡大表示"
      onClose={() => {
        document.documentElement.style.overflow = "";
        setImage(null);
        triggerRef.current?.focus(); // 閉じたら元の画像にフォーカスを戻す
      }}
      // 画像の外側（背景）をクリックしたら閉じる
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/90"
    >
      <div className="grid h-full w-full place-items-center p-4 sm:p-10" onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        {image && (
          // 拡大表示は元画像の比率のまま画面に収める（next/image は幅指定が必要なため使わない）
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.src} alt={image.alt} className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] object-contain sm:max-h-[calc(100dvh-5rem)] sm:max-w-[calc(100vw-5rem)]" />
        )}
      </div>
      <button
        type="button"
        onClick={close}
        autoFocus
        className="btn btn-inverse fixed top-4 right-4 min-w-11"
        aria-label="拡大表示を閉じる"
      >
        閉じる
      </button>
    </dialog>
  );
}
