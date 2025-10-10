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

## JSONサンプル

```json
[
  {
    "name": "たま",
    "species": "cat",
    "age": 5,
    "favorites": ["カリカリ", "またたび"],
    "location": { "pref": "京都府", "city": "京都市" }
  },
  {
    "name": "ポチ",
    "species": "dog",
    "age": 6,
    "favorites": ["いも", "肉類"],
    "location": { "pref": "滋賀県", "city": "大津市" }
  }
]
```

---

## XMLサンプル

### 要素ベース

```xml
<?xml version="1.0" encoding="UTF-8"?>
<pets>
  <pet>
    <name>たま</name>
    <species>cat</species>
    <age>5</age>
    <favorites>
      <favorite>カリカリ</favorite>
      <favorite>またたび</favorite>
    </favorites>
    <location>
      <pref>京都府</pref>
      <city>京都市</city>
    </location>
  </pet>
  <pet>
    <name>ポチ</name>
    <species>dog</species>
    <age>6</age>
    <favorites>
      <favorite>いも</favorite>
      <favorite>肉類</favorite>
    </favorites>
    <location>
      <pref>滋賀県</pref>
      <city>大津市</city>
    </location>
  </pet>
</pets>
```

---

## XML サンプル

### 属性ベース

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- ペットのリスト: これはコメント -->
<pets>
  <pet name="たま" species="cat" age="5" location_pref="京都府" location_city="京都市">
    <favorite name="カリカリ"/>
    <favorite name="またたび"/>
  </pet>
  <pet name="ポチ" species="dog" age="6" location_pref="滋賀県" location_city="大津市">
    <favorite name="いも"/>
    <favorite name="肉類"/>
  </pet>
</pets>
```

XML を構成するもの:
- 要素 ex. `<element></element>`
- 属性 ex. `attribute="value"`
- テキスノード ex. `<element>これがテキストノード</element>`

---

## XML のデータ型

- XML はデータ型を持たない。`<age>10</age>` の テキストノードの値 `10` が数字なのか文字列なのかは機械判読不能
- XML Schema として定義して利用

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <!-- pets 要素 -->
  <xs:element name="pets">
    <xs:complexType>
      <xs:sequence>
        <!-- pet 要素は1個以上 -->
        <xs:element name="pet" maxOccurs="unbounded">
          <xs:complexType>
            <xs:sequence>
              <!-- favorite 要素は0個以上 -->
              <xs:element name="favorite" minOccurs="0" maxOccurs="unbounded">
                <xs:complexType>
                  <xs:attribute name="name" type="xs:string" use="required"/>
                </xs:complexType>
              </xs:element>
            </xs:sequence>
            <xs:attribute name="name" type="xs:string" use="required"/>
            <xs:attribute name="species" type="xs:string" use="required"/>
            <xs:attribute name="age" type="xs:int" use="required"/>
            <xs:attribute name="location_pref" type="xs:string" use="required"/>
            <xs:attribute name="location_city" type="xs:string" use="required"/>
          </xs:complexType>
        </xs:element>
      </xs:sequence>
    </xs:complexType>
  </xs:element>
</xs:schema>
```

---

## YAML

```yaml
# ペットのリスト <- これはコメント
pets:
  - name: たま
    species: cat
    age: 5
    favorites:
      - カリカリ
      - またたび
    location:
      pref: 京都府
      city: 京都市

  - name: ポチ
    species: dog
    age: 6
    favorites:
      - いも
      - 肉類
    location:
      pref: 滋賀県
      city: 大津市
```

---

## CSV

```csv
name,cat,age,favorite_1,favorite_2,location_pref,location_city
たま,cat,5,カリカリ,またたび,京都府,京都市
ポチ,dog,4,いも,肉,滋賀県,大津市
```

| `name` | `species` | `age` | `favorite_1` | `favorite_2` | `location_pref` | `location_city` |
|------|----------|-----|-------------|-------------|----------------|----------------|
| たま | cat | 5 | カリカリ | またたび | 京都府 | 京都市 |
| ポチ | dog | 4 | いも | 肉 | 滋賀県 | 大津市 |

---

## 巨大なデータを扱う

- 例えば、以下の形式のJSONが 100万データあった場合、何 MB 程度になるだろうか？また、プロパティの数が10個、あるいは100個になったら？

    ```json
    [
      {"name":"ペットの名前","age":年齢},
      ...
    ]
    ```

---

### ヒント

- アスキー文字(a-z,0-9, 記号) は 1byte/文字
- 日本語などのマルチバイト文字は 3byte/文字だと仮定（実際は2-4byte）
- ペットの名前は日本語で3文字だと仮定
- 1024byte = 1kB
- 1024kB = 1MB


<vote-form vote-key="estimate-big-json" freetext="on" view="freeflow">
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
      height: 100px;
    }
  </style>
</vote-form>

---

## CSV は大きなデータを扱いやすい

- CSV = カンマ区切りの表形式データ
  - 1行が1つのデータのまとまり
  - 例：名前,年齢,住所
- 逐次読み込みが簡単
  - ファイルを上から順に1行ずつ読むだけで処理できる
  - 「読みながら処理 → 終わったら忘れる」でメモリを節約
-  YAML / XML / JSON は階層構造を持つ
  - データがネスト（入れ子）になっている
  - 1つのまとまりを理解するには、全体を一度に読み込む必要がある場合が多い

### 結果

- CSV：少ないメモリで大容量データも扱いやすい
- XML / JSON：便利だがコンピューターのメモリを多く使いやすい

---

### 表現力の差

||JSON|YAML|XML|CSV|
|:--:|:--:|:--:|:--:|:--:|
|入れ子構造|○|○|○|×|
|データ型|○|○|×|×|
|コメントサポート|×|○|○|×|
|可読性|△|○|×|○|

---

### JSON vs. XML

- XML は階層構造や属性を組み合わせた複雑なデータを表現できる。ドキュメント指向(e.g. HTML)
- XML はスキーマに基づき要素・属性・型の正当性を事前検証できる
- 小規模なデータの場合は JSON の方が可読性大きい
- XML は機械判読にパーサー（処理プログラム）が必要。JSON はブラウザがネイティブサポート

---

### JSON vs. YAML

- データ表現力に大きな違いはない
- YAML の方が人間が読みやすいとされている
- YAML もパーサーが必要なので処理に一手間あり

---

### JSON vs. CSV

- CSV は 表形式のデータに最適で、行＝レコード、列＝フィールド
- JSON のような階層構造やネストされたオブジェクトは表現できない
- スプレッドシートへの取り込み/からの書き出しが容易

---

### なぜ多様なデータフォーマットが存在するのか

- データ構造や用途が多様で、単一フォーマットではすべてに最適化できない
- 可読性、処理効率、バリデーションなどの要件がフォーマットごとに異なる
- 既存システムや業界標準との互換性を確保する必要がある

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

## JSON vs. JavaScript

- JavaScript の文法は JSON フォーマットの**スーパーセット**
- JSON は JavaScript の**サブセット**、正しい JavaScript として解釈可能
- ただし、JavaScript は JSON として解釈できない

=>
JSON は、JavaScript の自由な表現を「データ交換」に特化して制限したフォーマット
この制限により、「相互運用性」「安全性」「可搬性」が保障されている

---

## GeoJSONフォーマットの理解

### GeoJSON とは？

#### 定義

> GeoJSON は空間データを JSON形式で表現するためのフォーマット

- 実習: 過去の授業で使った [geojson.io](https://geojson.io) をまた使って、フォーマットを観察してみる

用語: feature = 地物

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

## 他の位置情報フォーマットの概要

### KML

Point, LineString, Polygon をサポート。
その他、3D モデルやトラック（時間付きの軌跡）なども。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>サンプルKML</name>
    <Placemark>
      <name>サンプルポイント</name>
      <description>ここに説明文を入れられます</description>
      <Point>
        <coordinates>135.7681,35.0116,10</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>
```

---

### GPX

点（wpt）、線（trk/trkpt）、ルート（rte/rtept）　をサポート

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Sample" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="35.0116" lon="135.7681">
    <ele>10</ele>
    <name>サンプルポイント</name>
    <desc>ここに説明文を入れられます</desc>
  </wpt>
</gpx>
```

---

## その他の面白いデータフォーマット/位置情報データフォーマット

## NDJSON　**N**ewline **D**elimited JSON (改行区切り JSON)

- JSON にはない CSV のメリットとして、1行づつの逐次処理がしやすい点があった
- では、 JSON を1行づつ処理できるようにするには？

```ndjson
{ "name": "たま", "age": 5 }
{ "name": "ポチ", "age": 4 }
...
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
- **意味のあるプロパティ** を各 Feature に最低2個づつ設定

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
6. テキストエンコーディングを UTF-8 に指定して、保存 

### 座標の取得方法

- Google Maps を使用
- 地理院地図を使用

※ geojson.io 上で描画の作業をすることでデータを作成できますが、できる限りテキストエディタ上で直接記述してみてください。

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
