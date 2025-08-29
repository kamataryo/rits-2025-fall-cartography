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

## 第6回：ウェブ地図の構成要素

立命館大学 2025年度 秋セメスター 火曜5限
授業時間：95分

---

## 本日のアジェンダ

1. **前回の振り返り・課題確認** (12分)
2. **ベースマップとオーバーレイの違い** (23分)
3. **タイルの仕組み** (28分)
4. **MapLibre GL JS の概要とセットアップ** (27分)
5. **実習・質疑応答** (5分)

---

## 前回の振り返り

### 第4-5回の主要ポイント
- OpenStreetMapの歴史と哲学
- OSMコミュニティとデータ作成プロセス
- Overpass Turbo を使ったデータ取得
- Overpass API の活用方法

### 課題の確認

Overpass Turbo を使った興味のあるエリアのデータ調査
- 調査設計と仮説設定
- データ取得と分析
- 地理的分布の把握
- 技術的な学びの整理


### 課題の確認
個人の興味に基づく GeoJSON データの作成
- テーマの一貫性
- 複数のジオメトリタイプの使用
- 意味のあるプロパティ設定
- geojson.io での可視化

---

## ベースマップとオーバーレイの違い

### ウェブ地図の構成要素

#### 基本的な構造
```
ウェブ地図 = ベースマップ + オーバーレイ + UI要素
```

#### レイヤー構造
```
┌─────────────────┐ ← UI要素（ボタン、コントロール）
│  ┌───────────┐  │ ← オーバーレイ（データレイヤー）
│  │ ベースマップ │  │ ← 背景地図
│  └───────────┘  │
└─────────────────┘
```

---

### ベースマップ（Base Map）

#### 定義
> 地図の背景となる基本的な地理情報を表示するレイヤー

#### 主要な要素
- **道路網**：高速道路、国道、県道、市道
- **地形**：山、川、湖、海岸線
- **行政境界**：国境、都道府県境、市町村境
- **土地利用**：森林、農地、市街地
- **地名**：都市名、地域名、施設名

---

#### ベースマップの種類

##### 1. 道路地図（Road Map）
- **特徴**：道路網を中心とした表示
- **用途**：ナビゲーション、経路案内
- **例**：Google Maps、OpenStreetMap Standard

##### 2. 衛星画像（Satellite）
- **特徴**：航空写真・衛星写真
- **用途**：現地の実際の様子を確認
- **例**：Google Satellite、Bing Aerial

---

##### 3. 地形図（Terrain）
- **特徴**：標高・地形を強調
- **用途**：登山、地理学習
- **例**：OpenTopoMap、USGS Topo

##### 4. ダークマップ（Dark Map）
- **特徴**：暗い背景色
- **用途**：データ可視化の背景
- **例**：Mapbox Dark、CartoDB Dark Matter

---

### オーバーレイ（Overlay）

#### 定義
> ベースマップの上に重ねて表示される追加の情報レイヤー

#### 主要な種類
- **ポイントデータ**：店舗、施設、イベント地点
- **ルートデータ**：移動経路、境界線
- **エリアデータ**：統計区域、影響範囲
- **リアルタイムデータ**：交通情報、気象情報

---

#### オーバーレイの例

##### 1. POI（Point of Interest）
```javascript
// レストランの位置情報
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [135.5, 34.7]},
      "properties": {"name": "カフェA", "category": "restaurant"}
    }
  ]
}
```

##### 2. 統計データ
- **人口密度**：色分けによる可視化
- **売上データ**：円の大きさで表現
- **時系列データ**：アニメーションで表現

---

### ベースマップとオーバーレイの関係

#### 視覚的階層
```
高 ┌─────────────┐ ← ラベル・テキスト
   │ オーバーレイ │ ← データレイヤー
   │ ベースマップ │ ← 背景地図
低 └─────────────┘
```

#### 設計原則
- **ベースマップ**：控えめな色調、情報の整理
- **オーバーレイ**：目立つ色、重要な情報を強調
- **コントラスト**：背景と前景の明確な区別

---

## タイルの仕組み

### タイルベース地図の概念

#### タイルとは？
> 地図を小さな正方形の画像に分割したもの

#### 基本的な仕組み
1. **分割**：地図を256×256ピクセルのタイルに分割
2. **階層化**：ズームレベルごとに異なる解像度
3. **配信**：必要なタイルのみをダウンロード
4. **表示**：タイルを組み合わせて地図を構成

---

### ズームレベルとタイル数

#### ズームレベルの定義
- **レベル0**：全世界を1枚のタイル（256×256px）
- **レベル1**：全世界を4枚のタイル（2×2）
- **レベル2**：全世界を16枚のタイル（4×4）
- **レベルn**：全世界を4^n枚のタイル

#### 解像度の関係
| ズームレベル | タイル数 | 1ピクセルあたりの距離（赤道） |
|-------------|----------|------------------------------|
| 0 | 1 | 約156km |
| 5 | 1,024 | 約4.9km |
| 10 | 1,048,576 | 約153m |
| 15 | 1,073,741,824 | 約4.8m |

---

### タイル座標系

#### TMS（Tile Map Service）座標
```
Z/X/Y 形式
Z: ズームレベル
X: 横方向のタイル番号（西から東へ）
Y: 縦方向のタイル番号（南から北へ）
```

#### 例：大阪駅周辺（ズームレベル15）
```
https://tile.openstreetmap.org/15/29177/13212.png
```

#### タイル境界の計算
```javascript
// 緯度経度からタイル座標を計算
function deg2tile(lat, lon, zoom) {
  const latRad = lat * Math.PI / 180;
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const y = Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n);
  return {x, y, z: zoom};
}
```

---

## ラスタータイル vs ベクトータイル

### ラスタータイル（Raster Tiles）

#### 特徴
- **形式**：PNG、JPEG などの画像ファイル
- **事前生成**：サーバー側で描画済み
- **固定スタイル**：クライアント側での変更不可

#### メリット
- **高速表示**：画像の表示のみ
- **サーバー負荷軽減**：事前計算済み
- **複雑な表現**：写真、複雑なスタイル

---

#### デメリット
- **ファイルサイズ大**：画像データ
- **スタイル変更不可**：固定デザイン
- **高解像度対応困難**：Retina ディスプレイ
- **テキスト回転不可**：ラベルの向き固定

#### 利用例
```html
<!-- OpenStreetMap ラスタータイル -->
<img src="https://tile.openstreetmap.org/15/29177/13212.png" />
```

---

### ベクトータイル（Vector Tiles）

#### 特徴
- **形式**：PBF（Protocol Buffers）、JSON
- **ベクターデータ**：点・線・面の座標情報
- **クライアント描画**：ブラウザ側でレンダリング

#### メリット
- **リアルタイムスタイリング**：動的な色・サイズ変更
- **高解像度対応**：任意の解像度で描画
- **テキスト回転**：地図回転時のラベル追従
- **インタラクション**：クリック・ホバー対応

---

#### デメリット
- **クライアント負荷**：描画処理が重い
- **複雑な実装**：スタイル定義が必要
- **ブラウザ依存**：WebGL 対応必須

#### 利用例
```javascript
// MapLibre GL JS でのベクトータイル
map.addSource('osm', {
  type: 'vector',
  tiles: ['https://tile.example.com/{z}/{x}/{y}.pbf']
});
```

---

### タイル形式の比較

| 特徴 | ラスタータイル | ベクトータイル |
|------|----------------|----------------|
| **ファイルサイズ** | 大きい | 小さい |
| **表示速度** | 高速 | 中程度 |
| **カスタマイズ性** | 低い | 高い |
| **高解像度対応** | 困難 | 容易 |
| **インタラクション** | 制限あり | 豊富 |
| **実装複雑度** | 簡単 | 複雑 |

---

## MapLibre GL JS の概要

### MapLibre GL JS とは？

#### 概要
> オープンソースの WebGL ベース地図ライブラリ

#### 特徴
- **完全オープンソース**：MIT ライセンス
- **Mapbox GL JS のフォーク**：2020年に分岐
- **ベクトータイル対応**：高性能な地図表示
- **カスタマイズ性**：柔軟なスタイリング

---

### MapLibre GL JS の歴史

#### 背景
- **2020年**：Mapbox GL JS v2 が商用ライセンスに変更
- **コミュニティの対応**：オープンソース版の継続開発
- **MapLibre の誕生**：v1.15 をベースにフォーク

#### 現在の状況
- **活発な開発**：継続的なアップデート
- **企業採用**：多くの企業・組織が利用
- **エコシステム**：プラグイン・ツールの充実

---

### 主要な機能

#### 1. ベクトータイル表示
- **高速レンダリング**：WebGL による GPU 活用
- **スムーズなズーム**：連続的な拡大縮小
- **回転・傾斜**：3D 的な地図操作

#### 2. スタイリング
- **JSON ベース**：Mapbox Style Specification
- **レイヤー管理**：複数レイヤーの重ね合わせ
- **データドリブン**：属性値による動的スタイル

---

#### 3. インタラクション
- **イベント処理**：クリック・ホバー・ドラッグ
- **ポップアップ**：情報表示ウィンドウ
- **アニメーション**：スムーズな画面遷移

#### 4. データソース
- **GeoJSON**：直接読み込み
- **ベクトータイル**：効率的な大量データ
- **ラスタータイル**：従来形式との互換性
- **画像・動画**：メディアの重ね合わせ

---

## MapLibre GL JS のセットアップ

### 基本的なHTML構造

#### 最小限の実装
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MapLibre GL JS Example</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // JavaScript コードをここに記述
  </script>
</body>
</html>
```

---

### 基本的な地図の初期化

#### JavaScript コード
```javascript
const map = new maplibregl.Map({
  container: 'map', // HTML要素のID
  style: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles'
      }
    ]
  },
  center: [135.5, 34.7], // 初期中心座標 [経度, 緯度]
  zoom: 10 // 初期ズームレベル
});
```

---

### パッケージマネージャーでの導入

#### npm を使用した場合
```bash
# インストール
npm install maplibre-gl

# package.json への追加
{
  "dependencies": {
    "maplibre-gl": "^3.6.2"
  }
}
```

#### ES6 モジュールでの使用
```javascript
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
  // 設定オプション
});
```

---

### 地図の基本設定

#### 主要なオプション
```javascript
const map = new maplibregl.Map({
  container: 'map',           // 必須：HTML要素のID
  style: styleObject,         // 必須：スタイル定義
  center: [lng, lat],         // 初期中心座標
  zoom: 10,                   // 初期ズームレベル
  bearing: 0,                 // 初期回転角度（度）
  pitch: 0,                   // 初期傾斜角度（度）
  minZoom: 0,                 // 最小ズームレベル
  maxZoom: 22,                // 最大ズームレベル
  maxBounds: bounds,          // 表示可能範囲の制限
  attributionControl: true,   // 著作権表示の有無
  navigationControl: true     // ナビゲーションコントロールの有無
});
```

---

### イベントハンドリング

#### 地図の読み込み完了
```javascript
map.on('load', () => {
  console.log('地図の読み込みが完了しました');
  // データソースやレイヤーの追加はここで行う
});
```

#### ユーザーインタラクション
```javascript
// クリックイベント
map.on('click', (e) => {
  console.log('クリック座標:', e.lngLat);
});

// ズーム変更イベント
map.on('zoom', () => {
  console.log('現在のズームレベル:', map.getZoom());
});
```

---

## 実習：基本的なウェブページでの地図表示

### 実習目標
MapLibre GL JS を使用して、OpenStreetMap を背景とした基本的な地図を表示する

### 手順
1. HTML ファイルの作成
2. MapLibre GL JS の読み込み
3. 地図の初期化
4. 基本的なスタイル設定

---

### 実習コード
```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>第6回実習：基本的な地図表示</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
    .info-panel {
      position: absolute;
      top: 10px;
      left: 10px;
      background: white;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="info-panel">
    <h3>立命館大学周辺地図</h3>
    <p>MapLibre GL JS + OpenStreetMap</p>
  </div>
  <div id="map"></div>
  
  <script>
    const map = new maplibregl.Map({
      container: 'map',
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm'
          }
        ]
      },
      center: [135.5122, 34.9981], // 立命館大学衣笠キャンパス
      zoom: 14
    });

    // 地図読み込み完了時の処理
    map.on('load', () => {
      console.log('地図の読み込みが完了しました');
    });

    // クリック時の座標表示
    map.on('click', (e) => {
      console.log(`クリック座標: ${e.lngLat.lng}, ${e.lngLat.lat}`);
    });
  </script>
</body>
</html>
```

---

<div class="assignment">

## 課題：MapLibre GL JS を利用してベースマップを表示する簡単なウェブページを作成

### 課題内容
MapLibre GL JS を使用して、自分の興味のある地域を中心とした地図を表示するウェブページを作成してください。

### 要件

#### 1. 技術要件
- **MapLibre GL JS** の最新版を使用
- **OpenStreetMap** をベースマップとして使用
- **レスポンシブデザイン** に対応
- **適切なHTML構造** とセマンティックなマークアップ

#### 2. 機能要件
- **初期表示位置** を自分の選んだ地域に設定
- **適切なズームレベル** で表示
- **基本的なナビゲーション** 機能（ズーム・パン）
- **コンソールでの座標表示** （クリック時）

</div>

---

<div class="assignment">

#### 3. デザイン要件
- **情報パネル** の追加（地図の説明・タイトル）
- **適切なスタイリング** （CSS）
- **ユーザビリティ** を考慮したレイアウト

#### 4. ドキュメント要件
- **コメント** の適切な記述
- **著作権表示** の適切な設定
- **メタタグ** の適切な設定

### 選択可能な地域例
- 出身地・居住地
- 大学・学校周辺
- 好きな観光地
- 思い出の場所
- 興味のある都市

</div>

---

<div class="assignment">

### 提出物

#### 1. HTML ファイル
- **ファイル名**：`[学籍番号]_map.html`
- **完全に動作する** 単一のHTMLファイル
- **外部依存なし**（CDN使用は可）

#### 2. レポート
- **形式**：A4用紙1-2枚程度（PDF形式）
- **内容**：
  - 選択した地域とその理由
  - 実装で工夫した点
  - 技術的な学び・発見
  - 今後の改善アイデア
  - 実行結果のスクリーンショット

</div>

---

<div class="assignment">

### 評価基準
- **技術的実装**（40%）
  - MapLibre GL JS の正しい使用
  - HTML/CSS の品質
  - 動作の確実性
- **デザイン・ユーザビリティ**（30%）
  - 見た目の美しさ
  - 使いやすさ
  - レスポンシブ対応
- **内容の充実度**（20%）
  - 地域選択の妥当性
  - 個人的な関連性
- **ドキュメント**（10%）
  - コメントの適切性
  - レポートの質

### 提出期限・方法
- **期限**：次回授業開始時
- **方法**：Manaba+R経由

</div>

---

## 次回予告

### 第7-8回：MapLibre GL JS の基礎操作
- 地図の基本操作（移動・拡大縮小）
- 地図のカスタマイズ方法
- レイヤー追加の実践
- JSON形式でのスタイル定義
- GeoJSONデータの地図表示

### 準備事項
- 今回作成したHTMLファイルの動作確認
- 前回作成したGeoJSONデータの準備
- MapLibre GL JS ドキュメントの予習

---

## 質疑応答

### 本日の内容について
- ベースマップとオーバーレイの概念
- タイルの仕組み・座標系
- MapLibre GL JS の基本的な使用方法
- 課題に関する技術的な質問

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします

**第7-8回：MapLibre GL JS の基礎操作**
[日時・教室]

課題の提出をお忘れなく！
