# 立命館大学 2025年度秋学期 ウェブカートグラフィ入門

立命館大学 2025年度秋学期の授業スライドリポジトリです。

## 📚 授業概要

本授業では、MapLibre GL JSとOpenStreetMapを使用して、現代的なウェブカートグラフィの技術を学習します。14回の授業を通じて、インタラクティブな地図アプリケーションの作成方法を習得します。

## 🛠️ 技術スタック

- **スライド生成**: [Marp](https://marp.app/) - Markdownからスライドを生成
- **地図ライブラリ**: [MapLibre GL JS](https://maplibre.org/) - オープンソースのWebGL地図ライブラリ
- **地図データ**: [OpenStreetMap](https://www.openstreetmap.org/) - オープンソースの地図データ

## 📁 プロジェクト構造

```
rits-2025-fall-cartography/
├── README.md                 # このファイル
├── package.json             # Node.js依存関係
├── marp.config.js           # Marp設定ファイル
├── slides/                  # 授業スライド（Markdown）
│   ├── 01-introduction.md
│   ├── 02-spatial-data-basics.md
│   ├── 03-04-openstreetmap-culture.md
│   ├── 05-geojson-basics.md
│   ├── 06-web-map-components.md
│   ├── 07-08-maplibre-operations.md
│   ├── 09-styling-basics.md
│   ├── 10-vector-tiles.md
│   ├── 11-project-planning.md
│   ├── 12-project-completion.md
│   └── 13-14-project-presentation.md
├── assets/                  # 画像・動画素材
│   └── images/
├── output/                  # 生成されたスライド
│   ├── *.html              # HTML形式（直下）
│   ├── pdf/                # PDF形式
│   └── pptx/               # PowerPoint形式
└── scripts/                # ビルドスクリプト
    ├── generate-templates.js
    ├── build-all.sh
    └── watch.sh
```

## 🚀 セットアップ

### 1. 必要なソフトウェア

- **Node.js** (v20以上)
- **npm** または **yarn**
- **Git**

### 2. インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd rits-2025-fall-cartography

# 依存関係のインストール
npm install
```

### 3. VS Code拡張機能（推奨）

- [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode)

## 📖 使用方法

### スライドの編集

1. `slides/` ディレクトリ内のMarkdownファイルを編集
2. VS Code + Marp拡張機能でリアルタイムプレビュー可能

### ビルド

#### 全形式一括生成
```bash
# HTML、PDF、PPTX全てを生成
npm run build:all
# または
./scripts/build-all.sh
```

#### 個別生成
```bash
# HTML生成（output/直下に生成）
npm run build

# PDF生成（output/pdf/に生成）
npm run build:pdf

# PPTX生成（output/pptx/に生成）
npm run build:pptx
```

### 開発モード

```bash
# 開発サーバー起動（ファイル監視・自動リビルド）
npm run dev
```

## 📋 授業計画

| 回 | テーマ | ファイル |
|----|--------|----------|
| 1 | イントロダクション | `01-introduction.md` |
| 2 | 空間データの基礎 | `02-spatial-data-basics.md` |
| 3-4 | OpenStreetMapの文化と実践 | `03-04-openstreetmap-culture.md` |
| 5 | GeoJSONの基礎 | `05-geojson-basics.md` |
| 6 | ウェブ地図コンポーネント | `06-web-map-components.md` |
| 7-8 | MapLibreの操作 | `07-08-maplibre-operations.md` |
| 9 | スタイリングの基礎 | `09-styling-basics.md` |
| 10 | ベクタータイル | `10-vector-tiles.md` |
| 11 | プロジェクト計画 | `11-project-planning.md` |
| 12 | プロジェクト完成 | `12-project-completion.md` |
| 13-14 | プロジェクト発表 | `13-14-project-presentation.md` |

## 🎨 カスタムテーマ

### 特別なクラス　(TODO: CSS 未定義)

- `.note` - 注意事項
- `.warning` - 警告
- `.assignment` - 課題セクション
- `.highlight` - ハイライト

## 📝 スライド作成ガイド

### 基本構造

```markdown
---
marp: true
theme: default
class: title
paginate: true
---

<!-- _class: title -->

# タイトル

## サブタイトル

---

## 通常のスライド

内容...

---

<div class="assignment">

## 課題

課題内容...

</div>
```

### 地図・コード例の記載

```markdown
```javascript
// MapLibre GL JSのコード例
const map = new maplibregl.Map({
  container: 'map',
  style: 'style.json',
  center: [135.5, 34.7],
  zoom: 10
});
```
```

## 🔧 トラブルシューティング

### よくある問題

1. **PDF生成でエラーが発生する**
   - Puppeteerの依存関係を確認
   - `npm install` を再実行

2. **日本語フォントが表示されない**
   - システムにヒラギノフォントがインストールされているか確認
   - CSS内のフォント設定を調整

3. **画像が表示されない**
   - 画像パスが正しいか確認
   - `assets/images/` ディレクトリに画像が配置されているか確認

### デバッグ

```bash
# 詳細ログでビルド
npx marp --config marp.config.js slides/ --output output/ --verbose

# 特定のファイルのみビルド
npx marp slides/01-introduction.md --output output/
```

## 📚 参考資料

### 公式ドキュメント
- [Marp Documentation](https://marpit.marp.app/)
- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js-docs/)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)

### 学習リソース
- [MapLibre GL JS Examples](https://maplibre.org/maplibre-gl-js-docs/example/)
- [OpenStreetMap Beginners' Guide](https://wiki.openstreetmap.org/wiki/Beginners'_guide)
- [GeoJSON Specification](https://geojson.org/)

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👥 貢献

授業改善のための提案やバグ報告は、GitHubのIssueまたはPull Requestでお願いします。

- **担当教員**: 鎌田 遼

---

**立命館大学 2025年度秋学期**  
**ウェブカートグラフィ入門**
