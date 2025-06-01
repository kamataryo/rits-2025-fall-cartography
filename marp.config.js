module.exports = {
  // テーマの設定
  themeSet: './themes',

  // HTML出力の設定
  html: {
    // ブラウザで開く際の設定
    allowLocalFiles: true,
  },

  // 数式サポート
  math: 'katex',

  // ウォッチモードの設定
  watch: {
    // ファイル変更時の自動リロード
    open: true,
    // ポート番号
    port: 8080
  }
};
