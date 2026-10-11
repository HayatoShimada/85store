# AI 検索（オンラインストアの商品を、ことばの意味で探す）

`https://search.85-store.com/v1/search?q=冬に着る暖かいアウター` → `{ query, results: [{ handle, score }], searched, ms }`

ショップ（85store-theme の `sections/ai-search.liquid`）の検索窓から呼ぶ。テーマは、返ってきたハンドルの順に商品カードを出す。

## しくみ

1. 販売中の商品を Storefront API から読む（トークンなしで読める範囲。5分キャッシュ）
2. 商品の属性・ブランド・素材を KV（キー `attributes`）から読む
3. 検索語と商品を Workers AI の **Clef**（`@cf/cloudflare/clef-flash`。判定用のモデル）に渡し、商品ごとに「検索の意図に合うか」の確率を出す。30点ずつに分けて並列に聞く（約290点で約3秒）
4. 確率 0.3 以上を高い順に最大48点返す
5. 1つ目のリクエストで「検索語が、商品を探す意味のあることばか」も聞き、0.2 未満なら何も返さない（でたらめな文字列でも商品の確率が 0.8 を超えることがあるため。「Lee」「XL」は 0.3 前後、「今日の天気」は 0.04）

- 同じ検索語の結果は1時間キャッシュする（商品・属性が変わったら使わない。並べ方を変えたら `src/index.ts` の `RANKING_VERSION` を上げる）
- 1つの IP から1分に20回まで（キャッシュに当たった検索は数えない）
- CORS は `shop.85-store.com`・`ctixqe-p0.myshopify.com`・テーマのプレビュー（`*.shopifypreview.com`）だけ

## 商品の属性を更新する

属性（種類・色・柄・テイスト・季節・厚さ・シルエット・系統）は、[rocm_opencv_server](https://github.com/HayatoShimada/rocm_opencv_server) が Clef で商品の写真と説明から判定する。新しい商品を入れたら:

```bash
# rocm_opencv_server で（判定済みの商品は取り直さない）
uv run --env-file .env --group clip --group clef-local python -m scripts.shopify_product_attributes --all
uv run --env-file .env python -m scripts.shopify_product_attributes --all --export data/product-attributes/search-attributes.json

# ここで
npm run upload-attributes -- ~/orca/rocm_opencv_server/data/product-attributes/search-attributes.json
```

属性の無い商品も、商品名・種類・説明だけで検索の対象になる。

## 開発・デプロイ

```bash
npm install
npm test          # 並べ替え・CORS の単体テスト
npm run typecheck
npm run dev       # http://localhost:8787（Workers AI と KV は本番のものを使う）
npm run deploy
```

- KV: `85store-product-search-attributes`
- 費用: Workers AI（Clef）は検索1回で入力 約3万トークン。キャッシュに当たれば使わない
