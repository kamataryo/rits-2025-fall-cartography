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

## 第2回: 地図データの基礎

立命館大学 2025年度 秋セメスター 火曜5限
授業時間: 85分

---

## 本日のアジェンダ

1. **前回の振り返り・課題確認** (10分)
2. **空間データとは何か** (20分)
3. **ジオメトリの基礎** (30分)
4. **地理座標系と投影法** (25分)

---

## 前回の振り返り

### 第1回の主要ポイント

- 授業の全体像
- ウェブの地図の特徴について
- MapLibre GL JS でウェブの地図を動かしてみる

### 課題の確認
- 興味のある地図サービスの特徴調査

---

## 空間データとは何か？

### 空間データの定義
- 地球上の位置や形状、属性を持つデータ

### 空間データを構成するもの
- **位置情報**: 緯度・経度による**座標**および高度
- **形状情報**: **ジオメトリ**
- **属性情報**: 名前・種類・特性・研究データなどの付加情報

---

## 緯度・経度について

- **緯度（Latitude）**: 赤道を基準とした南北の角度（-90° ～ +90°）
- **経度（Longitude）**: 本初子午線を基準とした東西の角度（-180° ～ +180°）
- 注意: ウェブ地図の世界では、
  - 北緯と東経は + で表されている
  - 南緯と西経は - で表されている

**実習**: 以下の2つのアプリで緯度経度がどのように定められているか確認してみてください。

<a href="https://kamataryo.github.io/rits-2025-fall-cartography__02-globe-and-lat-lng/flat.html" target="_blank">平面で見る</a>
<a href="https://kamataryo.github.io/rits-2025-fall-cartography__02-globe-and-lat-lng/globe.html" target="_blank">球で見る</a>

---

## 好きな場所の緯度と経度を調べてみよう

- どちらでも好きな方:
  - [Google Maps](https://www.google.com/maps) で右クリック
  - [地理院地図](https://maps.gsi.go.jp/) で十字を合わせる
- 北極・南極・ヨーロッパ/アフリカ付近・南北アメリカ付近ではどうなる？

**実習**: `場所 緯度・経度` の形式で投稿してみてください。（例: `京都駅 34.9965, 135.7979`）

<vote-form vote-key="latlng-survey" freetext="on" view="freeflow">
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
      height: 180px;
    }
  </style>
</vote-form>

---

## 形状の情報（ジオメトリ）

**実習**: 地図に描ける **形状情報** = **ジオメトリ** にはどんな種類があると思いますか？
💡 川や農地、道路、公園、「おすすめスポット」など、これらは地図上ではどんな形で描かれるだろう？

<vote-form vote-key="spatial-data-geometry" freetext="on" view="freeflow">
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
  </style>
</vote-form>

---

## 形状の情報（ジオメトリ）

 - 点（<u>ポイント</u>）
 - 線（<u>ライン</u>）
 - 面（<u>ポリゴン</u>）

これらは **GeoJSON** と呼ばれるフォーマットがサポートするジオメトリ
この授業ではこの3つ基本として理解すれば OK

**実習**: [geojson.io](https://geojson.io/) で地図上にジオメトリを表現してみよう

---

## GeoJSONのジオメトリ

 - **Point / MultiPoint**
 - **LineString / MultiLineString**
 - **Polygon / MultiPolygon**

👉 「点・線・面」を基本に、複数や混合を表現できる

---

## 補足: しかし「ジオメトリ」の意味はもっと広い

GeoJSON が扱うのは便利な最小限の型にすぎない。  
数学的に言えば「ジオメトリ = 形」であり、次のようなものもありうる。

- **円・楕円・扇形**
- **曲線（二次関数、放物線、多項式曲線..）**
- **立体（球、円錐、四角柱、..）**

「ジオメトリ」という言葉はもっと広い概念を含んでいることに留意

---

## 空間データの例（ポイント）

**実習**: ポイントのジオメトリで表されるデータにはどのようなものがあるだろう？

<vote-form vote-key="spatial-data-point" freetext="on" view="freeflow">

---

## 空間データの例（ライン）

**実習**: ラインのジオメトリで表されるデータにはどのようなものがあるだろう？

<vote-form vote-key="spatial-data-linestring" freetext="on" view="freeflow">

---

## 空間データの例（ポリゴン）

**実習**: ポリゴンのジオメトリで表されるデータにはどのようなものがあるだろう？

<vote-form vote-key="spatial-data-polygon" freetext="on" view="freeflow">


---

### 空間データの例

#### 自然地物
- **山**: 標高点（ポイント）、等高線（ライン、あるいはポリゴン）
- **河川**: 流路（ライン）、湖沼（ポリゴン）
- **森林**: 森林域（ポリゴン）

#### 人工地物
- **交通**: 道路・線路（ライン）
- **農業**: 農地・圃場（ポリゴン）
- **施設**: 敷地（ポリゴン）、店舗・学校（ポイント）

---

## ジオメトリの基礎

### 基本的なジオメトリタイプ

#### 1. ポイント（Point）
- **定義**: 0次元の幾何学的オブジェクト
- **表現**: 単一の座標点
- **用途**: 店舗、駅、観光地、事故地点など

```json
{
  "type": "Point",
  "coordinates": [135.5, 34.7]
}
```

---

#### 2. ライン（LineString）
- **定義**: 1次元の幾何学的オブジェクト
- **表現**: 複数の座標点を結んだ線
- **用途**: 道路、河川、境界線、ルートなど

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

#### 3. ポリゴン（Polygon）
- **定義**: 2次元の幾何学的オブジェクト
- **表現**: 閉じた線で囲まれた領域
- **用途**: 建物、行政区域、土地利用、湖沼など

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

---

### 投影法

#### なぜ投影が必要か？

- 地球は球体（楕円体）
- 地図は平面
- 球面を平面に変換する際に必ず歪みが生じる

---

### Web地図で使用される投影法

#### Web メルカトル図法
- **特徴**: 
  - タイル分割に適している
  - 高緯度地域で面積が大きく歪む

---

### メルカトル図法クイズ

グリーンランドとアフリカ、実際にはどちらが大きいだろう？
https://maps.gsi.go.jp/#2/30/0


<img width=700 src="./images/02_010_greenland_vs_africa.png" />

---

<vote-form vote-key="mercator-quiz1" choices="グリーンランドが大きい,アフリカ大陸が大きい,同じくらい" />

---

### メルカトル図法クイズ

グリーンランドとアフリカ、実際にはどちらが大きいだろう？
**実習**: 答え合わせ => https://thetruesize.com/#

---

<div class="assignment">

## 課題: geojson.io を使って、地図上に地物をお絵描きしてみる

必ず 点（Point）、線（LineString）、面（Polygon）をそれぞれ1つ以上含めること。

対象とするテーマは以下のいずれかを選んでください：

1. **観光・レジャー**
好きな観光地を「点」、その周辺の主要道路を「線」、公園や広場を「面」で表現

2. **身近な公共施設**
図書館や駅を「点」、その施設につながる道を「線」、敷地や駐車場を「面」

3. **自然地物**
山頂を「点」、稜線や谷を「線」、湖や森林を「面」

4. **自由課題**
その他、自分の興味に基づいたもの

</div>

---

<div class="assignment">

### 内容

- それぞれの地物が何を示しているのかを分かるように説明すること
- geojson.io で作図した画面のスクリーンショットを添えること

### 提出要項

- **形式など**: A4サイズ、PDF / Word等。その他のフォーマットは応相談。
- **提出期限**: 次回授業開始時
- **提出方法**: Manaba+R 経由
- **評価ポイント**: 点・線・面の使用、説明の明確さ

</div>

---

## 質疑応答

### 本日の内容について

- 空間データ・ジオメトリに関する質問
- 座標系・投影法について
- 課題に関する質問

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします

## 次回予告

### 第3回：GeoJSONの基礎
- GeoJSONフォーマットの詳細理解
- 簡単なGeoJSONファイルの作成方法
- 地図上での可視化技術
- 実際のデータ作成・表示実習

### 準備事項
- 今回取得したOSMデータの確認
- GeoJSON形式への変換の理解
- 次回で使用する地図データのアイデア検討

[日時・教室]

課題の提出をお忘れなく！
