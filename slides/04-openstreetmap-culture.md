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

## 第4-5回:OpenStreetMapの実践と活用

立命館大学 2025年度 秋セメスター 火曜5限
授業時間:190分（2回分）

---

## 本日のアジェンダ

### 第4回（前半95分）
2. **導入:Google Mapsを印刷して使って良いのか？**
3. **OpenStreetMapについて**
4. **OSMアカウント作成と編集体験**

### 第5回（後半95分）
1. **OSMアカウント作成と編集体験**
1. **OSMデータの構造を実際に見てみる**
2. **Overpass Turboでデータ探索**
3. **データの活用方法**
4. **課題説明** (5分)

---

## 前回の振り返り

### 第3回の主要ポイント
- JSON / GeoJSON フォーマットについて
- GeoJSON の構造と記法
- 座標（経度, 緯度）について
- 簡単な GeoJSON ファイルの作成

---

## 導入: Google Maps スクリーンショット/印刷/データ利用の問題

**これって著作権的に大丈夫？**

#### シナリオ1
- 学会発表のスライドにGoogle Mapsのスクリーンショットを使いたい
- 論文に地図を掲載したい

#### シナリオ2

- Google Maps のスクリーンショットを作成し、
  - 会社のWebサイトに掲載したい
  - 会社のチラシに地図を掲載したい

#### シナリオ3

- Google Street View の画像を解析して分析したい

---

### Google Mapsの利用規約

[ガイドライン](https://about.google/brand-resource-center/products-and-services/geo-guidelines/)

---

## Google Maps スクリーンショット/印刷/データ利用の問題

- 補助的な利用（無加工・小規模・非商用・部数制限あり）  
ならOK。要帰属表示
- 大規模・商品化・広告のメイン要素としてはNG
- データを吸い出したり、分析するのは NG

### Google Maps アプリでスクリーンショットを撮ると..?

iPhone の場合は現在位置を共有、というポップアップが出る
  => web サービスとして使って欲しい

<style>
  .img-04_001_google_maps_screenshot_popup {
    position: fixed;
    right: 100px;
    width: 240px;
  }
</style>
<img class=img-04_001_google_maps_screenshot_popup src=images/04_001_google_maps_screenshot_popup.jpeg>

---

### OpenStreetMap (選択肢の1つとして)

[https://www.openstreetmap.org/](https://www.openstreetmap.org/)

---

#### OpenStreetMapの特徴

- **自由な利用**: オープンライセンス（後述）、商用利用も無料
- **データの再配布OK**: 改変・再配布も自由
- **カスタマイズ自由**: デザインも機能も自由に変更
- **世界中のコミュニティが作成**: 継続的な更新

---

## ライセンスとは何か

- 「利用許諾」 = 他人の著作物（ソフトウェア・文章・画像など）をどのように使ってよいかを示すしたもの。**契約**
- 著作権は自動的に発生するが、ライセンスを通じて「自由に使える範囲」が明示される

---

## ソフトウェアライセンス

- ソースコードやバイナリの使用・改変・再配布に関する条件を定める
  => 例:MIT, Apache, GPL, BSD など (後述)
- **「誰でも利用・改変・再配布が可能」** なもの => **OSS（オープンソースソフトウェア）ライセンス**
- これらが可能でないもの => プロプライエタリソフトウェアライセンス

## コンテンツライセンス（クリエイティブライセンス）

- 文章、画像、動画など「コード以外の創作物」に適用
  => 代表例:Creative Commons (CC)（後述）

---

## ライセンスの例① - MIT ライセンス

- 特徴
  - 最もシンプルで自由度が大きい OSS ライセンス
  - 商用利用・改変・再配布が自由
  - 著作者の名前表示が必要

---

## ライセンスの例② - Apache License 2.0

- 特徴
  - 商用利用・改変・再配布が自由
  - 著作権表示とライセンス文の保持が必要
  - 特許条項付き (原著作者に対して特許訴訟を行うと権利が失われる)

---

## ライセンスの例③ - GPL License

- GPL = GNU Public License
- GNU = GNU is Not Unix

- 特徴
  - 商用利用・改変・再配布が自由
  - 著作権表示とライセンス文の保持が必要
  - コピーレフト条項（派生物も同じライセンスで配布する必要あり。後述）

---

## ライセンスの例④ - Creative Commons

https://creativecommons.jp/licenses/

---

## OSM のライセンス（データベース）

Open Database License (ODbL) が適用
https://www.openstreetmap.org/copyright/ja

- **利用**: 自由（商用含む）
- **改変**: 自由
- **再配布**: 自由（**コピーレフト**）

---

## OSM のライセンス（制作物、スクリーンショットなど）

- **利用**: 自由（商用含む）
- **改変**: 自由
- **再配布**: 自由 (ODbLは及ばない。コピーレフトではない)
- **クレジット表記**: 必要（© OpenStreetMap contributors）

---

### コピーレフト　

著作物を「自由に使えるようにする」ライセンスの仕組み
ただし、 **その自由を次の人にも保障することを義務づける**

### 基本の考え方

- 利用・改変・再配布は自由
- ただし、改変物や派生物も同じ自由を与える必要がある
- 「自由を広めるための著作権の利用方法」

---

## OSMアカウント作成と編集

### 実習: アカウント作成

#### 手順
1. https://www.openstreetmap.org/ にアクセス
2. 「アカウント作成」をクリック
3. 必要情報を入力。ユーザー名/メールアドレス/パスワード
4. メール認証を完了

---

### 地図を見る/地物を検索する

馴染みのある地物を探して、検索ボタンで情報を見てみる
例: https://www.openstreetmap.org/node/981626644

- どんな"タグ" が設定されているだろうか？

---

### 編集の基本:iDエディタ

#### iDエディタとは？
- **Webブラウザで動作**する編集ツール
- **初心者向け**の直感的なインターフェース
- 数分でデータが更新される

#### 起動方法

1. [OpenStreetMap.org](https://openstreetmap.org)にログイン
2. 編集したい場所に地図を移動
3. 「編集」ボタンをクリック
4. iDエディタが起動

---

### 実習/宿題: POI （Point of Interest） の編集

#### 目標

大学周辺や馴染みのある場所について、OpenStreetMap 上の点データを調査する。
その上でデータを追加してみる。

---

#### 手順
1. 地図を興味のある地域（大学周辺など）に移動
2. 興味のある点データ（レストランや自社仏閣など）を選択
3. 不足しているデータがあれば、公式サイトを参照し、タグとして追加
  - 名前、営業時間、電話番号など
4. 変更を保存
  - 変更セットのコメント => どんな変更なのかをわかりやすく説明する
  - 情報源 => どんなソースを使ったかを入れる（公式サイト、など）
※ Google Maps などライセンスが異なる情報源からデータを持ち込まないように！
※ 「編集のレビューを希望します。」にチェックを入れると、有志が変更内容を確認してくれるかもしれない

---

数分待つと、変更が反映されているはず。
https://openstreetmap.org で確認してみよう。

---

## 第4回 宿題

今回の編集の実習をもとに、よりたくさんの修正をしてみる。

- 家の周り
- 大学の周辺
- その他馴染みのある地域

授業中に編集したものを含めて、少なくとも5箇所の追加または編集を行い、編集が完了していることを確認する。
-> 編集した箇所を次回の授業までに提出

タグがわからない場合: https://wiki.openstreetmap.org/wiki/JA:%E3%82%BF%E3%82%B0

---

## 提出物

#### 追加/編集した地物がわかるメモ

- **フォーマット**: どの地物なのかが分かるよう、 URL とメモ書きを箇条書きで提出してください
- **提出方法**: manaba+R で提出用のテキストフォームを設置します

---

<div class="assignment">

### 評価基準

- 正しく追加・編集できているか
- 適したタグが追加されているか

### 提出期限・方法

- **期限**: 次々回授業(11/11)まで
- **方法**: Manaba+R経由

</div>
