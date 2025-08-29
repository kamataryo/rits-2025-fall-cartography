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

## 第7-8回：MapLibre GL JS の基礎操作

立命館大学 2025年度 秋セメスター 火曜5限
授業時間：190分（2回分）

---

## 本日のアジェンダ

### 第7回（前半95分）
1. **前回の振り返り・課題確認** (12分)
2. **地図の基本操作** (35分)
3. **地図のカスタマイズ** (38分)
4. **休憩** (10分)

### 第8回（後半95分）
1. **レイヤー追加の実践** (45分)
2. **JSON形式でのスタイル定義** (33分)
3. **GeoJSONデータの地図表示** (12分)
4. **課題説明** (5分)

---

# 第7回：地図の基本操作とカスタマイズ

---

## 前回の振り返り

### 第6回の主要ポイント
- ベースマップとオーバーレイの違い
- タイルの仕組み（ラスター vs ベクター）
- MapLibre GL JS の概要と歴史
- 基本的なセットアップ方法

### 課題の確認
MapLibre GL JS を使ったベースマップ表示
- 技術的実装の確認
- デザイン・ユーザビリティの評価
- 地域選択の妥当性
- 学習成果の整理

---

## 地図の基本操作

### MapLibre GL JS の操作体系

#### 基本的な地図操作
- **パン（Pan）**：地図の移動
- **ズーム（Zoom）**：拡大・縮小
- **回転（Rotate）**：地図の回転
- **傾斜（Pitch）**：3D視点の調整

#### 操作方法
- **マウス**：ドラッグ、ホイール、右クリック
- **タッチ**：スワイプ、ピンチ、回転ジェスチャー
- **キーボード**：矢印キー、+/-キー
- **プログラム**：JavaScript API

---

### プログラムによる地図操作

#### 中心座標の変更
```javascript
// 即座に移動
map.setCenter([135.5, 34.7]);

// アニメーション付きで移動
map.flyTo({
  center: [135.5, 34.7],
  zoom: 12,
  duration: 2000 // 2秒間のアニメーション
});

// より詳細な制御
map.easeTo({
  center: [135.5, 34.7],
  zoom: 12,
  bearing: 45,
  pitch: 30,
  duration: 3000,
  easing: t => t * (2 - t) // カスタムイージング
});
```

---

#### ズームレベルの制御
```javascript
// ズームレベルの設定
map.setZoom(15);

// ズームイン・ズームアウト
map.zoomIn();
map.zoomOut();

// 特定の倍率でズーム
map.zoomTo(12, {duration: 1000});

// 現在のズームレベルを取得
const currentZoom = map.getZoom();
console.log('現在のズームレベル:', currentZoom);
```

---

#### 地図の回転と傾斜
```javascript
// 回転角度の設定（度単位）
map.setBearing(45);

// 傾斜角度の設定（度単位、0-60）
map.setPitch(30);

// 回転と傾斜を同時に設定
map.flyTo({
  bearing: 90,
  pitch: 45,
  duration: 2000
});

// 現在の角度を取得
const bearing = map.getBearing();
const pitch = map.getPitch();
```

---

### 表示範囲の制御

#### バウンディングボックスの設定
```javascript
// 特定の範囲にフィット
const bounds = [
  [135.4, 34.6], // 南西角 [経度, 緯度]
  [135.6, 34.8]  // 北東角 [経度, 緯度]
];

map.fitBounds(bounds, {
  padding: 50,    // 余白（ピクセル）
  duration: 2000  // アニメーション時間
});

// 現在の表示範囲を取得
const currentBounds = map.getBounds();
console.log('表示範囲:', currentBounds);
```

---

#### 表示制限の設定
```javascript
// 地図の初期化時に制限を設定
const map = new maplibregl.Map({
  container: 'map',
  style: styleObject,
  center: [135.5, 34.7],
  zoom: 10,
  minZoom: 8,     // 最小ズームレベル
  maxZoom: 18,    // 最大ズームレベル
  maxBounds: [    // 表示可能範囲の制限
    [135.0, 34.0], // 南西角
    [136.0, 35.0]  // 北東角
  ]
});

// 後から制限を変更
map.setMinZoom(5);
map.setMaxZoom(20);
map.setMaxBounds(newBounds);
```

---

## 地図のカスタマイズ

### コントロールの追加・削除

#### ナビゲーションコントロール
```javascript
// ナビゲーションコントロールの追加
map.addControl(new maplibregl.NavigationControl(), 'top-right');

// フルスクリーンコントロールの追加
map.addControl(new maplibregl.FullscreenControl(), 'top-right');

// スケールコントロールの追加
map.addControl(new maplibregl.ScaleControl({
  maxWidth: 100,
  unit: 'metric' // 'metric' または 'imperial'
}), 'bottom-left');

// 位置情報コントロールの追加
map.addControl(new maplibregl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}), 'top-left');
```

---

#### カスタムコントロールの作成
```javascript
class CustomControl {
  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    
    const button = document.createElement('button');
    button.className = 'custom-button';
    button.textContent = '🏠';
    button.title = 'ホームに戻る';
    
    button.addEventListener('click', () => {
      map.flyTo({
        center: [135.5, 34.7],
        zoom: 10
      });
    });
    
    this._container.appendChild(button);
    return this._container;
  }
  
  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

// カスタムコントロールの追加
map.addControl(new CustomControl(), 'top-left');
```

---

### イベントハンドリング

#### 基本的なイベント
```javascript
// 地図の読み込み完了
map.on('load', () => {
  console.log('地図の読み込みが完了しました');
});

// クリックイベント
map.on('click', (e) => {
  console.log('クリック座標:', e.lngLat);
  console.log('ピクセル座標:', e.point);
});

// ズーム変更イベント
map.on('zoom', () => {
  console.log('ズームレベル:', map.getZoom());
});

// 地図移動イベント
map.on('move', () => {
  console.log('中心座標:', map.getCenter());
});
```

---

#### 高度なイベント処理
```javascript
// ダブルクリックでズーム無効化
map.doubleClickZoom.disable();

// カスタムダブルクリック処理
map.on('dblclick', (e) => {
  // カスタム処理
  console.log('ダブルクリック:', e.lngLat);
});

// マウスホバーイベント
map.on('mouseenter', 'layer-id', (e) => {
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'layer-id', () => {
  map.getCanvas().style.cursor = '';
});

// 右クリックイベント
map.on('contextmenu', (e) => {
  e.preventDefault(); // デフォルトのコンテキストメニューを無効化
  console.log('右クリック:', e.lngLat);
});
```

---

### ポップアップの実装

#### 基本的なポップアップ
```javascript
// ポップアップの作成
const popup = new maplibregl.Popup()
  .setLngLat([135.5, 34.7])
  .setHTML('<h3>大阪</h3><p>関西の中心都市</p>')
  .addTo(map);

// クリック時にポップアップを表示
map.on('click', (e) => {
  new maplibregl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`
      <div>
        <h4>クリック地点</h4>
        <p>経度: ${e.lngLat.lng.toFixed(4)}</p>
        <p>緯度: ${e.lngLat.lat.toFixed(4)}</p>
      </div>
    `)
    .addTo(map);
});
```

---

#### 動的なポップアップ
```javascript
// レイヤーのクリック時にポップアップ
map.on('click', 'poi-layer', (e) => {
  const feature = e.features[0];
  const coordinates = e.lngLat;
  
  // ポップアップの内容を動的に生成
  const popupContent = `
    <div class="popup-content">
      <h3>${feature.properties.name || '名称不明'}</h3>
      <p><strong>種類:</strong> ${feature.properties.category || 'その他'}</p>
      <p><strong>座標:</strong> ${coordinates.lng.toFixed(4)}, ${coordinates.lat.toFixed(4)}</p>
      ${feature.properties.description ? `<p>${feature.properties.description}</p>` : ''}
    </div>
  `;
  
  new maplibregl.Popup()
    .setLngLat(coordinates)
    .setHTML(popupContent)
    .addTo(map);
});

// マウスカーソルの変更
map.on('mouseenter', 'poi-layer', () => {
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'poi-layer', () => {
  map.getCanvas().style.cursor = '';
});
```

---

# 第8回：レイヤー追加とスタイル定義

---

## レイヤー追加の実践

### データソースの追加

#### GeoJSON データソース
```javascript
map.on('load', () => {
  // GeoJSON データソースの追加
  map.addSource('my-data', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [135.5, 34.7]
          },
          properties: {
            name: '大阪',
            category: 'city'
          }
        }
      ]
    }
  });
});
```

---

#### 外部 GeoJSON ファイルの読み込み
```javascript
map.on('load', () => {
  // 外部ファイルからの読み込み
  map.addSource('external-data', {
    type: 'geojson',
    data: './data/points.geojson'
  });
  
  // URL からの読み込み
  map.addSource('remote-data', {
    type: 'geojson',
    data: 'https://example.com/api/data.geojson'
  });
});
```

---

### レイヤーの追加

#### ポイントレイヤー
```javascript
map.addLayer({
  id: 'points-layer',
  type: 'circle',
  source: 'my-data',
  paint: {
    'circle-radius': 8,
    'circle-color': '#ff0000',
    'circle-stroke-color': '#ffffff',
    'circle-stroke-width': 2
  }
});
```

#### ラインレイヤー
```javascript
map.addLayer({
  id: 'lines-layer',
  type: 'line',
  source: 'line-data',
  paint: {
    'line-color': '#0000ff',
    'line-width': 3,
    'line-opacity': 0.8
  }
});
```

---

#### ポリゴンレイヤー
```javascript
map.addLayer({
  id: 'polygons-layer',
  type: 'fill',
  source: 'polygon-data',
  paint: {
    'fill-color': '#00ff00',
    'fill-opacity': 0.5,
    'fill-outline-color': '#000000'
  }
});
```

#### シンボルレイヤー（ラベル）
```javascript
map.addLayer({
  id: 'labels-layer',
  type: 'symbol',
  source: 'my-data',
  layout: {
    'text-field': ['get', 'name'], // プロパティから名前を取得
    'text-font': ['Open Sans Regular'],
    'text-size': 14,
    'text-anchor': 'top'
  },
  paint: {
    'text-color': '#000000',
    'text-halo-color': '#ffffff',
    'text-halo-width': 2
  }
});
```

---

### データドリブンスタイリング

#### プロパティベースのスタイリング
```javascript
map.addLayer({
  id: 'data-driven-points',
  type: 'circle',
  source: 'my-data',
  paint: {
    // カテゴリに応じた色分け
    'circle-color': [
      'match',
      ['get', 'category'],
      'restaurant', '#ff0000',
      'hotel', '#0000ff',
      'shop', '#00ff00',
      '#cccccc' // デフォルト色
    ],
    // 人口に応じたサイズ変更
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'population'],
      0, 5,
      1000000, 20
    ]
  }
});
```

---

#### ズームレベルに応じたスタイリング
```javascript
map.addLayer({
  id: 'zoom-dependent-layer',
  type: 'circle',
  source: 'my-data',
  paint: {
    // ズームレベルに応じたサイズ変更
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      8, 3,   // ズーム8で半径3
      12, 8,  // ズーム12で半径8
      16, 15  // ズーム16で半径15
    ],
    // ズームレベルに応じた透明度変更
    'circle-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      10, 0.3,
      15, 1.0
    ]
  }
});
```

---

### レイヤーの管理

#### レイヤーの表示・非表示
```javascript
// レイヤーを非表示
map.setLayoutProperty('layer-id', 'visibility', 'none');

// レイヤーを表示
map.setLayoutProperty('layer-id', 'visibility', 'visible');

// レイヤーの存在確認
if (map.getLayer('layer-id')) {
  console.log('レイヤーが存在します');
}
```

#### レイヤーの削除
```javascript
// レイヤーの削除
map.removeLayer('layer-id');

// データソースの削除
map.removeSource('source-id');
```

---

#### レイヤーの順序変更
```javascript
// レイヤーを最前面に移動
map.moveLayer('layer-id');

// 特定のレイヤーの前に移動
map.moveLayer('layer-id', 'before-layer-id');
```

## JSON形式でのスタイル定義

### Mapbox Style Specification

#### スタイルの基本構造
```json
{
  "version": 8,
  "name": "Custom Style",
  "metadata": {},
  "sources": {},
  "layers": [],
  "glyphs": "https://fonts.example.com/{fontstack}/{range}.pbf",
  "sprite": "https://sprites.example.com/sprite"
}
```

---

### 完全なスタイル定義例

#### シンプルなカスタムスタイル
```json
{
  "version": 8,
  "name": "Simple OSM Style",
  "sources": {
    "osm": {
      "type": "raster",
      "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      "tileSize": 256,
      "attribution": "© OpenStreetMap contributors"
    },
    "custom-data": {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": []
      }
    }
  },
  "layers": [
    {
      "id": "osm-tiles",
      "type": "raster",
      "source": "osm"
    },
    {
      "id": "custom-points",
      "type": "circle",
      "source": "custom-data",
      "filter": ["==", ["geometry-type"], "Point"],
      "paint": {
        "circle-radius": 6,
        "circle-color": "#ff6b6b",
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2
      }
    }
  ]
}
```

---

### 高度なスタイル定義

#### 複数レイヤーの組み合わせ
```json
{
  "version": 8,
  "name": "Advanced Style",
  "sources": {
    "osm": {
      "type": "raster",
      "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      "tileSize": 256
    },
    "poi-data": {
      "type": "geojson",
      "data": "./data/poi.geojson"
    }
  },
  "layers": [
    {
      "id": "background",
      "type": "raster",
      "source": "osm"
    },
    {
      "id": "poi-circles",
      "type": "circle",
      "source": "poi-data",
      "paint": {
        "circle-radius": [
          "case",
          ["==", ["get", "category"], "restaurant"], 8,
          ["==", ["get", "category"], "hotel"], 6,
          4
        ],
        "circle-color": [
          "match",
          ["get", "category"],
          "restaurant", "#ff4757",
          "hotel", "#3742fa",
          "shop", "#2ed573",
          "#747d8c"
        ]
      }
    },
    {
      "id": "poi-labels",
      "type": "symbol",
      "source": "poi-data",
      "layout": {
        "text-field": ["get", "name"],
        "text-size": 12,
        "text-anchor": "top",
        "text-offset": [0, 1]
      },
      "paint": {
        "text-color": "#2c2c54",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1
      }
    }
  ]
}
```

---

### 式（Expressions）の活用

#### 条件分岐
```json
{
  "circle-color": [
    "case",
    ["<", ["get", "population"], 10000], "#ffffcc",
    ["<", ["get", "population"], 50000], "#c7e9b4",
    ["<", ["get", "population"], 100000], "#7fcdbb",
    "#2c7fb8"
  ]
}
```

#### 補間
```json
{
  "circle-radius": [
    "interpolate",
    ["linear"],
    ["get", "magnitude"],
    1, 2,
    5, 10,
    9, 20
  ]
}
```

---

#### 文字列操作
```json
{
  "text-field": [
    "concat",
    ["get", "name"],
    " (",
    ["to-string", ["get", "population"]],
    "人)"
  ]
}
```

## GeoJSONデータの地図表示

### 実践例：大学周辺施設の表示

#### データの準備
```javascript
const universityData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [135.5122, 34.9981]
      },
      properties: {
        name: '立命館大学衣笠キャンパス',
        category: 'university',
        description: 'メインキャンパス'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [135.5089, 35.0039]
      },
      properties: {
        name: '龍安寺駅',
        category: 'station',
        description: '京福電鉄北野線'
      }
    }
  ]
};
```

---

#### 地図への表示
```javascript
map.on('load', () => {
  // データソースの追加
  map.addSource('university-data', {
    type: 'geojson',
    data: universityData
  });
  
  // ポイントレイヤーの追加
  map.addLayer({
    id: 'university-points',
    type: 'circle',
    source: 'university-data',
    paint: {
      'circle-radius': [
        'match',
        ['get', 'category'],
        'university', 12,
        'station', 8,
        6
      ],
      'circle-color': [
        'match',
        ['get', 'category'],
        'university', '#e74c3c',
        'station', '#3498db',
        '#95a5a6'
      ],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2
    }
  });
  
  // ラベルレイヤーの追加
  map.addLayer({
    id: 'university-labels',
    type: 'symbol',
    source: 'university-data',
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 14,
      'text-anchor': 'top',
      'text-offset': [0, 1.5]
    },
    paint: {
      'text-color': '#2c3e50',
      'text-halo-color': '#ffffff',
      'text-halo-width': 2
    }
  });
  
  // クリックイベントの追加
  map.on('click', 'university-points', (e) => {
    const feature = e.features[0];
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <div>
          <h3>${feature.properties.name}</h3>
          <p><strong>カテゴリ:</strong> ${feature.properties.category}</p>
          <p>${feature.properties.description}</p>
        </div>
      `)
      .addTo(map);
  });
});
```

---

<div class="assignment">

## 課題：自分のGeoJSONデータを地図上に表示する

### 課題内容
第5回で作成した GeoJSON データを MapLibre GL JS を使って地図上に表示し、インタラクティブな機能を追加してください。

### 要件

#### 1. 技術要件
- **第6回で作成したHTML** をベースに拡張
- **第5回で作成したGeoJSON** データを使用
- **複数のレイヤー** を適切に表示
- **インタラクティブ機能** の実装

#### 2. 表示要件
- **ジオメトリタイプ別** の適切なスタイリング
- **データドリブンスタイリング** の活用
- **ズームレベル** に応じた表示調整
- **視覚的に美しい** デザイン

</div>

---

<div class="assignment">

#### 3. インタラクション要件
- **クリック時のポップアップ** 表示
- **ホバー時の視覚的フィードバック**
- **レイヤーの表示切り替え** 機能（オプション）

#### 4. スタイル要件
- **カテゴリ別の色分け**
- **適切なサイズ設定**
- **ラベル表示**（必要に応じて）
- **統一感のあるデザイン**

### 実装すべき機能
- GeoJSON データの読み込み
- 複数レイヤーの表示
- ポップアップによる詳細情報表示
- マウスホバー時のスタイル変更
- 適切なズーム・中心位置の設定

</div>

---

<div class="assignment">

### 提出物

#### 1. HTML ファイル
- **ファイル名**：`[学籍番号]_interactive_map.html`
- **完全に動作する** 単一のHTMLファイル
- **GeoJSON データを含む** または外部ファイル参照

#### 2. GeoJSON ファイル（外部ファイルの場合）
- **ファイル名**：`[学籍番号]_data.geojson`
- **第5回で作成したデータ** をベースに改良

#### 3. レポート
- **形式**：A4用紙2-3枚程度（PDF形式）
- **内容**：
  - 実装した機能の説明
  - スタイリングの工夫点
  - インタラクション設計の考え方
  - 技術的な課題と解決方法
  - 実行結果のスクリーンショット

</div>

---

<div class="assignment">

### 評価基準
- **技術的実装**（35%）
  - GeoJSON データの正しい表示
  - レイヤー管理の適切性
  - JavaScript コードの品質
- **スタイリング**（25%）
  - 視覚的な美しさ
  - データドリブンスタイリングの活用
  - 一貫性のあるデザイン
- **インタラクション**（25%）
  - ポップアップの実装
  - ユーザビリティの向上
  - 操作の直感性
- **内容の充実度**（15%）
  - データの質
  - 機能の完成度
  - 創意工夫

### 提出期限・方法
- **期限**：次回授業開始時
- **方法**：学習管理システム経由

</div>

---

## 次回予告

### 第9回：スタイルの基本（ポイント、ライン、ポリゴン）
- 地図デザイン入門
- ポイント・ライン・ポリゴンの詳細スタイリング
- カラー・サイズ・線幅などの基本プロパティ
- ズームレベルによるスタイル調整
- 高度な表現技法

### 準備事項
- 今回作成したインタラクティブ地図の動作確認
- 色彩理論・デザイン原則の基礎知識
- 参考となる地図デザインの収集

---

## 質疑応答

### 本日の内容について
- 地図の基本操作・カスタマイズ
- レイヤー追加とデータソース管理
- JSON形式でのスタイル定義
- GeoJSON データの表示方法
- 課題に関する技術的な質問

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします

**第9回：スタイルの基本（ポイント、ライン、ポリゴン）**
[日時・教室]

課題の提出をお忘れなく！
