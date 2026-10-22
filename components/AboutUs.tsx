import Image from 'next/image';
import Phrase from '@/components/Phrase';

export default function AboutUs() {
  return (
    <div className="grid lg:grid-cols-[1fr_minmax(0,300px)] gap-12 lg:gap-16 items-start">
      <div className="max-w-2xl">
        <p className="text-xl md:text-2xl font-bold text-ink leading-relaxed tracking-tight">
          <Phrase>もう一度洋服を好きになれる場所</Phrase>
        </p>
        <div className="mt-8 space-y-6 text-ink-2 leading-loose">
          <p>
            <Phrase>「昔は洋服が好きだったけれど」</Phrase>
            <br />
            <Phrase>「子供ができてから服を買わなくなった」</Phrase>
            <br />
            <Phrase>「自分の好きな服がわからなくなった」</Phrase>
            <br />
          </p>
          <p>
            <Phrase>{"そんな方がもう一度洋服の楽しさを再発見できるように。"}</Phrase>
          </p>
          <p>
            <Phrase>{"手に取りやすい価格帯で、みんなが楽しめる。"}</Phrase>
          </p>
          <p>
            <Phrase>{"85-Storeはそんな洋服を提案するセレクトショップです。"}</Phrase>
          </p>
        </div>
      </div>
      <figure className="w-full max-w-md mx-auto lg:mx-0">
        <div className="relative aspect-square overflow-hidden">
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
