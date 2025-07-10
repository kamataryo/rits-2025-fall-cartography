---
marp: true
theme: default
class: title
paginate: true
---

<script src="https://g69ye6vo2a.execute-api.ap-northeast-1.amazonaws.com/v1/client/vote-client.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("section").forEach(section => {
      const reaction = document.createElement("reaction-component");
      reaction.setAttribute("emojis", "👍,👎,🤔,💡");
      section.appendChild(reaction);
    });
  });
</script>
<style>
/* ページ番号は右上。リアクションコンポーネントをおきたいので */
section.title::after { top: 21px; }
</style>

<!-- _class: title -->

# MapLibre GL JS と OpenStreetMap で始める<br />ウェブカートグラフィ入門

## 第9回：スタイルの基本（ポイント、ライン、ポリゴン）

立命館大学 2025年度 秋セメスター 火曜5限
授業時間：85分

---

## 本日のアジェンダ

1. **前回の振り返り・課題確認** (10分)
2. **地図デザイン入門** (15分)
3. **ポイントデータのスタイリング** (20分)
4. **ラインデータのスタイリング** (20分)
5. **ポリゴンデータのスタイリング** (15分)
6. **課題説明** (5分)

---

## 前回の振り返り

### 第7-8回の主要ポイント
- 地図の基本操作（パン・ズーム・回転・傾斜）
- 地図のカスタマイズ（コントロール・イベント・ポップアップ）
- レイヤー追加の実践
- JSON形式でのスタイル定義
- GeoJSONデータの地図表示

### 課題の確認
GeoJSONデータのインタラクティブ地図作成
- 技術的実装の確認
- スタイリングの工夫
- インタラクション機能
- 学習成果の整理

---

## 地図デザイン入門

### 地図デザインの基本原則

#### 1. 視覚的階層（Visual Hierarchy）
- **重要度に応じた強調**：主要な情報を目立たせる
- **コントラストの活用**：背景と前景の明確な区別
- **サイズの調整**：重要度に応じたサイズ設定

#### 2. 色彩理論の応用
- **色相（Hue）**：カテゴリの区別
- **彩度（Saturation）**：重要度の表現
- **明度（Brightness）**：階層の表現

---

#### 3. 可読性（Readability）
- **適切なフォントサイズ**：ズームレベルに応じた調整
- **十分なコントラスト**：背景との明確な区別
- **重複の回避**：ラベルの配置最適化

#### 4. 一貫性（Consistency）
- **統一されたスタイル**：同じカテゴリは同じスタイル
- **予測可能な表現**：ユーザーの期待に沿った表現
- **ブランドとの整合性**：組織のアイデンティティとの調和

---

### 色彩設計の実践

#### カテゴリカル色彩（Categorical Colors）
```javascript
// 異なるカテゴリを区別する色
const categoryColors = {
  restaurant: '#e74c3c',    // 赤系
  hotel: '#3498db',         // 青系
  shop: '#2ecc71',          // 緑系
  hospital: '#f39c12',      // オレンジ系
  school: '#9b59b6'         // 紫系
};
```

#### 順序色彩（Sequential Colors）
```javascript
// 数値の大小を表現する色
const populationColors = [
  '#ffffcc',  // 低い値：薄い黄色
  '#c7e9b4',  // 
  '#7fcdbb',  // 
  '#41b6c4',  // 
  '#2c7fb8',  // 
  '#253494'   // 高い値：濃い青
];
```

---

#### 発散色彩（Diverging Colors）
```javascript
// 中央値からの偏差を表現する色
const temperatureColors = [
  '#313695',  // 低温：青
  '#74add1',
  '#abd9e9',
  '#e0f3f8',
  '#ffffcc',  // 中央値：黄色
  '#fee090',
  '#fdae61',
  '#f46d43',
  '#d73027'   // 高温：赤
];
```

---

### アクセシビリティの考慮

#### カラーブラインドネス対応
- **色だけに依存しない**：形状・サイズ・パターンも活用
- **適切な色の組み合わせ**：区別しやすい色の選択
- **ツールの活用**：ColorBrewer、Viz Palette等

#### コントラスト比の確保
- **WCAG基準の遵守**：最低4.5:1のコントラスト比
- **背景色との調和**：地図背景との適切なコントラスト

---

## ポイントデータのスタイリング

### 基本的なポイントスタイル

#### Circle レイヤーの基本プロパティ
```javascript
map.addLayer({
  id: 'basic-points',
  type: 'circle',
  source: 'point-data',
  paint: {
    'circle-radius': 8,           // 半径（ピクセル）
    'circle-color': '#ff0000',    // 塗りつぶし色
    'circle-opacity': 1.0,        // 塗りつぶし透明度
    'circle-stroke-color': '#ffffff', // 境界線色
    'circle-stroke-width': 2,     // 境界線幅
    'circle-stroke-opacity': 1.0  // 境界線透明度
  }
});
```

---

### データドリブンなポイントスタイリング

#### カテゴリ別の色分け
```javascript
map.addLayer({
  id: 'categorized-points',
  type: 'circle',
  source: 'poi-data',
  paint: {
    'circle-radius': 10,
    'circle-color': [
      'match',
      ['get', 'category'],
      'restaurant', '#e74c3c',
      'hotel', '#3498db',
      'shop', '#2ecc71',
      'hospital', '#f39c12',
      'school', '#9b59b6',
      '#95a5a6' // デフォルト色
    ],
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 2
  }
});
```

---

#### 数値による段階的表現
```javascript
map.addLayer({
  id: 'graduated-points',
  type: 'circle',
  source: 'population-data',
  paint: {
    // 人口に応じたサイズ変更
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'population'],
      0, 3,        // 人口0で半径3
      10000, 8,    // 人口1万で半径8
      100000, 15,  // 人口10万で半径15
      1000000, 25  // 人口100万で半径25
    ],
    // 人口に応じた色変更
    'circle-color': [
      'interpolate',
      ['linear'],
      ['get', 'population'],
      0, '#ffffcc',
      10000, '#c7e9b4',
      100000, '#7fcdbb',
      1000000, '#2c7fb8'
    ],
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 1
  }
});
```

---

### ズームレベル対応のスタイリング

#### ズームに応じたサイズ調整
```javascript
map.addLayer({
  id: 'zoom-responsive-points',
  type: 'circle',
  source: 'point-data',
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      8, 2,   // ズーム8で半径2
      10, 4,  // ズーム10で半径4
      12, 8,  // ズーム12で半径8
      16, 16, // ズーム16で半径16
      20, 32  // ズーム20で半径32
    ],
    'circle-color': '#3498db',
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      8, 0.5,
      16, 2
    ]
  }
});
```

---

### シンボルレイヤーによるアイコン表示

#### カスタムアイコンの使用
```javascript
// アイコン画像の読み込み
map.loadImage('./icons/restaurant.png', (error, image) => {
  if (error) throw error;
  map.addImage('restaurant-icon', image);
});

// シンボルレイヤーの追加
map.addLayer({
  id: 'icon-points',
  type: 'symbol',
  source: 'restaurant-data',
  layout: {
    'icon-image': 'restaurant-icon',
    'icon-size': [
      'interpolate',
      ['linear'],
      ['zoom'],
      10, 0.5,
      16, 1.0
    ],
    'icon-anchor': 'bottom'
  }
});
```

---

#### テキストラベルとの組み合わせ
```javascript
map.addLayer({
  id: 'labeled-points',
  type: 'symbol',
  source: 'poi-data',
  layout: {
    'icon-image': [
      'match',
      ['get', 'category'],
      'restaurant', 'restaurant-icon',
      'hotel', 'hotel-icon',
      'default-icon'
    ],
    'icon-size': 0.8,
    'text-field': ['get', 'name'],
    'text-font': ['Open Sans Regular'],
    'text-size': 12,
    'text-anchor': 'top',
    'text-offset': [0, 1.2],
    'text-optional': true
  },
  paint: {
    'text-color': '#2c3e50',
    'text-halo-color': '#ffffff',
    'text-halo-width': 2
  }
});
```

---

## ラインデータのスタイリング

### 基本的なラインスタイル

#### Line レイヤーの基本プロパティ
```javascript
map.addLayer({
  id: 'basic-lines',
  type: 'line',
  source: 'line-data',
  paint: {
    'line-color': '#3498db',      // 線の色
    'line-width': 3,              // 線の幅（ピクセル）
    'line-opacity': 1.0,          // 透明度
    'line-blur': 0,               // ぼかし効果
    'line-dasharray': [1, 0]      // 破線パターン [実線, 空白]
  }
});
```

---

### 道路種別による階層的表現

#### 道路ランクに応じたスタイリング
```javascript
map.addLayer({
  id: 'road-hierarchy',
  type: 'line',
  source: 'road-data',
  paint: {
    'line-color': [
      'match',
      ['get', 'highway'],
      'motorway', '#e74c3c',      // 高速道路：赤
      'primary', '#f39c12',       // 国道：オレンジ
      'secondary', '#f1c40f',     // 県道：黄色
      'residential', '#bdc3c7',   // 住宅街：グレー
      '#ecf0f1'                   // その他：薄いグレー
    ],
    'line-width': [
      'match',
      ['get', 'highway'],
      'motorway', 6,
      'primary', 4,
      'secondary', 3,
      'residential', 2,
      1
    ]
  }
});
```

---

### ズームレベル対応のライン表示

#### 詳細度に応じた表示制御
```javascript
map.addLayer({
  id: 'zoom-dependent-roads',
  type: 'line',
  source: 'road-data',
  filter: [
    'any',
    ['==', ['get', 'highway'], 'motorway'],
    ['==', ['get', 'highway'], 'primary'],
    [
      'all',
      ['>=', ['zoom'], 12],
      ['==', ['get', 'highway'], 'secondary']
    ],
    [
      'all',
      ['>=', ['zoom'], 14],
      ['==', ['get', 'highway'], 'residential']
    ]
  ],
  paint: {
    'line-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      8, [
        'match',
        ['get', 'highway'],
        'motorway', 2,
        'primary', 1,
        0.5
      ],
      16, [
        'match',
        ['get', 'highway'],
        'motorway', 8,
        'primary', 6,
        'secondary', 4,
        'residential', 2,
        1
      ]
    ]
  }
});
```

---

### 特殊なライン表現

#### 破線・点線の表現
```javascript
map.addLayer({
  id: 'dashed-lines',
  type: 'line',
  source: 'boundary-data',
  paint: {
    'line-color': '#e74c3c',
    'line-width': 2,
    'line-dasharray': [3, 2]  // 3ピクセル実線、2ピクセル空白
  }
});

map.addLayer({
  id: 'dotted-lines',
  type: 'line',
  source: 'trail-data',
  paint: {
    'line-color': '#27ae60',
    'line-width': 3,
    'line-dasharray': [0.5, 2]  // 点線パターン
  }
});
```

---

#### グラデーション効果
```javascript
map.addLayer({
  id: 'gradient-lines',
  type: 'line',
  source: 'elevation-data',
  paint: {
    'line-color': [
      'interpolate',
      ['linear'],
      ['get', 'elevation'],
      0, '#2ecc71',      // 低標高：緑
      1000, '#f39c12',   // 中標高：オレンジ
      3000, '#e74c3c'    // 高標高：赤
    ],
    'line-width': [
      'interpolate',
      ['linear'],
      ['get', 'elevation'],
      0, 2,
      3000, 6
    ]
  }
});
```

---

## ポリゴンデータのスタイリング

### 基本的なポリゴンスタイル

#### Fill レイヤーの基本プロパティ
```javascript
map.addLayer({
  id: 'basic-polygons',
  type: 'fill',
  source: 'polygon-data',
  paint: {
    'fill-color': '#3498db',        // 塗りつぶし色
    'fill-opacity': 0.6,            // 塗りつぶし透明度
    'fill-outline-color': '#2c3e50' // 境界線色
  }
});
```

---

### 統計データの可視化

#### コロプレス図（階級区分図）
```javascript
map.addLayer({
  id: 'choropleth-map',
  type: 'fill',
  source: 'census-data',
  paint: {
    'fill-color': [
      'step',
      ['get', 'population_density'],
      '#ffffcc',    // 0-100
      100, '#c7e9b4',   // 100-500
      500, '#7fcdbb',   // 500-1000
      1000, '#41b6c4',  // 1000-2000
      2000, '#2c7fb8',  // 2000-5000
      5000, '#253494'   // 5000+
    ],
    'fill-opacity': 0.8,
    'fill-outline-color': '#ffffff'
  }
});
```

---

#### 連続的な色変化
```javascript
map.addLayer({
  id: 'continuous-fill',
  type: 'fill',
  source: 'temperature-data',
  paint: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'temperature'],
      -10, '#313695',  // 寒い：青
      0, '#74add1',
      10, '#abd9e9',
      20, '#e0f3f8',
      25, '#ffffcc',   // 中間：黄色
      30, '#fee090',
      35, '#fdae61',
      40, '#f46d43',
      45, '#d73027'    // 暑い：赤
    ],
    'fill-opacity': 0.7
  }
});
```

---

### 複合的なポリゴン表現

#### パターン塗りつぶし
```javascript
// パターン画像の読み込み
map.loadImage('./patterns/diagonal-stripes.png', (error, image) => {
  if (error) throw error;
  map.addImage('diagonal-pattern', image);
});

map.addLayer({
  id: 'pattern-fill',
  type: 'fill',
  source: 'land-use-data',
  paint: {
    'fill-pattern': [
      'match',
      ['get', 'land_use'],
      'forest', 'forest-pattern',
      'agricultural', 'diagonal-pattern',
      null  // パターンなし
    ],
    'fill-opacity': 0.8
  }
});
```

---

#### 3D効果（Extrusion）
```javascript
map.addLayer({
  id: '3d-buildings',
  type: 'fill-extrusion',
  source: 'building-data',
  paint: {
    'fill-extrusion-color': [
      'interpolate',
      ['linear'],
      ['get', 'height'],
      0, '#e8f4f8',
      50, '#a8ddb5',
      100, '#43a2ca',
      200, '#0868ac'
    ],
    'fill-extrusion-height': ['get', 'height'],
    'fill-extrusion-base': ['get', 'base_height'],
    'fill-extrusion-opacity': 0.8
  }
});
```

---

### レイヤーの重ね合わせ

#### 複数レイヤーによる表現
```javascript
// 背景レイヤー
map.addLayer({
  id: 'area-background',
  type: 'fill',
  source: 'area-data',
  paint: {
    'fill-color': '#ecf0f1',
    'fill-opacity': 0.5
  }
});

// 境界線レイヤー
map.addLayer({
  id: 'area-outline',
  type: 'line',
  source: 'area-data',
  paint: {
    'line-color': '#2c3e50',
    'line-width': 2
  }
});

// ラベルレイヤー
map.addLayer({
  id: 'area-labels',
  type: 'symbol',
  source: 'area-data',
  layout: {
    'text-field': ['get', 'name'],
    'text-size': 14
  },
  paint: {
    'text-color': '#2c3e50'
  }
});
```

---

<div class="assignment">

## 課題：自分のGeoJSONデータに異なるスタイルを適用する

### 課題内容
これまでに作成したGeoJSONデータを使用して、様々なスタイリング技法を適用した地図を作成してください。

### 要件

#### 1. スタイリング要件
- **ポイントデータ**：カテゴリ別色分け + サイズ変更
- **ラインデータ**：種類別の線幅・色・パターン
- **ポリゴンデータ**：統計値による色分け（該当する場合）
- **ズームレベル対応**：適切な表示制御

#### 2. 技術要件
- **データドリブンスタイリング** の活用
- **式（Expressions）** の適切な使用
- **視覚的階層** の明確な表現
- **アクセシビリティ** への配慮

</div>

---

<div class="assignment">

#### 3. デザイン要件
- **色彩理論** に基づいた配色
- **一貫性のあるスタイル** 
- **適切なコントラスト** の確保
- **美しい視覚表現**

#### 4. 機能要件
- **複数のスタイルパターン** の実装
- **スタイル切り替え機能**（オプション）
- **レスポンシブデザイン**

### 実装すべきスタイリング
- カテゴリカル色彩の使用
- 数値データの段階的表現
- ズームレベルに応じた表示調整
- 適切なラベル表示
- 視覚的に魅力的なデザイン

</div>

---

<div class="assignment">

### 提出物

#### 1. HTML ファイル
- **ファイル名**：`[学籍番号]_styled_map.html`
- **完全に動作する** 単一のHTMLファイル
- **複数のスタイルパターン** を含む

#### 2. スタイル設計書
- **形式**：A4用紙2-3枚程度（PDF形式）
- **内容**：
  - 色彩設計の考え方
  - 各ジオメトリタイプのスタイリング方針
  - データドリブンスタイリングの活用方法
  - ズームレベル対応の設計
  - アクセシビリティへの配慮
  - 実装で工夫した点
  - 参考にしたデザイン・色彩理論

</div>

---

<div class="assignment">

### 評価基準
- **スタイリング技術**（40%）
  - データドリブンスタイリングの活用
  - 式（Expressions）の適切な使用
  - ズームレベル対応の実装
- **デザイン品質**（30%）
  - 色彩設計の妥当性
  - 視覚的階層の明確さ
  - 全体的な美しさ
- **技術的実装**（20%）
  - コードの品質
  - 動作の安定性
  - レスポンシブ対応
- **設計思想**（10%）
  - 設計書の質
  - 理論的背景の理解

### 提出期限・方法
- **期限**：次回授業開始時
- **方法**：学習管理システム経由

</div>

---

## 次回予告

### 第10回：ベクトルタイルの活用
- ベクトルタイルの仕組みとフォーマット
- MapLibre GL JS でのベクトルタイル利用方法
- パフォーマンスの最適化
- 大量データの効率的な表示
- 実際のベクトルタイルサービスの活用

### 準備事項
- 今回作成したスタイル地図の動作確認
- ベクトルタイルの基本概念の予習
- 大量データ処理への関心

---

## 質疑応答

### 本日の内容について
- 地図デザインの基本原則
- ポイント・ライン・ポリゴンのスタイリング
- データドリブンスタイリング
- 色彩理論の応用
- 課題に関する技術的な質問

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします

**第10回：ベクトルタイルの活用**
[日時・教室]

課題の提出をお忘れなく！
