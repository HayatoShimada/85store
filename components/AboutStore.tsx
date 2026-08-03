export default function AboutStore() {
  return (
    <div className="grid lg:grid-cols-[1fr_minmax(0,300px)] gap-12 lg:gap-16 items-start">

      <div className="max-w-2xl">
        <p className="text-xl md:text-2xl font-bold text-secondary leading-relaxed tracking-tight">
          「オーセンティック + アルファ」
        </p>
        <div className="mt-8 space-y-6 text-charcoal leading-loose">
          <p>
            シンプルで普遍的なデザインの古着と、トレンド感のある新品を中心に選定。
          </p>
          <p>
            ずっと好きなものと、今好きなものをバランス良くミックスし、変化する感性を表現する。それが私たちのセレクト基準です。
          </p>
          <p>
            洋服が軸にはありますが、場所（ハコ）の中に様々な物・人・感性が集まることで、コンセプトの変化を受け入れながら進んでいくことを是としています。
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-secondary">取り扱いブランド</h3>
        <ul className="mt-4 space-y-2 text-sm text-charcoal leading-relaxed">
          <li>River</li>
          <li>VOIRY</li>
          <li>SOWBOW</li>
          <li>Macmahon Knitting Mills</li>
          <li>Building</li>
        </ul>

        <h3 className="text-lg font-bold text-secondary mt-8">古着</h3>
        <ul className="mt-4 space-y-2 text-sm text-charcoal leading-relaxed">
          <li>アメリカ古着</li>
          <li>ヨーロッパ古着</li>
          <li>国内ドメブラ古着</li>
        </ul>
      </div>
    </div>
  );
}
