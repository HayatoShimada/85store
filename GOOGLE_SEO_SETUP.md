# Google SEO設定ガイド

## 1. Google Search Console（最重要）

### 登録手順
1. [Google Search Console](https://search.google.com/search-console)にアクセス
2. プロパティを追加
   - URLプレフィックス方式を推奨: `https://85-store.com`
3. 所有権の確認
   - **推奨方法**: HTMLタグ方式
     - Search Consoleから提供されるメタタグを取得
     - 例: `<meta name="google-site-verification" content="xxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />`
     - 環境変数に追加: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
     - `app/layout.tsx`で既に対応済み（自動的にメタタグが追加されます）
   - またはDNSレコード方式（ドメイン全体を管理する場合）

### サイトマップの送信
1. Search Consoleにログイン
2. 左メニューから「サイトマップ」を選択
3. 以下のURLを送信:
   - `https://85-store.com/sitemap.xml`
   - `https://85-store.com/sitemap-0.xml`（必要に応じて）

### インデックス登録のリクエスト
1. 「URL検査」ツールを使用
2. 主要ページを個別にインデックス登録リクエスト:
   - `/` (ホーム)
   - `/about`
   - `/blog`
   - `/contact`

### 設定確認事項
- [ ] モバイルフレンドリーテスト（既に対応済み）
- [ ] 構造化データの検証（StructuredData.tsxで実装済み）
- [ ] ページの表示速度（Core Web Vitals）

---

## 2. Google Analytics 4（GA4）

### 現在の設定確認
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`環境変数が設定されているか確認
- `app/layout.tsx`で既に実装済み

### 推奨設定
1. **イベントの設定**
   - お問い合わせフォーム送信
   - オンラインストアへの遷移
   - ブログ記事の閲覧

2. **コンバージョン設定**
   - お問い合わせ完了
   - オンラインストアでの購入（可能であれば）

3. **オーディエンス設定**
   - 富山県在住者
   - 古着・ファッションに興味のあるユーザー

---

## 3. Google Business Profile（旧Googleマイビジネス）

### 登録手順
1. [Google Business Profile](https://www.google.com/business/)にアクセス
2. ビジネス情報を登録:
   - **店舗名**: 85-Store（ハコストア）
   - **カテゴリ**: 古着店、セレクトショップ
   - **住所**: 富山県南砺市井波（実際の住所を入力）
   - **電話番号**: （実際の電話番号）
   - **営業時間**: 週末限定（金18:00-24:00、土日8:00-24:00）
   - **ウェブサイト**: https://85-store.com
   - **説明**: 富山県南砺市井波の古着・セレクトショップ。オーセンティックな古着とニューアイテムを提案。

### 最適化ポイント
- 高品質な写真をアップロード（店舗外観、内装、商品）
- 定期的に投稿を更新
- カスタマーレビューへの対応
- Q&A機能の活用

---

## 4. Google Tag Manager（オプション）

### メリット
- コードを変更せずにタグを管理
- 複数のマーケティングツールを一元管理

### 設定手順
1. [Google Tag Manager](https://tagmanager.google.com/)でアカウント作成
2. コンテナを作成
3. GTMコードを`app/layout.tsx`に追加

---

## 5. Google Merchant Center（オンラインストアがある場合）

### 対象
- オンラインストア（https://shop.85-store.com/）がある場合

### 設定内容
1. 商品データフィードの作成
2. 商品情報の登録
3. Googleショッピングでの表示

---

## 6. 構造化データの検証

### 実装済み
- Organization
- LocalBusiness
- WebSite
- Blog

### 検証方法
1. [Google リッチリザルトテスト](https://search.google.com/test/rich-results)で確認
2. 主要ページをテスト:
   - `/` (Organization, LocalBusiness, WebSite)
   - `/blog` (Blog)
   - `/about` (Organization)

---

## 7. パフォーマンス最適化

### Core Web Vitalsの確認
1. Search Consoleの「エクスペリエンス」セクションで確認
2. [PageSpeed Insights](https://pagespeed.web.dev/)でテスト
3. 改善が必要な場合は対応

---

## 優先順位

### 即座に実施（高優先度）
1. ✅ Google Search Consoleへの登録とサイトマップ送信
2. ✅ Google Business Profileの登録
3. ✅ 構造化データの検証

### 短期間で実施（中優先度）
4. Google Analytics 4の詳細設定
5. 主要ページのインデックス登録リクエスト

### 長期的に実施（低優先度）
6. Google Tag Managerの導入
7. Google Merchant Centerの設定（オンラインストアがある場合）

---

## 環境変数の設定

以下の環境変数を`.env.local`または本番環境の環境変数に追加してください:

```bash
# Google Search Console 所有権確認用
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Analytics（既に設定済みの場合）
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# サイトURL
NEXT_PUBLIC_SITE_URL=https://85-store.com
```

### 設定方法
1. Google Search Consoleで所有権確認のメタタグを取得
2. `content`属性の値を`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`に設定
3. デプロイ後にSearch Consoleで所有権を確認

---

## 注意事項

- Google Search Consoleの所有権確認は必須
- サイトマップはビルド後に自動生成されるため、デプロイ後に送信
- Google Business Profileは実際の店舗情報が必要
- 定期的にSearch Consoleを確認し、エラーや警告に対応
- 環境変数は本番環境にも設定することを忘れずに

