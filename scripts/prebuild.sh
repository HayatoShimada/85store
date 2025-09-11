#!/bin/bash

echo "Starting prebuild process..."

# Node.jsがインストールされているか確認
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# 画像保存ディレクトリを作成
mkdir -p public/notion-images

# Notion画像をダウンロード
echo "Downloading Notion images..."
npm run download-images

if [ $? -eq 0 ]; then
    echo "Notion images downloaded successfully"
else
    echo "Warning: Failed to download some Notion images, continuing with build..."
fi

echo "Prebuild process completed"