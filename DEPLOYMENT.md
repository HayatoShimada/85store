# Vercel自動デプロイ設定ガイド

## 概要
このプロジェクトは、GitHubにプッシュした際に自動でVercelにデプロイされるように設定されています。
Vercelの自動デプロイ機能を使用して、GitHub Actionsの複雑な設定なしで簡単にデプロイできます。

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

### 3. 環境変数の設定手順
1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」タブをクリック
3. 左サイドバーの「Environment Variables」をクリック
4. 各環境変数を追加：
   - Name: `NOTION_API_KEY`
   - Value: `your_actual_notion_api_key`
   - Environment: `Production`, `Preview`, `Development`（すべて選択）
5. 「Save」をクリック
6. 他の環境変数も同様に追加

## デプロイの流れ

### 自動デプロイ（推奨）
- `main`ブランチにプッシュすると自動でVercelにデプロイされます
- プルリクエストを作成するとプレビューデプロイが作成されます
- Vercelが自動的にGitHubリポジトリを監視してデプロイを実行

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

### 自動デプロイが動作しない場合
1. VercelプロジェクトでGitHubリポジトリが正しく連携されているか確認
2. リポジトリの権限設定を確認
3. Vercelダッシュボードの「Deployments」タブでデプロイ履歴を確認

## 設定ファイルの説明

- `vercel.json`: Vercelの設定ファイル（ビルド設定、環境変数参照）
- `scripts/download-notion-images.ts`: Notion画像のダウンロードスクリプト

## 注意事項
- 本番環境では必ず環境変数を設定してください
- APIキーなどの機密情報はGitHubにコミットしないでください
- デプロイ前にローカルでテストすることを推奨します
- Vercelの自動デプロイはGitHubのプッシュイベントに基づいて動作します
