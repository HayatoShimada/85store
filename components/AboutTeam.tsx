import Image from 'next/image';

export default function AboutTeam() {
  return (
    <section>
      <p className="mb-6">
        &ldquo;会社員を辞めたいが、やりたいことが無い&rdquo;ゆいまる<br />
        &ldquo;洋服屋をやりたいが、時間が無い&rdquo;はやとの夫婦と<br />
        &ldquo;決まった時間に投薬が必要な&rdquo;スヌー（猫）の３人が楽しみながら生きる事を中心にデザインされたお店になります。
      </p>

      <div className="grid grid-cols-1 gap-6">
        {/* ゆいまる */}
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <div className="relative w-56 h-[280px] md:w-32 md:h-40 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src="/images/yuimaru.jpg"
              alt="ゆいまる"
              fill
              className="object-cover"
            />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg flex-1 w-full">
            <h4 className="font-bold text-secondary mb-3 ">
              ゆいまる（販売担当・店主）
            </h4>
            <p className="mb-2">
              長年接客業で会社員として勤めながら、毎日数字に追われ、人間関係にも疲れストレスで突発性難聴も発症。その後会社員を辞める決意を固めて、アパレルという異業種に挑戦。
            </p>
            <p className="mb-2">
              洋服は畳めません（練習中）が、販売・接客が好き。<br />
              前職では、顧客満足度(NPS)の上位常連で、全国規模の接客コンテストで入賞するなど、人と接し、その人が笑顔で帰ってくれる、来てよかったと感じる接客に定評がある。
            </p>
            <p className="text-sm text-gray-600">
              基本性格はギャル。
            </p>
          </div>
        </div>

        {/* はやと */}
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <div className="relative w-56 h-[280px] md:w-32 md:h-40 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src="/images/hayamaru.jpg"
              alt="はやと"
              fill
              className="object-cover"
            />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg flex-1 w-full">
            <h4 className="font-bold text-secondary mb-3 ">
              はやと（仕入れ・EC担当）
            </h4>
            <p className="mb-2">
              某総合機械メーカーで、AIとロボットの自律制御の開発を行うなど、機械とプログラムに滅法強い85-Storeの頭脳。
            </p>
            <p className="mb-2">
              以前はアパレルメーカーに勤めていたり、デザイン雑貨のお店に勤めていたり、セレクトショップに勤めていたり、多様なデザイン視点とモノづくりの視点から独自の審美眼を培う。
            </p>
            <p className="text-sm text-gray-600">
              考えすぎてショートするのが偶に瑕。<br />
              平日は会社員。85-Storeには土日のみ参加。
            </p>
          </div>
        </div>

        {/* スヌー */}
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <div className="relative w-56 h-[280px] md:w-32 md:h-40 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src="/images/snoo.jpg"
              alt="スヌー"
              fill
              className="object-cover"
            />
          </div>
          <div className="bg-gray-50 p-6 rounded-lg flex-1 w-full">
            <h4 className="font-bold text-secondary mb-3 ">
              スヌー（店長）
            </h4>
            <p className="mb-2">
              職業は猫。裏の顔は名探偵(迷探偵)。85-Storeの店長も務めるパラレルワーカー。基本的にはツンが多めのまれにデレのビビりまん。
            </p>
            <p className="mb-2">
              生まれつき心臓が肥大する疾患を持つ。<br />
              平常時の心拍数が高く、心臓が肺を圧迫し、少しの運動で口を開ける（息が速くなる）症状を抑えるための薬（よくなーると呼んでいる）を処方されている。
            </p>
            <p className="mb-2">
              毎日決まった時間の処方が必要で、時間をコントロールできる働き方としての85-Storeの中心にいる存在。
            </p>
            <p className="text-sm text-gray-600">
              数年の命と言われていたが、5歳になった今もなんだかんだで元気。<br />
              5歳なのに永遠のベイビー。声が子猫で可愛すぎる。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
