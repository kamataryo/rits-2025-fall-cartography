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

## 第11回:ベクトルタイルの仕組みと実践

立命館大学 2025年度 秋セメスター 火曜5限
授業時間:95分

---

## 本日のアジェンダ

2. **ベクトルタイルとは何か**
3. **ベクトルタイルの形式とスキーマ**
4. **Tippecanoeによるタイル生成**
5. **Maputnikによるスタイル編集実習**
6. **課題説明**

---

## ベクトルタイルとは何か

### なぜベクトルタイルが必要なのか?

```javascript
// 全世界の道路データをGeoJSONで配信すると...
{
  "type": "FeatureCollection",
  "features": [
    // 数百万〜数千万(?)のフィーチャー
    // ファイルサイズ: 数十GB〜数百GB
  ]
}
```

- **膨大なファイルサイズ**: 全データを一度にダウンロードは不可能
- **読み込み時間**: ユーザーは待てない
- **メモリ消費**: ブラウザがクラッシュする可能性
- **帯域幅**: モバイル環境では特に深刻

---

## 解決策:タイル分割方式

#### ラスタータイルと同じ発想
```
全世界のデータを小さなタイルに分割
→ 必要な部分だけ配信
```

#### ベクトルタイルの特徴
- **タイル分割**: 256×256ピクセル単位
- **階層構造**: ズームレベル0〜14(またはそれ以上)
- **逐次配信**: 表示領域のタイルのみダウンロード
- **軽量**: 一般的にラスタータイルより小さい
- **柔軟**: クライアント側でスタイル変更可能

---

### ベクトルタイルの配信方式

#### タイルの命名規則
```
/{z}/{x}/{y}.pbf
```

**例:**
```
/14/14550/6451.pbf  # 東京付近のタイル(ズーム14)
/10/909/403.pbf     # 日本列島のタイル(ズーム10)
/5/28/12.pbf        # アジア地域のタイル(ズーム5)
```

---

## ベクトルタイルの形式とスキーマ

### PBF (Protocol Buffers) 形式

#### なぜPBFなのか?

**GeoJSON形式の問題:**
```json
{
  "type": "Feature",
  "geometry": {"type": "Point", "coordinates": [139.767, 35.681]},
  "properties": {"name": "東京", "population": 13960000}
}
```
- テキスト形式で冗長
- 数値を文字列として保存
- ファイルサイズが大きい

---

## PBF (Protocol Buffers) の利点

- **バイナリ形式**: 効率的なデータ表現
- **圧縮効率**: データによるが、GeoJSONの数分の1のサイズ
- **高速パース**: 読み書きが速い

### サイズ比較例

地理院ベクトルタイルからサンプルを抽出:
https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap-v1/14/14550/6451.pbf


```plaintext
GeoJSON: 1.7 MB
PBF:     84 KB (約21分の1)
```

---

## Tippecanoeによるタイル生成

### Tippecanoeとは?

**Mapbox製のベクトルタイル生成ツール**
- GeoJSON → ベクトルタイル (MBTiles) への変換
- 自動的な詳細度調整
- 効率的なデータ圧縮

---s

#### インストール(macOS)
```bash
brew install tippecanoe
```

#### インストール(Linux)
```bash
git clone https://github.com/felt/tippecanoe.git
cd tippecanoe
make -j
sudo make install
```

---

### 基本的なワークフロー

#### 1. GeoJSONデータの準備
```bash
# データの確認
head input.geojson
```

#### 2. ベクトルタイルの生成
```bash
tippecanoe -o output.mbtiles \
  --minimum-zoom=0 --maximum-zoom=14 \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  input.geojson
```

**主要オプション:**
- `--minimum-zoom`: 最小ズームレベル
- `--maximum-zoom`: 最大ズームレベル
- `--drop-densest-as-needed`: 自動間引き
- `--layer=name`: レイヤー名の指定

---

#### 3. MBTilesからタイルを抽出(オプション)
```bash
tile-join --no-tile-compression \
  --output-to-directory=tiles/ \
  output.mbtiles
```

これにより `tiles/{z}/{x}/{y}.pbf` の形式でファイルが生成されます。

#### 4. tiles.jsonの作成
```bash
# MBTilesからメタデータを抽出
mb-util --image_format=pbf output.mbtiles tiles/
```

**本授業では詳細には触れませんが、実務では重要なツールです。**

---

## Maputnikによるスタイル編集(実習)

### Maputnikとは?

**ビジュアルスタイルエディタ**
- MapLibre/Mapboxのスタイル仕様に対応
- ブラウザベースのGUIエディタ
- リアルタイムプレビュー
- オープンソース

**公式サイト:**
https://maputnik.github.io/

---

### Maputnikの起動

#### オンライン版
https://maputnik.github.io/editor/

---

### 実習の準備

#### 使用するデータソース
今回は以下のベクトルタイルソースを使用します:

```shell
# 国土地理院ベクトルタイル(実験的)
https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap-v1/{z}/{x}/{y}.pbf
```

---

### 実習1: スタイルの読み込みとベースマップの確認

#### ステップ1: Maputnikを開く
1. https://maputnik.github.io/editor/ にアクセス
2. 画面上部の **"Open"** ボタンをクリック
3. 次のソースとレイヤのサンプル入力する
4. 検索窓で、「japan」などと検索して日本に移動

---

```json
{
  "sources": {
    "demotile": {
      "type": "vector",
      "url": "https://demotiles.maplibre.org/tiles/tiles.json"
    }
  },
  "layers": [
    {
      "id": "",
      "type": "fill",
      "source": "demotile",
      "source-layer": "countries"
    }
  ],
}
```

---

### ソースレイヤーについて

- ベクトルタイルは、ソース内にレイヤーがある
- これは、style.json のレイヤーとは**異なる**ので注意
- 今回使うデモタイルでは、countries などがある


#### レイヤー構造を確認
左パネルのレイヤーリストを見てみましょう:

```
📁 background (背景色)
📁 water (水域)
📁 landcover (土地被覆)
📁 park (公園)
📁 building (建物)
📁 road_* (道路の各種レイヤー)
📁 place_* (地名ラベル)
```

**重要なポイント:**
- レイヤーは**下から上に**描画される
- 上のレイヤーが下のレイヤーを覆う
- レイヤーの表示/非表示を切り替えられる

---

### 実習3: 水域の色を変更

#### ステップ1: waterレイヤーを選択
1. 左パネルで **"water"** レイヤーをクリック
2. 右パネルに設定が表示される

#### ステップ2: 色を変更
1. **"Paint properties"** セクションを確認
2. **"fill-color"** の色をクリック
3. カラーピッカーで好きな色を選択
   - 例: `#3498db` (明るい青)
   - 例: `#1abc9c` (青緑)

#### ステップ3: 透明度を調整
1. **"fill-opacity"** のスライダーを調整
2. 0.0〜1.0の範囲で設定

---

### 実習4: 道路のスタイリング

#### ステップ1: 道路レイヤーを見つける
1. `road_*` で始まるレイヤーを探す
2. 例: `road_primary` (主要道路)

#### ステップ2: 道路の色を変更
```
レイヤー: road_primary
タイプ: line
設定:
  line-color: #f39c12 (オレンジ)
  line-width: 3
```

#### ステップ3: ズームレベルで幅を変化
1. **"line-width"** をクリック
2. **"Function"** を選択
3. ズームレベルごとに幅を設定:
   ```
   zoom 10: 1
   zoom 14: 3
   zoom 18: 8
   ```

---

### 実習5: 建物の3D表示(Extrusion)

#### ステップ1: buildingレイヤーを選択

#### ステップ2: 3D表示を有効化
1. **"Paint properties"** で設定:
   ```
   fill-extrusion-height:
     ["get", "render_height"]  # データの高さ属性を使用

   fill-extrusion-base:
     ["get", "render_min_height"]  # 基準高さ

   fill-extrusion-color: #cccccc

   fill-extrusion-opacity: 0.8
   ```

#### ステップ3: 地図を傾ける
- マップ上で **Ctrl + ドラッグ** (Macは **Cmd + ドラッグ**)
- 3D建物が表示される!

---

### 実習6: データドリブンスタイリング

#### 道路の種類で色分け

```json
{
  "id": "road",
  "type": "line",
  "source": "openmaptiles",
  "source-layer": "transportation",
  "paint": {
    "line-color": [
      "match",
      ["get", "class"],
      "motorway", "#e74c3c",
      "trunk", "#e67e22",
      "primary", "#f39c12",
      "secondary", "#f1c40f",
      "tertiary", "#95a5a6",
      "#bdc3c7"
    ],
    "line-width": [
      "match",
      ["get", "class"],
      "motorway", 6,
      "trunk", 5,
      "primary", 4,
      "secondary", 3,
      "tertiary", 2,
      1
    ]
  }
}
```

Maputnikで上記の設定を試してみましょう!

---

### 実習7: ラベルのカスタマイズ

#### 地名ラベルを見つける
1. `place_*` レイヤーを探す
2. 例: `place_city` (都市名)

#### フォント設定
```json
{
  "id": "place_city",
  "type": "symbol",
  "source": "openmaptiles",
  "source-layer": "place",
  "filter": ["==", ["get", "class"], "city"],
  "layout": {
    "text-field": ["get", "name"],
    "text-font": ["Noto Sans Bold"],
    "text-size": 14
  },
  "paint": {
    "text-color": "#2c3e50",
    "text-halo-color": "#ffffff",
    "text-halo-width": 2
  }
}
```

---

### 実習8: スタイルのエクスポート

#### ステップ1: スタイルを保存
1. 画面上部の **"Export"** ボタンをクリック
2. **"Download Style"** を選択
3. `style.json` ファイルがダウンロードされる

#### ステップ2: MapLibre GL JSで使用
```html
<!DOCTYPE html>
<html>
<head>
  <script src='https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js'></script>
  <link href='https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css' rel='stylesheet' />
</head>
<body>
  <div id="map" style="width: 100%; height: 600px;"></div>
  <script>
    const map = new maplibregl.Map({
      container: 'map',
      style: './style.json',  // エクスポートしたスタイル
      center: [139.767, 35.681],
      zoom: 12
    });
  </script>
</body>
</html>
```

---

### 実習のポイント

#### tiles.jsonの重要性
- Maputnikは**tiles.json**を読み込んでスキーマを理解
- どんなレイヤーがあるか
- どんなプロパティがあるか
- ズームレベルの範囲は?

#### データの見づらさへの対処
- PBFは直接見られない
- **Maputnikのプレビュー**で視覚的に確認
- **Developer Tools → Network**でタイルのダウンロードを監視
- `source-layer`の名前は**tiles.jsonで確認**

---

### よくあるトラブルと解決方法

#### 1. レイヤーが表示されない
**チェックリスト:**
- `source-layer` 名は正しい?
- `filter` で除外されていない?
- `minzoom`/`maxzoom` の範囲内?
- レイヤーの順序は適切?

#### 2. プロパティが見つからない
**対処法:**
- tiles.jsonで利用可能なプロパティを確認
- Maputnikのインスペクタで実データを確認
- `["get", "property_name"]` のスペルミスをチェック

---

<div class="assignment">

## 課題:Maputnikで独自スタイルを作成

### 課題内容
Maputnikを使用して、あなた独自の地図スタイルを作成してください。

### 要件

#### 1. 技術要件
- **ベクトルタイルソース**を使用(OpenMapTiles、Protomaps等)
- 最低**5種類のレイヤー**をカスタマイズ
  - 例: water, building, road, park, labelなど
- **データドリブンスタイリング**を1つ以上使用
- **ズームレベル対応**のスタイリングを1つ以上実装

#### 2. デザイン要件
- **統一感のある配色**
- **可読性の高いラベル**
- **明確なテーマ**を持つこと
  - 例: 「レトロな地図」「サイバーパンク風」「モノクローム」など

</div>

---

<div class="assignment">

### 提出物

#### 1. スタイルJSONファイル
- **ファイル名**: `[学籍番号]_style.json`
- Maputnikからエクスポートしたスタイル定義

#### 2. HTMLファイル
- **ファイル名**: `[学籍番号]_map.html`
- 作成したスタイルを使用した完全に動作する地図
- スタイルJSONは**インライン**で埋め込む(外部ファイル参照不可)

#### 3. デザインレポート
- **形式**: A4用紙2枚程度(PDF形式)
- **ファイル名**: `[学籍番号]_report.pdf`
- **内容**:
  - スタイルのコンセプト・テーマ
  - カスタマイズしたレイヤーの説明
  - 使用したデータドリブンスタイリングの解説
  - 技術的に工夫した点
  - 苦労した点と解決方法
  - tiles.jsonの役割についての考察

</div>

---

<div class="assignment">

### 評価基準
- **技術的実装**(40%)
  - データドリブンスタイリングの活用
  - ズームレベル対応の実装
  - レイヤーの適切な設定
  - コードの品質
- **デザイン性**(30%)
  - テーマの明確さ
  - 配色の統一感
  - 視覚的な美しさ
  - 可読性の高さ
- **レポート**(30%)
  - スタイル設計の説明
  - 技術的考察の深さ
  - tiles.jsonの理解度
  - 文章の明瞭さ

### 提出期限・方法
- **期限**: 次回授業開始時
- **方法**: Manaba+R経由(3ファイルをZIPにまとめて提出)

</div>

---

## 次回予告

### 第12回:高度な地図アプリケーション開発
- カスタムコントロールの実装
- 地図とUIの統合
- パフォーマンスチューニング
- プラグインの活用

### 準備事項
- 今回作成したスタイルの動作確認
- Maputnikの使い方の復習
- MapLibre GL JS APIドキュメントの確認

---

## 質疑応答

### 本日の内容について
- ベクトルタイルの仕組み
- PBF形式とtiles.json
- Tippecanoeの使い方
- Maputnikでのスタイリング
- 課題に関する質問

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします

**第12回:高度な地図アプリケーション開発**
[日時・教室]

課題の提出をお忘れなく!
