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
  - 面積歪みがある（例：グリーンランド vs アフリカ）

---

##  前回の振り返り(2)

### 課題

- geojson.io で点・線・面を描く
- 説明＋スクショを添えてPDF/Wordで提出

---

## JSON フォーマットについて

- システム同士がデータを交換するためには何らかのフォーマットが必要
- 例: あなたのスマートフォンで動いているインターネット前提のシステム、フォーマットが定まっていなかったら？
- データ交換フォーマットで、ウェブの世界で支配的なのが JSON
- JavaScriptは知っているか？
- JavaScript で扱いやすいフォーマットが JSON (JavaScript Object Notation)
- そのほか XML とか、 YAML とか、色々ある

## JSON フォーマットに慣れよう

- ルール
    - 数字と文字列型、bool 型、null型
    - 配列型、オブジェクト型
    - 文字列型はダブルクオーテーション(`""`)で囲む
    - 配列型
      - `[]` 角かっこで囲む
      - 要素はカンマ `,` で連結
      - 要素は全ての型を利用可能。 配列やオブジェクトを入れ子にして良い
    - オブジェクト型
      - `{}` 波かっこで囲む
      - 要素は `"キー": 値` で記す
      - 要素はカンマ `,` で連結
      - 要素は全ての型を利用可能。 配列やオブジェクトを入れ子にして良い
    - 改行を入れても良い
    - 配列はオブジェクトの最後の要素の後にカンマ `,` を入れない

## GeoJSONフォーマットの理解

### GeoJSON とは？

#### 定義

> GeoJSON は地理空間データを JSON形式で表現するためのスタンダード

#### 特徴
- **人間が読みやすい**: テキストベースの形式
- **機械処理に適している**: プログラムでの解析が容易
- **Web標準**: ブラウザでネイティブサポート
- **軽量**: 効率的なデータ転送

- 実習: 過去の授業で使った geojson.io、また使って、フォーマットを観察してみる

---

### GeoJSON vs 他の地理空間データ形式

## テキスト

| 形式 | 特徴 | 用途 | ファイルサイズ |
|------|------|------|----------------|
| **GeoJSON** | JSON ベース、Web標準 | Web地図、API | 中程度 |
| **KML** | XML ベース、Google 標準 | Google Earth | 大きい |
| **GPX** | XML ベース、GPS 標準 | GPS 機器 | 中程度 |
| **TopoJSON** | トポロジー保持 | 効率的な配信 | 小さい |

## バイナリ・または複合

| **Shapefile** | ESRI 標準、バイナリ | GIS ソフト | 小さい |
| **GeoPackage** | ... | TODO

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
  "coordinates": [[
    [135.5, 34.7],
    [135.6, 34.7],
    [135.6, 34.8],
    [135.5, 34.8],
    [135.5, 34.7]
  ]]
}
```

<div class="note">

**注意**: Polygon の座標配列は二重配列
- 外側の配列: リング（外周 + 穴）
- 内側の配列: 座標点の配列
- 最初と最後の座標は同じ（閉じた形状）

</div>

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

#### GeometryCollection
```json
{
  "type": "GeometryCollection",
  "geometries": [
    {"type": "Point", "coordinates": [135.5, 34.7]},
    {"type": "LineString", "coordinates": [[135.6, 34.8], [135.7, 34.9]]}
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

#### プロパティの活用
- **name**: 名称
- **description**: 説明
- **category**: カテゴリ
- **任意のキー**: 自由に定義可能

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

## 座標系と座標の順序

### 座標系の指定

#### デフォルト座標系
- **WGS84**（EPSG:4326）が標準
- 明示的な指定は通常不要

#### CRS（Coordinate Reference System）
```json
{
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {"name": "EPSG:4326"}
  },
  "features": [...]
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

### 実習2: 個人の興味に基づくデータ作成

#### テーマ例
- **お気に入りカフェマップ**
- **ジョギングコース**
- **観光ルート**
- **通勤・通学経路**

#### 作成手順
1. テーマの決定
2. 対象地点・ルートの選定
3. 座標の取得（Google Maps、OpenStreetMap等）
4. GeoJSON形式での記述
5. プロパティ情報の追加

---

### 座標の取得方法

#### Google Maps を使用
1. 目的地を検索
2. 右クリック → 「この場所について」
3. 座標をコピー（緯度, 経度の順で表示）
4. GeoJSON用に順序を変更（経度, 緯度）

#### OpenStreetMap を使用
1. https://www.openstreetmap.org/ にアクセス
2. 目的地を検索
3. 右クリック → 「ここの住所を表示」
4. URL から座標を取得

---

### GeoJSON の検証とデバッグ

#### オンライン検証ツール
- **geojson.io**: https://geojson.io/
- **GeoJSON Lint**: https://geojsonlint.com/
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

#### 機能
- **インタラクティブ編集**: 地図上での直接編集
- **プロパティ編集**: 属性情報の追加・修正
- **エクスポート**: 様々な形式での保存

---

### MapLibre GL JS での表示（予習）

#### 基本的な表示方法
```javascript
map.on('load', () => {
  map.addSource('my-data', {
    type: 'geojson',
    data: 'my-data.geojson'  // または直接 GeoJSON オブジェクト
  });
  
  map.addLayer({
    id: 'my-layer',
    type: 'circle',
    source: 'my-data',
    paint: {
      'circle-radius': 6,
      'circle-color': '#007cbf'
    }
  });
});
```

---

## GeoJSON のベストプラクティス

### データ設計の原則

#### 1. 適切なジオメトリタイプの選択
- **Point**: 施設、イベント地点
- **LineString**: 道路、ルート、境界線
- **Polygon**: 建物、エリア、行政区域

#### 2. 意味のあるプロパティ設定
- **name**: 人間が読める名称
- **type/category**: 分類情報
- **description**: 詳細説明
- **url**: 関連リンク

---

#### 3. 一貫性のある命名規則
```json
{
  "properties": {
    "name": "施設名",
    "name_en": "English Name",
    "category": "restaurant",
    "subcategory": "japanese",
    "rating": 4.5,
    "website": "https://example.com"
  }
}
```

#### 4. 適切なデータサイズ
- **ファイルサイズの最適化**: 不要な精度の削除
- **Feature数の制限**: パフォーマンスを考慮
- **座標精度の調整**: 用途に応じた小数点桁数

---

### パフォーマンスの考慮

#### 大量データの処理
- **クラスタリング**: 近接する点のグループ化
- **レベル別表示**: ズームレベルに応じた表示制御
- **データの分割**: 地域・カテゴリ別のファイル分割

#### 効率的な座標表現
```json
// 高精度（不要な場合が多い）
[135.495912345, 34.702456789]

// 適切な精度（約10m精度）
[135.4959, 34.7025]
```

---

<div class="assignment">

## 課題: 自分でGeoJSONデータを作成し、簡単な地図を描画する

### 課題内容
個人の興味や経験に基づいたテーマで GeoJSON データを作成し、geojson.io を使って地図上で可視化してください。

### テーマ例
- **お気に入りスポットマップ**: カフェ、レストラン、書店など
- **思い出の場所マップ**: 旅行先、重要な場所
- **日常生活マップ**: 通学・通勤ルート、よく行く場所
- **趣味関連マップ**: スポーツ施設、文化施設、ショッピング
- **地域探索マップ**: 近所の発見、散歩コース

</div>

---

<div class="assignment">

### 要件

#### 1. データ構成
- **最低5つの Feature** を含む FeatureCollection
- **最低2種類のジオメトリタイプ** を使用（Point, LineString, Polygon）
- **意味のあるプロパティ** を各 Feature に設定

#### 2. 技術要件
- **正しい GeoJSON 形式** での記述
- **適切な座標系**（WGS84）の使用
- **座標の順序**（経度, 緯度）の遵守

#### 3. 内容要件
- **テーマの一貫性** を保つ
- **実在する場所** を対象とする
- **個人的な体験・知識** を反映

</div>

---

<div class="assignment">

### 提出物

#### 1. GeoJSON ファイル
- **ファイル名**: `[学籍番号]_[テーマ名].geojson`
- **形式**: 正しい GeoJSON 形式
- **文字コード**: UTF-8

#### 2. レポート
- **形式**: A4用紙2枚程度（PDF形式）
- **内容**: 
  - テーマ選択の理由
  - データ作成の過程
  - 各 Feature の説明
  - 技術的な学び・気づき
  - geojson.io での可視化結果（スクリーンショット）

</div>

---

<div class="assignment">

### 評価基準
- **技術的正確性**（30%）
  - GeoJSON 形式の正確性
  - 座標・ジオメトリの適切性
- **データ設計**（30%）
  - ジオメトリタイプの適切な選択
  - プロパティ設計の妥当性
- **内容の充実度**（25%）
  - テーマの一貫性
  - 個人的な体験の反映
- **レポートの質**（15%）
  - 作成過程の記録
  - 学びの整理

### 提出期限・方法
- **期限**: 次回授業開始時
- **方法**: 学習管理システム経由

</div>

---

## 次回予告

**第4-5回: OpenStreetMapのカルチャーと利用**

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

**第4回: OpenStreetMap について**

[日時・教室]

課題の提出をお忘れなく！
