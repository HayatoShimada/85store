import Image from 'next/image';

export default function AboutUs() {
  return (
    <div className="grid lg:grid-cols-[1fr_minmax(0,300px)] gap-12 lg:gap-16 items-start">
      <div className="max-w-2xl">
        <p className="text-xl md:text-2xl font-bold text-secondary leading-relaxed tracking-tight">
          もう一度洋服が好きになれる場所
        </p>
        <div className="mt-8 space-y-6 text-charcoal leading-loose">
          <p>
            「昔は洋服が好きだったけれど」
            <br />
            「子供ができてから服を買わなくなった」
            <br />
            「自分の好きな服がわからなくなった」
            <br />
          </p>
          <p>
            そんな方がもう一度洋服の楽しさを再発見できるように。
          </p>
          <p>
            手に取りやすい価格帯で、みんなが楽しめる。
          </p>
          <p>
            85-Storeはそんな洋服を提案するセレクトショップです。
          </p>
        </div>
      </div>
      <figure className="w-full max-w-md mx-auto lg:mx-0">
        <div className="relative aspect-square overflow-hidden rounded-sm">
          <Image
            src="/images/shop.jpg"
            alt="85-Store 店内の様子"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 400px"
          />
        </div>

      </figure>
    </div>
  );
}
