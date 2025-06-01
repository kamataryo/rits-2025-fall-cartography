#!/bin/bash

# ビルドスクリプト - 全スライドのHTML、PDF、PPTX生成

echo "🚀 スライドビルドを開始します..."

# 出力ディレクトリの作成
mkdir -p output/html
mkdir -p output/pdf
mkdir -p output/pptx

# HTML生成
echo "📄 HTML生成中..."
npm run build

# PDF生成
echo "📑 PDF生成中..."
npm run build:pdf

# PPTX生成
echo "📊 PPTX生成中..."
npm run build:pptx

echo "✅ ビルド完了！"
echo ""
echo "生成されたファイル:"
echo "- HTML: output/html/"
echo "- PDF: output/pdf/"
echo "- PPTX: output/pptx/"
