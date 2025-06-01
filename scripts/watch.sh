#!/bin/bash

# ウォッチスクリプト - ファイル変更時の自動ビルド

echo "👀 ファイル監視を開始します..."
echo "スライドファイルを編集すると自動的にHTMLが生成されます"
echo "終了するには Ctrl+C を押してください"
echo ""

npm run watch
