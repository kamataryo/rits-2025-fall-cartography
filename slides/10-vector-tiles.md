---
marp: true
theme: cartography
class: title
paginate: true
---

<!-- _class: title -->

# MapLibre GL JS と OpenStreetMap で始めるウェブカートグラフィ入門

## 第10回：ベクトルタイルの活用

立命館大学 2025年度秋学期
授業時間：85分

---

## 本日のアジェンダ

1. **前回の振り返り・課題確認** (10分)
2. **ベクトルタイルの仕組みとフォーマット** (25分)
3. **MapLibre GL JS でのベクトルタイル利用** (25分)
4. **パフォーマンス最適化** (20分)
5. **課題説明** (5分)

---

## 前回の振り返り

### 第9回の主要ポイント
- 地図デザインの基本原則（視覚的階層・色彩理論・可読性・一貫性）
- ポイント・ライン・ポリゴンの詳細スタイリング
- データドリブンスタイリングの活用
- ズームレベル対応の表示制御
- アクセシビリティへの配慮

### 課題の確認
GeoJSONデータへの多様なスタイリング適用
- スタイリング技術の確認
- デザイン品質の評価
- 技術的実装の検証
- 設計思想の理解

---

## ベクトルタイルの仕組みとフォーマット

### ベクトルタイルとは？

#### 定義
> ベクトルタイルは、地理空間のベクターデータを効率的に配信するためのタイル形式

#### 特徴
- **ベクターデータ**：点・線・面の座標情報
- **タイル分割**：256×256ピクセル単位での分割
- **階層構造**：ズームレベルごとの詳細度
- **効率的配信**：必要な部分のみダウンロード

---

### ラスタータイル vs ベクトータイル（再確認）

| 特徴 | ラスタータイル | ベクトータイル |
|------|----------------|----------------|
| **データ形式** | 画像（PNG/JPEG） | ベクターデータ |
| **ファイルサイズ** | 大きい | 小さい |
| **スタイル変更** | 不可 | 可能 |
| **高解像度対応** | 困難 | 容易 |
| **インタラクション** | 制限あり | 豊富 |
| **生成コスト** | 低い | 高い |
| **クライアント負荷** | 低い | 高い |

---

### ベクトータイルのフォーマット

#### 1. Mapbox Vector Tiles (MVT)
- **形式**：Protocol Buffers (PBF)
- **特徴**：バイナリ形式、高効率
- **標準化**：OGC標準として採用
- **拡張子**：`.pbf` または `.mvt`

#### 2. GeoJSON タイル
- **形式**：JSON テキスト
- **特徴**：人間が読みやすい
- **用途**：開発・デバッグ用途
- **拡張子**：`.geojson`

---

### MVT（Mapbox Vector Tiles）の詳細

#### データ構造
```
タイル
├── レイヤー1（例：道路）
│   ├── フィーチャー1
│   ├── フィーチャー2
│   └── ...
├── レイヤー2（例：建物）
│   ├── フィーチャー1
│   └── ...
└── レイヤー3（例：水域）
```

#### 座標系
- **タイル座標系**：0-4095の整数座標
- **高精度**：小数点以下の精度も保持
- **効率性**：整数演算による高速処理

---

### ベクトータイルの生成

#### データソース
- **OpenStreetMap**：全世界の地図データ
- **政府オープンデータ**：国土地理院、自治体データ
- **商用データ**：HERE、TomTom等
- **独自データ**：企業・組織の内部データ

#### 生成ツール
- **Tippecanoe**：Mapbox製のタイル生成ツール
- **PostGIS + ST_AsMVT**：PostgreSQL拡張
- **GeoServer**：オープンソースGISサーバー
- **GDAL/OGR**：地理空間データ変換ライブラリ

---

### タイル生成の実例

#### Tippecanoe を使用した生成
```bash
# GeoJSONからベクトータイルを生成
tippecanoe -o output.mbtiles \
  --minimum-zoom=0 \
  --maximum-zoom=14 \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  input.geojson

# 生成されたタイルの確認
tile-join --no-tile-compression \
  --output-to-directory=tiles/ \
  output.mbtiles
```

#### PostGIS での生成
```sql
-- ベクトータイルの生成
SELECT ST_AsMVT(tile, 'layer_name', 4096, 'geom')
FROM (
  SELECT 
    id,
    name,
    category,
    ST_AsMVTGeom(
      geom,
      ST_TileEnvelope(14, 8800, 5400),  -- z, x, y
      4096,
      256,
      true
    ) AS geom
  FROM poi_table
  WHERE geom && ST_TileEnvelope(14, 8800, 5400)
) AS tile;
```

---

## MapLibre GL JS でのベクトルタイル利用

### ベクトータイルソースの設定

#### 基本的な設定
```javascript
map.addSource('vector-source', {
  type: 'vector',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.pbf'],
  minzoom: 0,
  maxzoom: 14
});
```

#### MBTiles ファイルの使用
```javascript
map.addSource('local-tiles', {
  type: 'vector',
  url: 'pmtiles://path/to/tiles.pmtiles'  // PMTiles形式
});
```

---

### レイヤーの追加

#### ソースレイヤーの指定
```javascript
map.addLayer({
  id: 'roads',
  type: 'line',
  source: 'vector-source',
  'source-layer': 'transportation',  // ベクトータイル内のレイヤー名
  filter: ['==', ['get', 'class'], 'primary'],
  paint: {
    'line-color': '#ff6b35',
    'line-width': 3
  }
});
```

#### 複数レイヤーの活用
```javascript
// 建物レイヤー
map.addLayer({
  id: 'buildings',
  type: 'fill',
  source: 'vector-source',
  'source-layer': 'building',
  paint: {
    'fill-color': '#d6d6d6',
    'fill-opacity': 0.8
  }
});

// 水域レイヤー
map.addLayer({
  id: 'water',
  type: 'fill',
  source: 'vector-source',
  'source-layer': 'water',
  paint: {
    'fill-color': '#4fc3f7'
  }
});
```

---

### フィルタリングの活用

#### 属性による絞り込み
```javascript
map.addLayer({
  id: 'highways',
  type: 'line',
  source: 'osm-vector',
  'source-layer': 'transportation',
  filter: [
    'in',
    ['get', 'class'],
    ['literal', ['motorway', 'trunk', 'primary']]
  ],
  paint: {
    'line-color': [
      'match',
      ['get', 'class'],
      'motorway', '#e74c3c',
      'trunk', '#f39c12',
      'primary', '#f1c40f',
      '#bdc3c7'
    ],
    'line-width': [
      'match',
      ['get', 'class'],
      'motorway', 6,
      'trunk', 5,
      'primary', 4,
      2
    ]
  }
});
```

---

#### ズームレベルによる表示制御
```javascript
map.addLayer({
  id: 'detailed-roads',
  type: 'line',
  source: 'osm-vector',
  'source-layer': 'transportation',
  filter: [
    'all',
    ['>=', ['zoom'], 12],  // ズーム12以上で表示
    ['in', ['get', 'class'], ['literal', ['secondary', 'tertiary']]]
  ],
  paint: {
    'line-color': '#95a5a6',
    'line-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      12, 1,
      16, 3
    ]
  }
});
```

---

### 実用的なベクトータイルサービス

#### 1. OpenMapTiles
```javascript
map.addSource('openmaptiles', {
  type: 'vector',
  url: 'https://api.maptiler.com/tiles/v3/tiles.json?key=YOUR_API_KEY'
});
```

#### 2. Protomaps
```javascript
map.addSource('protomaps', {
  type: 'vector',
  tiles: ['https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=YOUR_API_KEY'],
  attribution: '© Protomaps'
});
```

#### 3. 国土地理院ベクトルタイル
```javascript
map.addSource('gsi-vector', {
  type: 'vector',
  tiles: ['https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf'],
  attribution: '© 国土地理院'
});
```

---

### カスタムベクトータイルの作成

#### 小規模データの場合
```javascript
// GeoJSONからベクトータイルを動的生成
import { geojsonvt } from '@mapbox/geojson-vt';

const tileIndex = geojsonvt(geojsonData, {
  maxZoom: 14,
  tolerance: 3,
  extent: 4096,
  buffer: 64
});

// カスタムソースの実装
map.addSource('custom-vector', {
  type: 'geojson',
  data: geojsonData  // 小規模な場合はGeoJSONのまま使用
});
```

---

## パフォーマンス最適化

### ベクトータイルの最適化戦略

#### 1. 適切なズームレベル設定
```javascript
// データの詳細度に応じたズーム範囲
map.addSource('poi-tiles', {
  type: 'vector',
  tiles: ['https://example.com/poi/{z}/{x}/{y}.pbf'],
  minzoom: 10,  // 詳細なPOIは高ズームから
  maxzoom: 16
});

map.addSource('country-tiles', {
  type: 'vector',
  tiles: ['https://example.com/countries/{z}/{x}/{y}.pbf'],
  minzoom: 0,   // 国境は低ズームから
  maxzoom: 6
});
```

---

#### 2. レイヤーの表示制御
```javascript
// ズームレベルに応じた段階的表示
map.addLayer({
  id: 'cities-large',
  type: 'circle',
  source: 'cities',
  'source-layer': 'cities',
  filter: [
    'all',
    ['<=', ['zoom'], 8],
    ['>=', ['get', 'population'], 1000000]
  ],
  paint: {
    'circle-radius': 8,
    'circle-color': '#e74c3c'
  }
});

map.addLayer({
  id: 'cities-medium',
  type: 'circle',
  source: 'cities',
  'source-layer': 'cities',
  filter: [
    'all',
    ['>', ['zoom'], 8],
    ['<=', ['zoom'], 12],
    ['>=', ['get', 'population'], 100000]
  ],
  paint: {
    'circle-radius': 6,
    'circle-color': '#f39c12'
  }
});
```

---

#### 3. データの簡略化
```javascript
// 低ズームレベルでの簡略化
map.addLayer({
  id: 'roads-simplified',
  type: 'line',
  source: 'roads',
  'source-layer': 'transportation',
  filter: ['<=', ['zoom'], 10],
  paint: {
    'line-color': '#34495e',
    'line-width': [
      'case',
      ['==', ['get', 'class'], 'motorway'], 3,
      ['==', ['get', 'class'], 'primary'], 2,
      1
    ]
  }
});

map.addLayer({
  id: 'roads-detailed',
  type: 'line',
  source: 'roads',
  'source-layer': 'transportation',
  filter: ['>', ['zoom'], 10],
  paint: {
    'line-color': '#2c3e50',
    'line-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      10, 1,
      16, 6
    ]
  }
});
```

---

### メモリとネットワークの最適化

#### キャッシュ戦略
```javascript
// ソース設定でのキャッシュ制御
map.addSource('cached-tiles', {
  type: 'vector',
  tiles: ['https://example.com/tiles/{z}/{x}/{y}.pbf'],
  scheme: 'xyz',
  attribution: '© Example',
  // ブラウザキャッシュの活用
  headers: {
    'Cache-Control': 'max-age=3600'
  }
});
```

#### プリロード戦略
```javascript
// 重要なタイルの事前読み込み
map.on('load', () => {
  // 現在の表示範囲周辺のタイルをプリロード
  const bounds = map.getBounds();
  const zoom = map.getZoom();
  
  // 周辺タイルの事前取得（実装は省略）
  preloadTiles(bounds, zoom + 1);
});
```

---

### レンダリング最適化

#### レイヤーの統合
```javascript
// 複数の小さなレイヤーを統合
map.addLayer({
  id: 'combined-pois',
  type: 'circle',
  source: 'poi-tiles',
  'source-layer': 'pois',
  paint: {
    'circle-radius': [
      'match',
      ['get', 'category'],
      'restaurant', 8,
      'hotel', 6,
      'shop', 4,
      3
    ],
    'circle-color': [
      'match',
      ['get', 'category'],
      'restaurant', '#e74c3c',
      'hotel', '#3498db',
      'shop', '#2ecc71',
      '#95a5a6'
    ]
  }
});
```

---

#### 条件付きレンダリング
```javascript
// 必要な時のみレンダリング
let detailLayersVisible = false;

map.on('zoom', () => {
  const zoom = map.getZoom();
  
  if (zoom >= 14 && !detailLayersVisible) {
    // 詳細レイヤーを表示
    map.setLayoutProperty('building-details', 'visibility', 'visible');
    map.setLayoutProperty('road-labels', 'visibility', 'visible');
    detailLayersVisible = true;
  } else if (zoom < 14 && detailLayersVisible) {
    // 詳細レイヤーを非表示
    map.setLayoutProperty('building-details', 'visibility', 'none');
    map.setLayoutProperty('road-labels', 'visibility', 'none');
    detailLayersVisible = false;
  }
});
```

---

### 大量データの処理

#### クラスタリング
```javascript
map.addSource('clustered-points', {
  type: 'geojson',
  data: largePointDataset,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
});

// クラスターの表示
map.addLayer({
  id: 'clusters',
  type: 'circle',
  source: 'clustered-points',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6',
      100, '#f1f075',
      750, '#f28cb1'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      100, 30,
      750, 40
    ]
  }
});
```

---

<div class="assignment">

## 課題：ベクトルタイルを使った地図を作成

### 課題内容
ベクトルタイルサービスを活用して、効率的で美しい地図アプリケーションを作成してください。

### 要件

#### 1. 技術要件
- **ベクトータイルソース** の使用（OpenMapTiles、Protomaps等）
- **複数のソースレイヤー** の活用
- **適切なフィルタリング** の実装
- **パフォーマンス最適化** の考慮

#### 2. 機能要件
- **ズームレベル対応** の表示制御
- **レイヤー切り替え** 機能
- **インタラクティブ要素** の実装
- **レスポンシブデザイン**

</div>

---

<div class="assignment">

#### 3. デザイン要件
- **統一感のあるスタイル**
- **適切な情報階層**
- **ユーザビリティ** の考慮
- **視覚的な美しさ**

#### 4. 最適化要件
- **効率的なレイヤー管理**
- **適切なズーム範囲設定**
- **メモリ使用量の最適化**

### 実装すべき機能
- ベクトータイルの基本表示
- 複数レイヤーの重ね合わせ
- ズームレベルに応じた表示制御
- フィルタリング機能
- パフォーマンス監視（オプション）

</div>

---

<div class="assignment">

### 提出物

#### 1. HTML ファイル
- **ファイル名**：`[学籍番号]_vector_map.html`
- **完全に動作する** 単一のHTMLファイル
- **ベクトータイル** を使用した実装

#### 2. 技術レポート
- **形式**：A4用紙2-3枚程度（PDF形式）
- **内容**：
  - 使用したベクトータイルサービス
  - レイヤー構成と設計思想
  - フィルタリング・最適化の実装
  - パフォーマンス考慮点
  - 技術的な課題と解決方法
  - ラスタータイルとの比較考察

</div>

---

<div class="assignment">

### 評価基準
- **技術的実装**（40%）
  - ベクトータイルの正しい使用
  - フィルタリング・最適化の実装
  - コードの品質
- **機能性**（25%）
  - レイヤー切り替え機能
  - ズームレベル対応
  - インタラクション実装
- **パフォーマンス**（20%）
  - 表示速度の最適化
  - メモリ効率
  - ネットワーク効率
- **設計・考察**（15%）
  - 技術選択の妥当性
  - レポートの質
  - 理論的理解

### 提出期限・方法
- **期限**：次回授業開始時
- **方法**：学習管理システム経由

</div>

---

## 次回予告

### 第11回：応用プロジェクト（1）- 地図プロジェクトの企画
- 地図を利用したテーマ選定
- 必要なデータの準備と設計
- 簡単なプロトタイプの作成
- プロジェクト計画の立案
- ディスカッションとフィードバック

### 準備事項
- 今回作成したベクトータイル地図の動作確認
- 最終プロジェクトのテーマ検討
- 利用可能なデータソースの調査
- 技術的な実現可能性の検討

---

## 質疑応答

### 本日の内容について
- ベクトータイルの仕組み・フォーマット
- MapLibre GL JS での利用方法
- パフォーマンス最適化技術
- 大量データの処理方法
- 課題に関する技術的な質問

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします

**第11回：応用プロジェクト（1）- 地図プロジェクトの企画**
[日時・教室]

課題の提出をお忘れなく！
