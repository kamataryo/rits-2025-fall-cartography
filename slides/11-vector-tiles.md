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

---

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

---

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
# Maplibre GL JS のデモンストレーション用タイル
https://demotiles.maplibre.org/tiles/tiles.json
```

---

### 実習1: スタイルの読み込みとベースマップの確認

#### ステップ1: Maputnikを開く
1. https://maputnik.github.io/editor/ にアクセス
2. 画面上部の **"Open"** ボタンをクリック
3. **"Empty Style"** を選択して空のスタイルから始める
4. 検索窓で、「japan」などと検索して日本に移動

---

### 実習2: デモタイルでスタイルを作成

#### ステップ1: データソースの追加
1. 画面上部の **"Sources"** ボタンをクリック
2. **"Add Source"** を選択
3. 以下の情報を入力:
   ```
   Source ID: demotile
   Source Type: Vector (TileJSON URL)
   TileJSON URL: https://demotiles.maplibre.org/tiles/tiles.json
   ```
4. **"Add"** をクリック

---

### 実習2: 続き - レイヤーの追加

#### ステップ2: 全ての国を表示するレイヤー
1. 左パネル下部の **"Add Layer"** をクリック
2. 以下の設定を入力:
   ```
   ID: all
   Type: Fill
   Source: demotile
   Source Layer: countries
   ```
3. 全ての国が表示されることを確認

---

#### ステップ3: 日本を赤く塗るレイヤー
1. もう一度 **"Add Layer"** をクリック
2. 以下の設定:
   ```
   ID: japan
   Type: Fill
   Source: demotile
   Source Layer: countries
   ```
3. **"Filter"** セクションで **"Add filter"** をクリック
4. 以下のフィルターを設定:
   ```json
   ["all", ["==", "NAME", "Japan"]]
   ```
5. **"Paint properties"** で `fill-color` を `#ff0000` (赤) に設定

---

#### ステップ4: 国名ラベルを追加
1. **"Add Layer"** をクリック
2. 以下の設定:
   ```
   ID: labels
   Type: Symbol
   Source: demotile
   Source Layer: countries
   ```
3. **"Layout properties"** セクションを開く
4. **"text-field"** に `{NAME}` を入力
   - これで各国の `NAME` プロパティがラベルとして表示される

---

### 完成したスタイルのJSON

ここまでの設定をJSONで表すと以下のようになります:

```json
{
  "version": 8,
  "name": "Empty Style",
  "sources": {
    "demotile": {
      "type": "vector",
      "url": "https://demotiles.maplibre.org/tiles/tiles.json"
    }
  },
  "glyphs": "https://orangemug.github.io/font-glyphs/glyphs/{fontstack}/{range}.pbf",
  "layers": [
    {
      "id": "all",
      "type": "fill",
      "source": "demotile",
      "source-layer": "countries"
    },
    {
      "id": "japan",
      "type": "fill",
      "source": "demotile",
      "source-layer": "countries",
      "filter": ["all", ["==", "NAME", "Japan"]],
      "paint": {"fill-color": "red"}
    },
    {
      "id": "labels",
      "type": "symbol",
      "source": "demotile",
      "source-layer": "countries",
      "layout": {"text-field": "{NAME}"}
    }
  ]
}
```

---

### ソースレイヤーについて

#### ベクトルタイルの構造
- ベクトルタイルは、**ソース内に複数のレイヤー**を持つ
- これは、style.json のレイヤーとは**異なる**概念
- **source-layer**: ベクトルタイル内のデータレイヤー
- **layer (style)**: 描画方法を定義するスタイルレイヤー

#### 今回のデモタイルの構造
```
demotile (Source)
  └─ countries (Source Layer)
      ├─ NAME プロパティ
      ├─ ABBREV プロパティ
      └─ CONTINENT プロパティ
```

---

### 重要なポイント（復習）

#### レイヤーの描画順序
- レイヤーは**配列の順序**で下から上に描画される
- 今回の例:
  1. `all` (全ての国) が最初に描画
  2. `japan` (日本だけ赤) が上に描画
  3. `labels` (国名) が最前面に描画

---

#### フィルターの活用
```json
["==", "NAME", "Japan"]  // NAMEプロパティが"Japan"と等しい
["all", ...]              // 全ての条件を満たす
```

#### データプロパティの参照
```
text-field: {NAME}       // プロパティを中括弧で参照
```

---

<div class="assignment">

## 課題:Maputnikで独自スタイルを作成

### 課題内容

Maputnik を 使用して、国を「大陸ごと」に塗り分ける地図スタイルを作成してください。

### 進め方のヒント

1. demotile のベクトルタイルレイヤーについて、どのようなソースレイヤーがあるのかを確認する
2. 大陸の色分けに利用できるソースレイヤーを特定し、ソースとして指定する
3. `filter` または `paint` プロパティで Expression を使用し、塗り分けを行うレイヤーを追加する<br>※ 1つのレイヤーで塗り分けを行っても良いし、複数のレイヤーを用意しても良い

---

### 提出期限・方法

- **期限**: 12/23(火)
- **方法**: Maputnik からJSONファイルを出力し、それを Manaba+R 経由で提出

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします

課題の提出をお忘れなく!
