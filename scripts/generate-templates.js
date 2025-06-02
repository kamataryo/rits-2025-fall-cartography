const fs = require('fs');
const path = require('path');

// 授業計画
const lessons = [
  {
    number: 3,
    title: "MapLibre GL JSの基礎",
    agenda: [
      "MapLibre GL JSのセットアップ (15分)",
      "基本的な地図表示 (25分)",
      "地図の操作とイベント処理 (25分)",
      "デバッグとトラブルシューティング (15分)",
      "実習・質疑応答 (5分)"
    ],
    nextTitle: "地図のスタイリング"
  },
  {
    number: 4,
    title: "地図のスタイリング",
    agenda: [
      "スタイル仕様の理解 (15分)",
      "カスタムスタイルの作成 (30分)",
      "レイヤーとソースの設定 (25分)",
      "実習・演習 (10分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "データの可視化"
  },
  {
    number: 5,
    title: "データの可視化",
    agenda: [
      "GeoJSONデータの理解 (15分)",
      "ポイント・ライン・ポリゴンの表示 (30分)",
      "データドリブンスタイリング (25分)",
      "実習・演習 (10分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "インタラクション機能"
  },
  {
    number: 6,
    title: "インタラクション機能",
    agenda: [
      "イベントハンドリングの基礎 (15分)",
      "クリック・ホバーイベント (25分)",
      "ポップアップとツールチップ (25分)",
      "実習・演習 (15分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "レイヤーとフィルタリング"
  },
  {
    number: 7,
    title: "レイヤーとフィルタリング",
    agenda: [
      "レイヤー管理の基礎 (15分)",
      "動的レイヤー切り替え (25分)",
      "データフィルタリング (25分)",
      "実習・演習 (15分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "3D表現と地形表示"
  },
  {
    number: 8,
    title: "3D表現と地形表示",
    agenda: [
      "3D機能の概要 (15分)",
      "建物の3D表示 (25分)",
      "地形データの活用 (25分)",
      "実習・演習 (15分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "アニメーションと時系列データ"
  },
  {
    number: 9,
    title: "アニメーションと時系列データ",
    agenda: [
      "アニメーション機能の基礎 (15分)",
      "時系列データの可視化 (30分)",
      "動的な地図表現 (25分)",
      "実習・演習 (10分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "位置情報とGPS"
  },
  {
    number: 10,
    title: "位置情報とGPS",
    agenda: [
      "位置情報APIの活用 (15分)",
      "GPS連携機能 (25分)",
      "モバイル対応 (25分)",
      "実習・演習 (15分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "外部データとの連携"
  },
  {
    number: 11,
    title: "外部データとの連携",
    agenda: [
      "REST API連携 (20分)",
      "リアルタイムデータの取得 (25分)",
      "データ統合とマッシュアップ (25分)",
      "実習・演習 (10分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "パフォーマンス最適化"
  },
  {
    number: 12,
    title: "パフォーマンス最適化",
    agenda: [
      "パフォーマンス測定 (15分)",
      "最適化技術 (30分)",
      "大量データの処理 (25分)",
      "実習・演習 (10分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "実践プロジェクト"
  },
  {
    number: 13,
    title: "実践プロジェクト",
    agenda: [
      "プロジェクト要件の確認 (10分)",
      "設計・実装 (60分)",
      "テスト・デバッグ (10分)",
      "まとめ・質疑応答 (5分)"
    ],
    nextTitle: "発表・まとめ"
  },
  {
    number: 14,
    title: "発表・まとめ",
    agenda: [
      "プロジェクト発表 (60分)",
      "授業全体の振り返り (15分)",
      "今後の学習指針 (10分)"
    ],
    nextTitle: null
  }
];

// テンプレート生成関数
function generateTemplate(lesson) {
  const agendaItems = lesson.agenda.map((item, index) => `${index + 1}. **${item}**`).join('\n');
  const nextSection = lesson.nextTitle ?
    `### 第${lesson.number + 1}回：${lesson.nextTitle}` :
    '### 授業終了\n\nお疲れさまでした！';

  return `---
marp: true
theme: default
class: title
paginate: true
---

<!-- _class: title -->

# MapLibre GL JS と OpenStreetMap で始めるウェブカートグラフィ入門

## 第${lesson.number}回：${lesson.title}

立命館大学 2025年度秋学期

---

## 本日のアジェンダ

${agendaItems}

---

## 授業内容

<!-- ここに授業内容を追加 -->

---

<div class="assignment">

## 課題

<!-- 課題内容を記載 -->

</div>

---

## 次回予告

${nextSection}

---

<!-- _class: title -->

# ありがとうございました

## 次回もよろしくお願いします
`;
}

// ディレクトリ作成
const slidesDir = path.join(__dirname, '..', 'slides');
if (!fs.existsSync(slidesDir)) {
  fs.mkdirSync(slidesDir, { recursive: true });
}

// ファイル名生成用のマッピング
const filenameMap = {
  3: '03-maplibre-basics.md',
  4: '04-map-styling.md',
  5: '05-data-visualization.md',
  6: '06-interaction.md',
  7: '07-layers-filtering.md',
  8: '08-3d-terrain.md',
  9: '09-animation-timeseries.md',
  10: '10-location-gps.md',
  11: '11-external-data.md',
  12: '12-performance.md',
  13: '13-project.md',
  14: '14-presentation.md'
};

// テンプレート生成
lessons.forEach(lesson => {
  const filename = filenameMap[lesson.number];
  const filepath = path.join(slidesDir, filename);

  // 既存ファイルがある場合はスキップ
  if (!fs.existsSync(filepath)) {
    const content = generateTemplate(lesson);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Generated: ${filename}`);
  } else {
    console.log(`Skipped (exists): ${filename}`);
  }
});

console.log('Template generation completed!');
