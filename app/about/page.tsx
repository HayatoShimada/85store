export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="section-padding max-container py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-8">
            About Us
          </h1>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              85-Storeについて
            </h2>
            
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                2025年9月9日に富山県井波に物件を取得し、開業準備中。
              </p>
              
              <div className="bg-white rounded-lg p-6 border-l-4 border-primary">
                <p className="text-lg font-medium text-gray-800 italic">
                  「今好きなもの」が「ずっと好きなもの」をつくる
                </p>
              </div>
              
              <p>
                このテーマのもと、トレンドを抑えた中古衣料と<br />
                ずっと使える新品衣料という2つの軸で<br />
                <strong className="text-gray-800">「むすんでひらく感性」</strong>を表現する衣料品店です。
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-500">
              まもなくオープン予定です。お楽しみに。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
