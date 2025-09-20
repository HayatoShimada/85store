# Vercel自動デプロイ設定ガイド

## 概要
このプロジェクトは、GitHubにプッシュした際に自動でVercelにデプロイされるように設定されています。

## 設定方法

### 1. Vercelプロジェクトの作成
1. [Vercel](https://vercel.com)にアクセスしてログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト名を設定（例：85store）
5. 「Deploy」をクリック

### 2. 環境変数の設定
Vercelダッシュボードで以下の環境変数を設定してください：

#### 必須環境変数
```
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
SHOPIFY_STORE_DOMAIN=your_shopify_store_domain
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_shopify_access_token
```

#### メール設定（お問い合わせフォーム用）
```
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_email@example.com
```

### 3. GitHub Secretsの設定（GitHub Actions使用時）
GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」で以下を設定：

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_notion_database_id
SHOPIFY_STORE_DOMAIN=your_shopify_store_domain
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_shopify_access_token
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=your_email@example.com
```

### 4. Vercelトークンの取得方法
1. Vercelダッシュボードで「Settings」→「Tokens」
2. 「Create Token」をクリック
3. トークン名を入力して「Create」
4. 生成されたトークンをコピー

### 5. VercelプロジェクトIDの取得方法
1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「General」
3. 「Project ID」をコピー

## デプロイの流れ

### 自動デプロイ（推奨）
- `main`ブランチにプッシュすると自動でVercelにデプロイされます
- プルリクエストを作成するとプレビューデプロイが作成されます

### 手動デプロイ
```bash
# Vercel CLIを使用
npm install -g vercel
vercel --prod
```

## トラブルシューティング

### ビルドエラーが発生する場合
1. 環境変数が正しく設定されているか確認
2. `npm run build`をローカルで実行してエラーを確認
3. Vercelのビルドログを確認

### 画像が表示されない場合
1. Notion APIキーが正しく設定されているか確認
2. `npm run download-images`が実行されているか確認

## 設定ファイルの説明

- `vercel.json`: Vercelの設定ファイル
- `.github/workflows/deploy.yml`: GitHub Actionsの設定ファイル
- `scripts/download-notion-images.ts`: Notion画像のダウンロードスクリプト

## 注意事項
- 本番環境では必ず環境変数を設定してください
- APIキーなどの機密情報はGitHubにコミットしないでください
- デプロイ前にローカルでテストすることを推奨します
