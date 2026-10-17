import Image from 'next/image';
import Phrase from '@/components/Phrase';

const NOTE_URL = 'https://note.com/85_store/n/ne743c0caa4c0';

export default function AboutHospitality() {
  return (
    <div className="grid lg:grid-cols-[1fr_minmax(0,300px)] gap-12 lg:gap-16 items-start">
      <div className="max-w-2xl">
        <p className="text-xl md:text-2xl font-bold text-ink leading-relaxed tracking-tight text-balance">
          <Phrase>憧れの一歩をサポートする接客</Phrase>
        </p>
        <div className="mt-8 space-y-6 text-ink-2 leading-loose">
          <p>
            「洋服屋が怖い」「古着屋が怖い」「オシャレが怖い」。そう感じている方は少なくありません。けれど、そんな方にも一度は憧れた洋服があるはずです。
          </p>
          <p>
            着ること、人と会うこと、自分を表すこと。何を着るかは、どう生きるかにつながっています。
          </p>
          <p>
            その憧れをもう一度掘り起こし、最初の一歩を後押しする。85-Storeは、お客様と一緒に悩みながら洋服を選ぶお店です。
          </p>
        </div>
        <a
          href={NOTE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          note「もう一度洋服を好きになれる場所」を読む
          <span className="sr-only">（別のサイトで開きます）</span>
        </a>
      </div>
      <figure className="w-full max-w-md mx-auto lg:mx-0">
        <div className="relative aspect-[2/3] overflow-hidden bg-surface">
          <Image
            src="/images/hospitality.jpg"
            alt="店内のラックで服を選ぶスタッフ"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 300px"
          />
        </div>
      </figure>
    </div>
  );
}
