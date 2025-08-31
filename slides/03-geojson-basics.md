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

## 第3回: GeoJSON の基礎

立命館大学 2025年度 秋セメスター 火曜5限
授業時間: 95分

---

## 本日のアジェンダ

1. **前回の振り返り・課題確認** (12分)
2. **GeoJSONフォーマットの理解** (28分)
3. **GeoJSONの構造と記法** (28分)
4. **簡単なGeoJSONファイルの作成** (22分)
5. **地図上での可視化方法** (5分)

---

## 前回の振り返り

### 第2回の主要ポイント

- 空間データ = 位置（緯度経度）＋形状（ジオメトリ）＋属性
- 主要なジオメトリ
  - Point (点)
  - LineString (線)
  - Polygon (面)
- **GeoJSON** で表現（点・線・面を記述できる）
- 投影法: Web地図は主に「Webメルカトル図法」

---

##  前回の振り返り(2)

### 課題

- geojson.io で点・線・面を描く
- 説明＋スクショを添えてPDF/Wordで提出

---

## データ交換フォーマット

GeoJSON vs. JSON

- GeoJSON は JSON フォーマットで位置情報を表すもの
- ウェブシステムなどの文脈では「データ交換フォーマット」などとも呼ばれる

---

### データ交換フォーマットの役割

- 天気アプリ -> 気象庁のサーバーからデータを取得
- 地図アプリ -> 地図データサーバーからデータを取得
- SNSアプリ -> 友達の投稿データを取得

アプリ <-> サーバー間でデータを送り合う共通のフォーマットが必要
JSON、 XML、 CSV、 etc.

---

## JSON - **J**ava**S**cript **O**bject **N**otation

#### 特徴

- テキスト形式
- ブラウザで標準的にサポート、プログラム (JavaScript)での解析が容易

#### 他のデータ交換フォーマット

- **XML**: より複雑なデータ構造を表現可能。GPX など
- **YAML**: 人間が読みやすい
- **CSV**: 表形式データに特化

---

## JSON の基本データ型

### プリミティブ型（基本型）

#### 1. 数値型
```json
42
3.14159
-10
```

---

#### 2. 文字列型
```json
"Hello, World!"
"立命館大学"
"2025-01-15"
```
**重要**: 必ずダブルクオーテーション `""` で囲む

---

#### 3. 真偽値型
```json
true
false
```

#### 4. null型
```json
null
```

---

## JSON の配列型

### 配列の基本構文

```json
[要素1, 要素2, 要素3]
```

#### 特徴
- `[]` 角かっこで囲む
- 要素はカンマ `,` で区切る
- 異なる型の要素を混在可能
- 配列の中に配列やオブジェクトも入れられる

---

#### 例
```json
["りんご", "みかん", "バナナ"]
[1, 2, 3, 4, 5]
[true, false, null, 42, "文字列"]
```

---

### 実習: 配列を書いてみよう

あなたの好きな食べ物トップ3を JSON の配列形式で書いてみよう。

**例**: `["ラーメン", "寿司", "カレー"]`

<vote-form vote-key="favorite-foods-array" freetext="on" view="freeflow">
  <style>
    .vote-contents {
      flex-direction: column;
    }
    #vote-form {
      display: flex;
      align-items: center;
    }
    #vote-form .free-input-group {
      flex-grow: 1;
      margin-right: 1em;
    }
    .chart-container, .freeflow-container {
      height: 200px;
    }
  </style>
</vote-form>

---

## JSON のオブジェクト型

### オブジェクトの基本構文

```json
{
  "キー1": 値1,
  "キー2": 値2,
  "キー3": 値3
}
```

#### 特徴
- `{}` 波かっこで囲む
- `"キー": 値` のペアで構成
- 要素はカンマ `,` で区切る
- キーは必ず文字列（ダブルクオーテーションで囲む）
- 値は任意の JSON データ型（プリミティブ型、配列型、オブジェクト型）

---

#### オブジェクトの例

```json
{
  "name": "田中太郎",
  "age": 20,
  "student": true,
  "university": "立命館大学",
  "hobbies": ["読書", "映画鑑賞", "プログラミング"]
}
```

改行しなくてもよい。（見やすいように）

```json
{ "名前": "ミケ", "種類": "ネコ", "年齢": 7 }
```

---

### 実習: オブジェクトを書いてみよう

今日のお昼ご飯を JSON のオブジェクト形式で表現してみよう。
メニュー名と値段をキーとして使ってください。

**例**: `{"メニュー": "親子丼", "値段": 800}`

<vote-form vote-key="lunch-object" freetext="on" view="freeflow">
  <style>
    .vote-contents {
      flex-direction: column;
    }
    #vote-form {
      display: flex;
      align-items: center;
    }
    #vote-form .free-input-group {
      flex-grow: 1;
      margin-right: 1em;
    }
    .chart-container, .freeflow-container {
      height: 200px;
    }
  </style>
</vote-form>

---

## JSON 記法のルール

#### 1. 文字列は必ずダブルクオーテーション
```json
// ✅ 正しい
"Hello"

// ❌ 間違い
'Hello'
Hello
```

---

#### 2. 最後の要素の後にカンマは不要
```json
// ✅ 正しい
["a", "b", "c"]
{"x": 1, "y": 2}

// ❌ 間違い
["a", "b", "c",]
{"x": 1, "y": 2,}
```

#### 3. 改行・インデントは自由
```json
{"name": "太郎", "age": 20}

{
  "name": "太郎",
  "age": 20
}
```

---

### JSON 理解度チェック

以下の JSON のうち、**文法的に正しくない**ものはどれでしょうか？

```json
{
  "name": "田中太郎",
  "age": 20,
  "hobbies": ["読書", "映画"]
}
```

```json
{
  'name': '田中太郎',
  'age': 20,
  'hobbies': ['読書', '映画']
}
```

```json
{
  name: "田中太郎",
  age: 20,
  hobbies: ["読書", "映画",]
}
```

---

## GeoJSONフォーマットの理解

### GeoJSON とは？

#### 定義

> GeoJSON は空間データを JSON形式で表現するためのフォーマット

- 実習: 過去の授業で使った [geojson.io](https://geojson.io) をまた使って、フォーマットを観察してみる

用語: feature = 地物

---

### GeoJSON vs 他の地理空間データ形式

## テキスト

| 形式 | 特徴 | 用途 |
|------|------|------|
| **GeoJSON** | JSON ベース、Web標準 | Web地図、API | 
| **KML** | XML ベース、Google 標準 | Google Earth |
| **GPX** | XML ベース、GPS 標準 | GPS 機器 |
| **Shapefile** | ESRI 標準、バイナリ | GIS ソフト | 小さい |
| **GeoPackage** | バイナリ |　GIS ソフト |  

---

## GeoJSONの構造と記法

### 基本構造

#### GeoJSON オブジェクトの種類
1. **Geometry**: 幾何学的形状
2. **Feature**: 地理的特徴（ジオメトリ + 属性）
3. **FeatureCollection**: 複数の Feature をまとめたもの

#### 必須プロパティ
```json
{
  "type": "FeatureCollection",
  "features": [...]
}
```

---

### Geometry オブジェクト

#### Point（点）
```json
{
  "type": "Point",
  "coordinates": [135.5, 34.7]
}
```

#### LineString（線）
```json
{
  "type": "LineString",
  "coordinates": [
    [135.5, 34.7],
    [135.6, 34.8],
    [135.7, 34.9]
  ]
}
```

---

#### Polygon（面）
```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [135.5, 34.7],
      [135.6, 34.7],
      [135.6, 34.8],
      [135.5, 34.8],
      [135.5, 34.7]
    ]
  ]
}
```

**注意**: Polygon の座標配列は二重配列
- 外側の配列: リング（外周 + 穴）
- 内側の配列: 座標点の配列
- 最初と最後の座標は同じ（閉じた形状）

---

### ドーナツ(参考)

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [ [-10, -10], [ 10, -10], [ 10,  10], [-10,  10], [-10, -10] ],
          [ [-5,   -5], [ -5,   5], [ 5,    5], [  5,  -5], [-5,  -5 ] ]
        ]
      }
    }
  ]
}
```

---

### 複合 Geometry

#### MultiPoint
```json
{
  "type": "MultiPoint",
  "coordinates": [
    [135.5, 34.7],
    [135.6, 34.8]
  ]
}
```

#### MultiLineString
```json
{
  "type": "MultiLineString",
  "coordinates": [
    [[135.5, 34.7], [135.6, 34.8]],
    [[135.7, 34.9], [135.8, 35.0]]
  ]
}
```

---

#### MultiPolygon
```json
{
  "type": "MultiPolygon",
  "coordinates": [
    [[[135.5, 34.7], [135.6, 34.7], [135.6, 34.8], [135.5, 34.8], [135.5, 34.7]]],
    [[[135.8, 35.0], [135.9, 35.0], [135.9, 35.1], [135.8, 35.1], [135.8, 35.0]]]
  ]
}
```

---

### Feature オブジェクト

#### 基本構造
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [135.4959, 34.7024]
  },
  "properties": {
    "name": "大阪駅",
    "type": "railway_station",
    "operator": "JR西日本"
  }
}
```

---

#### プロパティの活用
- `name`: 名称
- `description`: 説明
- `category`: カテゴリ
- その他、任意のキーを使ってプロパティを自由に定義可能

---

### FeatureCollection オブジェクト

#### 複数の Feature をまとめる
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [135.4959, 34.7024]},
      "properties": {"name": "大阪駅"}
    },
    {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [135.5008, 34.6937]},
      "properties": {"name": "梅田駅"}
    }
  ]
}
```

---

### 座標の順序

#### GeoJSON の標準
```json
[経度, 緯度, 標高（オプション）]
```

#### 注意点
- **経度が先、緯度が後**
- 多くの地図ライブラリとは逆順
- 標高は3番目の要素（オプション）

#### 例: 大阪駅の座標
```json
[135.4959, 34.7024]  // [経度, 緯度]
```

---

## 簡単なGeoJSONファイルの作成

### 実習1: 大学周辺の施設マップ

#### 目標
立命館大学周辺の主要施設を GeoJSON で表現

#### 作成する Feature
1. **大学本部**（Point）
2. **最寄り駅**（Point）
3. **通学路**（LineString）
4. **キャンパス敷地**（Polygon）

---

#### 1. 大学本部（Point）
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [135.5122, 34.9981]
  },
  "properties": {
    "name": "立命館大学衣笠キャンパス",
    "type": "university",
    "description": "メインキャンパス"
  }
}
```

---

#### 2. 最寄り駅（Point）
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [135.5089, 35.0039]
  },
  "properties": {
    "name": "龍安寺駅",
    "type": "railway_station",
    "line": "京福電鉄北野線"
  }
}
```

---

#### 3. 通学路（LineString）
```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [135.5089, 35.0039],
      [135.5100, 35.0020],
      [135.5110, 35.0000],
      [135.5122, 34.9981]
    ]
  },
  "properties": {
    "name": "龍安寺駅から大学への通学路",
    "type": "footway",
    "distance": "約800m"
  }
}
```

---

#### 4. キャンパス敷地（Polygon）
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[
      [135.5100, 34.9990],
      [135.5140, 34.9990],
      [135.5140, 34.9970],
      [135.5100, 34.9970],
      [135.5100, 34.9990]
    ]]
  },
  "properties": {
    "name": "立命館大学衣笠キャンパス敷地",
    "type": "university_campus",
    "area": "約67万平方メートル"
  }
}
```

---

#### 完全な FeatureCollection
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [135.5122, 34.9981]},
      "properties": {"name": "立命館大学衣笠キャンパス", "type": "university"}
    },
    {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [135.5089, 35.0039]},
      "properties": {"name": "龍安寺駅", "type": "railway_station"}
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [[135.5089, 35.0039], [135.5122, 34.9981]]
      },
      "properties": {"name": "通学路", "type": "footway"}
    }
  ]
}
```

---

<div class="assignment">

## 課題: 自分でGeoJSONデータを作成し、簡単な地図を描画する

### 課題内容
個人の興味や経験に基づいたテーマで GeoJSON データを作成し、geojson.io を使って地図上で可視化してください。

### テーマ例
- **お気に入りスポットマップ**: カフェ、レストラン、書店など
- **日常生活マップ**: 通学・通勤ルート、よく行く場所
- **趣味関連マップ**: スポーツ施設、文化施設、ショッピング
- **地域探索マップ**: 近所の発見、散歩コース

</div>

---

<div class="assignment">

### 要件

#### 1. データ構成
- **最低5つの Feature** を含む FeatureCollection
- **最低2種類のジオメトリタイプ** を使用
（Point, LineString, Polygon から 2つ。または全て）
- **意味のあるプロパティ** を各 Feature に設定

#### 2. 技術要件
- **正しい GeoJSON 形式** での記述

</div>

---

#### 作成手順
1. テーマの決定
2. 対象地点やルート、エリアなどを選定
3. 座標の取得（Google Maps、OpenStreetMap 等）
4. GeoJSON形式での記述 (Windows のメモ帳や任意のテキストエディタを使う)
5. プロパティ情報の追加

### 座標の取得方法

- Google Maps を使用
- 地理院地図を使用

※ geojson.io 上でも直接作業できますが、できる限りエディタ上で直接記述してみてください。

---

### GeoJSON の検証とデバッグ

#### オンライン検証ツール
- **geojson.io**: https://geojson.io/
- **JSON Formatter**: https://jsonformatter.curiousconcept.com/

#### よくあるエラー
1. **座標の順序間違い**: 緯度・経度の順序
2. **閉じていないPolygon**: 最初と最後の座標が異なる
3. **JSON構文エラー**: カンマ、括弧の不備
4. **座標の範囲外**: 緯度±90°、経度±180°を超過

---

## 地図上での可視化方法

### geojson.io での可視化

#### 使用方法
1. https://geojson.io/ にアクセス
2. 左側のエディタに GeoJSON を貼り付け
3. 右側の地図で結果を確認
4. 編集・修正をリアルタイムで反映

---

<div class="assignment">

### 提出物

#### GeoJSON ファイル
- **ファイル名**: `[学籍番号]_[テーマ名].geojson`
- **形式**: 正しい GeoJSON 形式
- **文字コード**: UTF-8

</div>

---

<div class="assignment">

### 評価基準
  - JSON フォーマットとして適切か
  - GeoJSON フォーマットとして適切か
  - 座標・ジオメトリがテーマに対して適切に設定されているか
  - プロパティが適切に設定されているか

### 提出期限・方法
- **期限**: 次回授業開始時
- **方法**: Manaba+R経由

</div>

---

## 次回予告

**第4-5回: OpenStreetMapのカルチャーと利用**

授業準備: 以下のサイトから、アカウント登録を行なっておいてください。
https://www.openstreetmap.org/user/new

---

## 質疑応答

### 本日の内容について
- GeoJSON の構造・記法について
- 座標系・座標順序について
- データ作成の技術的な質問
- 課題に関する質問

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします

**第4-5回: OpenStreetMap について**

[日時・教室]

課題の提出をお忘れなく！
