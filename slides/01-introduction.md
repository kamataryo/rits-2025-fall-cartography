---
marp: true
theme: default
class: title
paginate: true
_html: true
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

## 第1回：地図とウェブカートグラフィの基礎

立命館大学 2025年度 秋セメスター 火曜5限
授業時間：85分

---

## 本日のアジェンダ

1. **自己紹介・授業概要** (10分)
2. **地図とは何か？** (15分)
3. **ウェブで用いられる地図アプリのオーバービュー** (25分)
4. **授業の全体像と使用ツールの紹介** (20分)
5. **実習環境の確認** (10分)
6. **課題説明** (5分)

---

## 自己紹介

---

## 授業概要

### 授業名
MapLibre GL JS と OpenStreetMap で始めるウェブカートグラフィ入門

### 授業全体を通した目標
- ウェブ地図の技術を理解する
- 地図アプリケーションの仕組みを理解する
- 地図アプリケーションを活用をできる
- **オープンデータ**を活用できる
- **オープンソース**ソフトウェアを活用できる

---

## 地図

使ったことがある地図は？

<vote-form vote-key="favorite-maps" freetext="on" choices="Google Maps,マップ（iOS）,Yahoo!マップ,地理院地図,ゼンリン地図,地形図(国土地理院、紙)" />

---

## 紙の地図・デジタルの地図

- 紙の地図とデジタルの地図（ウェブやアプリ）とではどのような違いがあるだろうか
- 紙、ウェブ、アプリ以外にどんな媒体があるだろうか

<vote-form vote-key="map-media" freetext="on" choices="" />

---

## [WIP]おもしろい媒体の地図

- スターコンパスの地図
- 触れる凸凹
- AR 空間（果たして地図と言って良いのか？）

---

## [WIP]ウェブ地図の特徴

デジタルの地図、特にウェブの地図は、今まで上げた媒体の地図とどのように違うのだろう？

<vote-form vote-key="map-media" freetext="on" choices="" />

---

## ウェブで用いられる地図アプリのオーバービュー

### 主要な地図サービス

#### 1. [Google Maps](https://www.google.com/maps)
- **特徴**：アプリ 10億ダウンロード<small>[*1]</small>、豊富な POI (Point of Interest)
- **技術**：独自のタイル配信システム
- **ライセンス**：商用利用は有料

<!-- _footer: '[*1 <a href="https://www.nikkei.com/article/DGXZRSP642755_V21C22A0000000/">App Annie Japan、「Googleマップアプリ10億ダウンロード突破」について発表</a> 日本産経新聞' -->

---

#### [WIP] 2. OpenStreetMap (OSM)
- **特徴**：オープンソース、コミュニティ主導
- **技術**：オープンデータ、自由に利用可能
- **ライセンス**：ODbL（Open Database License）

![OSM Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Openstreetmap_logo.svg/256px-Openstreetmap_logo.svg.png)

---

#### [WIP] 3. Mapbox
- **特徴**：カスタマイズ性の高いデザイン
- **技術**：Vector tiles、WebGL
- **API**：Mapbox GL JS
- **ライセンス**：フリーミアム（一定利用量まで無料）

#### [WIP] 4. その他の地図サービス
- **Apple Maps**：iOS標準
- **Bing Maps**：Microsoft提供
- **HERE Maps**：自動車業界で強い
- **国土地理院地図**：日本の公的地図

---

## [WIP] 現代のウェブ地図の特徴(1/2)

### インタラクティブ性
- **ズーム・パン**：スムーズな操作
- **レイヤー切り替え**：用途に応じた表示
- **ポップアップ**：詳細情報の表示
- **検索機能**：住所・施設名での検索

### リアルタイム性
- **交通情報**：渋滞・事故情報
- **位置情報**：GPS連携
- **ライブデータ**：天気・災害情報

---

## [WIP] 現代のウェブ地図の特徴(1/2)

### カスタマイズ性
- **スタイリング**：色・フォント・アイコンの変更
- **データ統合**：独自データの重ね合わせ
- **機能拡張**：プラグインによる機能追加

### 3D・AR対応
- **3D建物表示**：立体的な都市景観
- **地形表示**：標高データの可視化
- **AR連携**：現実世界との重ね合わせ

---

## 使用ツールの紹介

TODO: ライブラリ とは何か、を説明

### [WIP] 1. MapLibre GL JS
- **概要**：オープンソースのWebGL地図ライブラリ
- **特徴**：
  - Mapboxからフォークされた完全オープンソース
  - 商用利用も無料
  - 高性能なベクタータイル表示
  - 豊富なカスタマイズオプション

---

### [WIP] 2. OpenStreetMap (OSM)
- **概要**：世界最大のオープンソース地図プロジェクト
- **特徴**：
  - 誰でも編集可能
  - 商用利用可能
  - 豊富な属性情報
  - 世界中のコミュニティが維持

---

## 実習環境の確認

### 必要なソフトウェア

- **ブラウザ**：Chrome
- **エディタ**：GitHub Codespace (オンラインエディタ)

---

## GitHub について

- GitHub のアカウント登録
- GitHub について

---

### 環境セットアップ

TODO: GitHub であらかじめ用意したリポジトリをフォークして、codespace で開き、実行してもらう

- フォーク

---

<div class="assignment">

## 課題：興味のある地図を1つ選び、特徴を調査する

### 課題内容
以下のいずれかの地図サービス・アプリケーションを選び、その特徴を調査してレポートを作成してください。

**対象地図サービス例：**
- Google Maps / Google Earth
- OpenStreetMap
- Mapbox
- 国土地理院地図
- Yahoo!地図
- Apple Maps
- その他（普段から使っているアプリに地図が組み込まれているなら、それを調査しても良い）

</div>

---

<div class="assignment">

### どんな点に着目するか

1. **基本情報**
   - 誰がサービスを提供しているのか？
   - いつから使われているのか

3. **機能・特徴**
   - どのようなユーザーを対象としているのか
   - 主要な機能
   - 他サービスとの差別化ポイント
   - 得意分野・用途
   - どんなビジネスモデルなのか

4. **個人的な評価**
   - 良いと思う点、改善してほしい点
   - おもしろい点

</div>

---

TODO: manaba+R の機能確認して、修正

<div class="assignment">

### 提出要項
- **形式**：A4用紙2-3枚程度のレポート（PDF形式）
- **提出期限**：次回授業開始時
- **提出方法**：学習管理システム経由
- **評価基準**：
  - 調査の深さ・正確性（40%）
  - 分析・考察の質（40%）
  - 文章構成・表現力（20%）

### 参考資料
- 各サービスの公式ドキュメント
- 技術ブログ・記事
- 学術論文（必要に応じて）

</div>

---

## 質疑応答

### 本日の内容について
- 授業内容に関する質問
- 授業の進め方について
- 課題に関する質問

### 連絡先
- **メール**：[教員メールアドレス]

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします

**第2回：地図データの基礎**
