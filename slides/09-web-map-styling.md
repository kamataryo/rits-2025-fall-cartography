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
授業時間：95分

---

## 本日のアジェンダ

1. **前回の振り返り・課題確認** (12分)
2. **地図デザイン入門** (18分)
3. **ポイントデータのスタイリング** (23分)
4. **ラインデータのスタイリング** (23分)
5. **ポリゴンデータのスタイリング** (14分)
6. **課題説明** (5分)

---

## 前回の振り返り

### 第7-8回の主要ポイント
- 地図のカスタマイズ（GeoJSON を地物として追加する）
- JSON形式でのスタイル定義

---

## style.json を利用した Maplibre GL JS のスタイリング

前回の授業では style オブジェクト (= JSON 形式互換)を変更することで地図の見た目をカスタマイズできた。
Maplibre GL JS の静的なスタイルは、この記法で全てが定義できる。

仕様: Maplibre Style Spec
https://maplibre.org/maplibre-style-spec/

---

## Source と Layer

<div style="display: flex; align-items:center;">
<ul>
<li>Source => データソース
<li>Layer => 地図レイヤ
</ul>
<img src="./images/09_001_source_and_layer.png" width="500">
</div>

---

## Source の種類 (`type`)

- `raster` ラスタタイル
- `geojson` GeoJSON
- `vector` ベクトルタイル
- etc.

---

## Source に必要なプロパティ

`"sources"` として **オブジェクト型** で指定

```json
{
  "sources": {
    "<source 1 ID>": {
      "type": "raster",
      "tiles": [
        "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"
      ]
    },
    "<source 2 ID>": {
      "type": "geojson",
      "data": "https://example.com/sample.geojson"
    },
    ...
  }
}
```

---

## Layer

レイヤーは、上にあるものほど下にレンダリングされる（重なる）

- Source なしで使える type
  - `background`
- ラスタタイル Source で利用可能な type
  - `raster`
  - etc.
- ベクトルタイル/GeoJSON Source で利用可能な type
  - `circle`
  - `symbol`
  - `line`
  - `fill`
  - etc.

---

## Layer のプロパティの例

```javascript
// Circle レイヤ
{
  id: 'circle-layer', // 重複しないID
  type: 'circle',
  source: 'geojson-sample-source-2',
  filter: ['==', '$type', 'Point'], // $type はソースのジオメトリタイプを指定する
  layout: {
    'visibility': 'visible' // レイヤの表示・非表示
  },
  paint: {
    "circle-radius"         : 8,           // 半径（ピクセル）
    "circle-color"          : "#ff0000", // 塗りつぶし色
    "circle-opacity"        : 1.0,         // 塗りつぶし透明度
    "circle-stroke-color"   : "#ffffff", // 境界線色
    "circle-stroke-width"   : 2,           // 境界線幅
    "circle-stroke-opacity" : 1.0          // 境界線透明度
  },
}
```

---

## Filter

```js
filter: ['==', '$type', 'Point'], // $type はソースのジオメトリタイプを指定する

// Expression が利用可能（後述）
filter:['==', ['get', 'amenity'], 'university'],
```

---

## Expression

- ポーランド記法
  - `a + b` => `+ a b`
  - `a + b * c` => `+ a (* b c)`
  - `T & F` => `& T F`

- Maplibre Style Spec は**ポーランド記法**的な定義を採用している
- JSON フォーマットによって複雑な地図スタイルを静的かつ柔軟に定義することが可能

## Expression の例

```Javascript
['get', '<プロパティ名>'] // プロパティを取得する
['concat', '文字列A', '文字列B'] // 文字列を結合
['+', 100, 200] // 数字を加算
['to-string', ['get', '<数字型プロパティ名>']] // 数字を取得して、文字列に変換
```

---

## 課題

// TODO: 作成中
- 11/25 はここまで進まない予定
- 12/2 に出題

- 教員があらかじめ用意しておいたデータソースをスタイリングする
- steps
  - 用意された GeoJSON のフォーマットを確認（いくつかの点データを想定）
  - 用意された GeoJSON のプロパティを確認
  - 地図のスタイリングの方針を計画する。塗り分け・circle 半径 etc.
  - GeoJSON ソースを読み込む
  - style を修正
  - GitHub Pages として Publish

---

## 次回予告

### 第10回：ベクトルタイルの活用
- ベクトルタイルの仕組みとフォーマット

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします
