import Image from 'next/image';

const members = [
  {
    name: 'ゆいまる',
    role: '販売担当・店主',
    image: '/images/yuimaru.jpg',
    paragraphs: [
      '長年接客業で会社員として勤めながら、毎日数字に追われ、人間関係にも疲れストレスで突発性難聴も発症。その後会社員を辞める決意を固めて、アパレルという異業種に挑戦。',
      '洋服は畳めません（練習中）が、販売・接客が好き。前職では、顧客満足度(NPS)の上位常連で、全国規模の接客コンテストで入賞するなど、人と接し、その人が笑顔で帰ってくれる、来てよかったと感じる接客に定評がある。',
    ],
    note: '基本性格はギャル。',
  },
  {
    name: 'はやと',
    role: '仕入れ・EC担当',
    image: '/images/hayamaru.jpg',
    paragraphs: [
      '某総合機械メーカーで、AIとロボットの自律制御の開発を行うなど、機械とプログラムが得意。',
      '以前はアパレルメーカーに勤めていたり、デザイン雑貨のお店に勤めていたり、セレクトショップに勤めていたり、多様なデザイン視点とモノづくりの視点から独自の審美眼を培う。',
    ],
    note: '考えすぎてショートするのが偶に瑕。平日は会社員。85-Storeには土日のみ参加。',
  },
  {
    name: 'スヌー',
    role: '店長',
    image: '/images/snoo.jpg',
    paragraphs: [
      '職業は猫。裏の顔は名探偵(迷探偵)。85-Storeの店長も務めるパラレルワーカー。基本的にはツンが多めのまれにデレのビビりまん。',
      '生まれつき心臓が肥大する疾患を持つ。毎日決まった時間の投薬が必要で、時間をコントロールできる働き方としての85-Storeの中心にいる存在。',
    ],
    note: '数年の命と言われていたが、5歳になった今もなんだかんだで元気。5歳なのに永遠のベイビー。声が子猫で可愛すぎる。',
  },
];

export default function AboutTeam() {
  return (
    <div className="max-w-3xl">
      <p className="text-charcoal leading-loose">
        &ldquo;会社員を辞めたいが、やりたいことが無い&rdquo;ゆいまる、
        &ldquo;洋服屋をやりたいが、時間が無い&rdquo;はやとの夫婦と、
        &ldquo;決まった時間に投薬が必要な&rdquo;スヌー（猫）。
        ３人が楽しみながら生きる事を中心にデザインされたお店です。
      </p>

      <div className="mt-16 space-y-16">
        {members.map((member) => (
          <div
            key={member.name}
            className="grid sm:grid-cols-[180px_1fr] gap-6 sm:gap-10"
          >
            <div className="relative w-44 sm:w-full aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 176px, 180px"
              />
            </div>
            <div>
              <p className="text-xs tracking-[0.2em] text-gray-400">
                {member.role}
              </p>
              <h3 className="mt-1 text-lg font-bold text-secondary">
                {member.name}
              </h3>
              <div className="mt-4 space-y-3 text-sm text-charcoal leading-relaxed">
                {member.paragraphs.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                {member.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
