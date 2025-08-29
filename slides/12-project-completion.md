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

## 第12回：応用プロジェクト（2）- 地図プロジェクトの完成

立命館大学 2025年度 秋セメスター 火曜5限
授業時間：95分

---

## 本日のアジェンダ

1. **前回の振り返り・企画確認** (12分)
2. **地図デザインの最終調整** (28分)
3. **プロジェクトの動作確認・デバッグ** (28分)
4. **発表準備・プレゼンテーション資料作成** (22分)
5. **最終調整とブラッシュアップ** (5分)

---

## 前回の振り返り

### 第11回の主要ポイント
- 地図プロジェクトのテーマ選定
- データの準備と設計
- プロトタイプの作成
- ディスカッションとフィードバック

### 企画の確認
提出されたプロジェクト企画書の概要
- 多様なテーマの選択
- 技術的実現可能性の検討
- データソースの特定
- 実装計画の策定

---

## 地図デザインの最終調整

### デザイン品質の向上

#### 1. 視覚的階層の最適化
```css
/* 情報の重要度に応じたスタイリング */
.primary-info {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.secondary-info {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 8px;
}

.metadata {
  font-size: 12px;
  color: #bdc3c7;
  font-style: italic;
}
```

#### 2. カラーパレットの統一
```javascript
// プロジェクト共通のカラーパレット
const colorPalette = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  neutral: {
    light: '#ecf0f1',
    medium: '#95a5a6',
    dark: '#2c3e50'
  },
  background: '#ffffff',
  text: '#2c3e50'
};
```

---

#### 3. レスポンシブデザインの実装
```css
/* モバイル対応 */
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    top: 0;
    left: -300px;
    width: 300px;
    height: 100%;
    transition: left 0.3s ease;
    z-index: 1000;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .map-container {
    width: 100%;
  }
  
  .controls {
    bottom: 20px;
    right: 20px;
  }
}

/* タブレット対応 */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 250px;
  }
  
  .popup-content {
    max-width: 300px;
  }
}
```

---

#### 4. アクセシビリティの向上
```javascript
// キーボードナビゲーション対応
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'Escape':
      closeAllPopups();
      break;
    case 'Tab':
      if (e.shiftKey) {
        focusPreviousElement();
      } else {
        focusNextElement();
      }
      break;
    case 'Enter':
    case ' ':
      if (e.target.classList.contains('interactive')) {
        e.target.click();
      }
      break;
  }
});

// ARIA属性の設定
function setupAccessibility() {
  const mapContainer = document.getElementById('map');
  mapContainer.setAttribute('role', 'application');
  mapContainer.setAttribute('aria-label', '地図表示エリア');
  
  const controls = document.querySelectorAll('.control-button');
  controls.forEach(button => {
    button.setAttribute('tabindex', '0');
    button.setAttribute('role', 'button');
  });
}
```

---

### ユーザーインターフェースの改善

#### 1. 直感的なナビゲーション
```html
<!-- 改善されたナビゲーション -->
<nav class="main-navigation">
  <div class="nav-brand">
    <h1>プロジェクト名</h1>
  </div>
  <div class="nav-controls">
    <button class="nav-button" data-action="search">
      <i class="icon-search"></i>
      <span>検索</span>
    </button>
    <button class="nav-button" data-action="filter">
      <i class="icon-filter"></i>
      <span>フィルター</span>
    </button>
    <button class="nav-button" data-action="layers">
      <i class="icon-layers"></i>
      <span>レイヤー</span>
    </button>
  </div>
</nav>
```

#### 2. 情報表示の最適化
```javascript
// 段階的な情報開示
class InfoDisplay {
  constructor() {
    this.currentLevel = 'summary';
  }
  
  showSummary(feature) {
    return `
      <div class="info-summary">
        <h3>${feature.properties.name}</h3>
        <p class="category">${feature.properties.category}</p>
        <button onclick="this.showDetails('${feature.id}')">
          詳細を見る
        </button>
      </div>
    `;
  }
  
  showDetails(featureId) {
    const feature = this.getFeature(featureId);
    return `
      <div class="info-details">
        <h3>${feature.properties.name}</h3>
        <div class="detail-content">
          ${this.generateDetailContent(feature)}
        </div>
        <div class="actions">
          <button onclick="this.showRoute('${featureId}')">
            ルート検索
          </button>
          <button onclick="this.shareLocation('${featureId}')">
            共有
          </button>
        </div>
      </div>
    `;
  }
}
```

---

#### 3. フィードバック機能の実装
```javascript
// ユーザーフィードバック機能
class FeedbackSystem {
  constructor() {
    this.feedbackData = [];
  }
  
  showFeedbackForm(featureId) {
    const form = `
      <div class="feedback-form">
        <h4>この情報は役に立ちましたか？</h4>
        <div class="rating">
          ${this.generateStarRating()}
        </div>
        <textarea placeholder="コメント（任意）"></textarea>
        <div class="form-actions">
          <button onclick="this.submitFeedback('${featureId}')">
            送信
          </button>
          <button onclick="this.closeFeedbackForm()">
            キャンセル
          </button>
        </div>
      </div>
    `;
    return form;
  }
  
  submitFeedback(featureId) {
    const rating = this.getRatingValue();
    const comment = this.getCommentValue();
    
    this.feedbackData.push({
      featureId,
      rating,
      comment,
      timestamp: new Date().toISOString()
    });
    
    this.showThankYouMessage();
  }
}
```

---

## プロジェクトの動作確認・デバッグ

### 体系的なテスト手法

#### 1. 機能テスト
```javascript
// 基本機能のテストスイート
class FunctionalTests {
  async runAllTests() {
    const results = [];
    
    // 地図表示テスト
    results.push(await this.testMapDisplay());
    
    // データ読み込みテスト
    results.push(await this.testDataLoading());
    
    // インタラクションテスト
    results.push(await this.testInteractions());
    
    // レスポンシブテスト
    results.push(await this.testResponsive());
    
    return results;
  }
  
  async testMapDisplay() {
    try {
      // 地図が正常に表示されるかテスト
      const map = document.getElementById('map');
      const mapInstance = map._maplibregl;
      
      if (!mapInstance) {
        throw new Error('地図インスタンスが見つかりません');
      }
      
      if (!mapInstance.isStyleLoaded()) {
        throw new Error('地図スタイルが読み込まれていません');
      }
      
      return { test: 'mapDisplay', status: 'pass' };
    } catch (error) {
      return { test: 'mapDisplay', status: 'fail', error: error.message };
    }
  }
}
```

---

#### 2. パフォーマンステスト
```javascript
// パフォーマンス監視
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }
  
  startTiming(label) {
    this.metrics[label] = {
      start: performance.now()
    };
  }
  
  endTiming(label) {
    if (this.metrics[label]) {
      this.metrics[label].end = performance.now();
      this.metrics[label].duration = 
        this.metrics[label].end - this.metrics[label].start;
    }
  }
  
  measureDataLoading() {
    this.startTiming('dataLoad');
    
    return fetch('data.geojson')
      .then(response => response.json())
      .then(data => {
        this.endTiming('dataLoad');
        console.log(`データ読み込み時間: ${this.metrics.dataLoad.duration}ms`);
        return data;
      });
  }
  
  measureRenderingPerformance() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'measure') {
          console.log(`${entry.name}: ${entry.duration}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
}
```

---

#### 3. エラーハンドリングの強化
```javascript
// 包括的なエラーハンドリング
class ErrorHandler {
  constructor() {
    this.setupGlobalErrorHandling();
  }
  
  setupGlobalErrorHandling() {
    // JavaScript エラーのキャッチ
    window.addEventListener('error', (e) => {
      this.logError('JavaScript Error', e.error);
    });
    
    // Promise の未処理エラーのキャッチ
    window.addEventListener('unhandledrejection', (e) => {
      this.logError('Unhandled Promise Rejection', e.reason);
    });
    
    // MapLibre GL JS エラーのキャッチ
    if (window.map) {
      window.map.on('error', (e) => {
        this.logError('MapLibre Error', e.error);
      });
    }
  }
  
  logError(type, error) {
    const errorInfo = {
      type,
      message: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('Error logged:', errorInfo);
    
    // エラー情報をサーバーに送信（実装に応じて）
    this.sendErrorToServer(errorInfo);
  }
  
  sendErrorToServer(errorInfo) {
    // エラーログの送信（オプション）
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorInfo)
    }).catch(() => {
      // エラー送信に失敗した場合はローカルストレージに保存
      this.saveErrorLocally(errorInfo);
    });
  }
}
```

---

#### 4. ブラウザ互換性の確認
```javascript
// ブラウザ互換性チェック
class CompatibilityChecker {
  checkBrowserSupport() {
    const requirements = {
      webgl: this.checkWebGL(),
      geolocation: this.checkGeolocation(),
      localStorage: this.checkLocalStorage(),
      fetch: this.checkFetch(),
      es6: this.checkES6()
    };
    
    const unsupported = Object.entries(requirements)
      .filter(([key, supported]) => !supported)
      .map(([key]) => key);
    
    if (unsupported.length > 0) {
      this.showCompatibilityWarning(unsupported);
    }
    
    return requirements;
  }
  
  checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }
  
  checkGeolocation() {
    return 'geolocation' in navigator;
  }
  
  checkLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }
  
  showCompatibilityWarning(unsupported) {
    const warning = `
      <div class="compatibility-warning">
        <h3>ブラウザ互換性の警告</h3>
        <p>お使いのブラウザでは以下の機能がサポートされていません：</p>
        <ul>
          ${unsupported.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <p>最新のブラウザでのご利用をお勧めします。</p>
      </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', warning);
  }
}
```

---

## 発表準備・プレゼンテーション資料作成

### 効果的なプレゼンテーション構成

#### 1. プレゼンテーション構造
```markdown
## プロジェクト発表構成（5分間）

### 1. イントロダクション（30秒）
- プロジェクト名
- 開発者自己紹介
- 発表の流れ

### 2. 問題設定・動機（60秒）
- 解決したい課題
- なぜこのテーマを選んだか
- ターゲットユーザー

### 3. ソリューション概要（60秒）
- アプローチ方法
- 主要機能
- 技術的特徴

### 4. デモンストレーション（150秒）
- 実際の操作画面
- 主要機能の実演
- ユーザーシナリオの実行

### 5. 技術的ポイント（30秒）
- 使用技術
- 工夫した点
- 課題と解決方法

### 6. まとめ・今後の展望（30秒）
- 成果と学び
- 改善点
- 将来の発展可能性
```

---

#### 2. デモシナリオの準備
```javascript
// デモ用のシナリオスクリプト
class DemoScenario {
  constructor(map) {
    this.map = map;
    this.steps = [];
    this.currentStep = 0;
  }
  
  addStep(description, action, duration = 3000) {
    this.steps.push({
      description,
      action,
      duration
    });
  }
  
  async runDemo() {
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      
      // ステップの説明を表示
      this.showStepDescription(step.description);
      
      // アクションを実行
      await step.action();
      
      // 次のステップまで待機
      await this.wait(step.duration);
    }
  }
  
  showStepDescription(description) {
    const overlay = document.createElement('div');
    overlay.className = 'demo-overlay';
    overlay.innerHTML = `
      <div class="demo-description">
        <p>${description}</p>
      </div>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.remove();
    }, 2000);
  }
  
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// デモシナリオの設定例
const demo = new DemoScenario(map);

demo.addStep(
  "まず、地図の全体表示から始めます",
  () => map.flyTo({ center: [135.5, 34.7], zoom: 10 })
);

demo.addStep(
  "特定のエリアにズームインします",
  () => map.flyTo({ center: [135.5122, 34.9981], zoom: 15 })
);

demo.addStep(
  "データポイントをクリックして詳細情報を表示します",
  () => map.fire('click', { lngLat: [135.5122, 34.9981] })
);
```

---

#### 3. 発表資料の作成
```html
<!-- プレゼンテーション用のスライド -->
<!DOCTYPE html>
<html>
<head>
  <title>プロジェクト発表</title>
  <style>
    .slide {
      width: 100vw;
      height: 100vh;
      display: none;
      padding: 40px;
      box-sizing: border-box;
    }
    
    .slide.active {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    .slide h1 {
      font-size: 3em;
      margin-bottom: 20px;
    }
    
    .slide h2 {
      font-size: 2em;
      margin-bottom: 15px;
    }
    
    .demo-container {
      width: 80%;
      height: 60%;
      border: 2px solid #ccc;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <!-- タイトルスライド -->
  <div class="slide active">
    <h1>プロジェクト名</h1>
    <h2>サブタイトル</h2>
    <p>発表者名</p>
  </div>
  
  <!-- 問題設定スライド -->
  <div class="slide">
    <h2>解決したい課題</h2>
    <ul>
      <li>課題1</li>
      <li>課題2</li>
      <li>課題3</li>
    </ul>
  </div>
  
  <!-- デモスライド -->
  <div class="slide">
    <h2>デモンストレーション</h2>
    <div class="demo-container">
      <iframe src="project.html" width="100%" height="100%"></iframe>
    </div>
  </div>
  
  <!-- まとめスライド -->
  <div class="slide">
    <h2>まとめ</h2>
    <ul>
      <li>成果</li>
      <li>学び</li>
      <li>今後の展望</li>
    </ul>
  </div>
</body>
</html>
```

---

### 発表時の注意点

#### 1. 技術的準備
- **バックアップ計画**：デモが失敗した場合の代替手段
- **ネットワーク対応**：オフラインでも動作する準備
- **ブラウザ設定**：発表用ブラウザの事前設定
- **画面解像度**：プロジェクター対応の確認

#### 2. 発表技術
- **時間管理**：各セクションの時間配分
- **聴衆との関わり**：アイコンタクト・質問の促進
- **明確な説明**：専門用語の適切な説明
- **情熱の表現**：プロジェクトへの熱意の伝達

---

## 最終調整とブラッシュアップ

### 品質向上のチェックリスト

#### 技術的品質
- [ ] すべての機能が正常に動作する
- [ ] エラーハンドリングが適切に実装されている
- [ ] パフォーマンスが許容範囲内である
- [ ] 複数ブラウザで動作確認済み
- [ ] レスポンシブデザインが機能している

#### デザイン品質
- [ ] 視覚的階層が明確である
- [ ] カラーパレットが統一されている
- [ ] フォントサイズが適切である
- [ ] アクセシビリティに配慮されている
- [ ] ユーザビリティが良好である

---

#### コンテンツ品質
- [ ] データが正確で最新である
- [ ] 情報が適切に整理されている
- [ ] 説明文が分かりやすい
- [ ] 画像・アイコンが適切である
- [ ] 著作権・ライセンスが適切に表示されている

#### プレゼンテーション品質
- [ ] 発表資料が完成している
- [ ] デモシナリオが準備されている
- [ ] 時間配分が適切である
- [ ] 質疑応答の準備ができている
- [ ] バックアップ計画がある

---

### 最終確認作業

#### 1. 総合テスト
```javascript
// 最終確認用のテストスイート
async function finalCheck() {
  console.log('=== 最終確認開始 ===');
  
  // 基本機能テスト
  const basicTests = await runBasicTests();
  console.log('基本機能テスト:', basicTests);
  
  // パフォーマンステスト
  const performanceTests = await runPerformanceTests();
  console.log('パフォーマンステスト:', performanceTests);
  
  // ユーザビリティテスト
  const usabilityTests = await runUsabilityTests();
  console.log('ユーザビリティテスト:', usabilityTests);
  
  // 総合評価
  const overallScore = calculateOverallScore([
    basicTests,
    performanceTests,
    usabilityTests
  ]);
  
  console.log('=== 最終確認完了 ===');
  console.log('総合スコア:', overallScore);
  
  return overallScore;
}
```

---

#### 2. ドキュメント整備
```markdown
# プロジェクトドキュメント

## 概要
- プロジェクト名：
- 開発者：
- 開発期間：
- 使用技術：

## 機能一覧
1. 基本機能
   - 地図表示
   - データ表示
   - インタラクション

2. 応用機能
   - 検索機能
   - フィルタリング
   - データ分析

## 技術仕様
- フロントエンド：MapLibre GL JS, HTML5, CSS3, JavaScript
- データ形式：GeoJSON
- 地図タイル：OpenStreetMap
- ホスティング：GitHub Pages

## インストール・実行方法
1. リポジトリのクローン
2. ローカルサーバーの起動
3. ブラウザでアクセス

## 今後の改善点
- 機能追加の予定
- パフォーマンス改善
- ユーザビリティ向上

## ライセンス・著作権
- 使用データのライセンス
- 第三者ライブラリの著作権
- プロジェクト自体のライセンス
```

---

<div class="assignment">

## 最終課題：完成したプロジェクトの発表及び提出

### 提出物

#### 1. 完成プロジェクト
- **ファイル名**：`[学籍番号]_final_project.html`
- **要件**：完全に動作する地図アプリケーション
- **内容**：企画書に基づいた全機能の実装

#### 2. プロジェクトファイル一式
- **HTML ファイル**：メインアプリケーション
- **データファイル**：GeoJSON、画像等
- **ドキュメント**：README.md、技術仕様書
- **発表資料**：プレゼンテーション用スライド

#### 3. 最終レポート
- **形式**：A4用紙4-5枚程度（PDF形式）
- **内容**：
  - プロジェクト概要と目的
  - 実装した機能の詳細
  - 使用技術と工夫した点
  - 開発過程での課題と解決方法
  - 成果と学習効果
  - 今後の改善・発展可能性

</div>

---

<div class="assignment">

### 発表要件
- **発表時間**：1人5分（デモ3分 + 質疑2分）
- **発表内容**：
  - プロジェクト概要（30秒）
  - 実際のデモンストレーション（3分）
  - 技術的ポイント（30秒）
  - 質疑応答（2分）

### 評価基準
- **技術的完成度**（30%）
  - 機能の実装状況
  - コードの品質
  - エラーハンドリング
- **デザイン・ユーザビリティ**（25%）
  - 視覚的な美しさ
  - 使いやすさ
  - レスポンシブ対応
- **独創性・実用性**（25%）
  - アイデアの新しさ
  - 実際の利用価値
  - 問題解決への貢献
- **発表・ドキュメント**（20%）
  - 発表の分かりやすさ
  - レポートの質
  - プロジェクトの説明力

</div>

---

<div class="assignment">

### 提出期限・方法
- **期限**：次回授業開始時（第13-14回発表会）
- **方法**：学習管理システム経由
- **注意事項**：
  - すべてのファイルを zip 形式で圧縮して提出
  - ファイル名は `[学籍番号]_final_project.zip`
  - 発表用の資料も含めること

### 発表会の準備
- 発表順序は当日発表
- 各自のノートPC使用可能
- プロジェクター・スクリーン利用可能
- ネットワーク接続あり（バックアップ推奨）

</div>

---

## 次回予告

### 第13-14回：プロジェクト発表会
- 各自のプロジェクト発表（5分×人数）
- 相互評価とフィードバック
- 優秀作品の表彰
- 授業全体の振り返り
- 今後の学習・発展に向けて

### 準備事項
- 完成プロジェクトの最終確認
- 発表資料の準備
- デモシナリオの練習
- 質疑応答の準備

---

## 質疑応答

### 本日の内容について
- プロジェクト完成に向けた技術的課題
- デザイン・ユーザビリティの改善
- 発表準備・プレゼンテーション技術
- 最終提出に関する質問

---

<!-- _class: title -->

# ありがとうございました

## 次回は発表会です

**第13-14回：プロジェクト発表会**
[日時・教室]

素晴らしいプロジェクトの完成を期待しています！
