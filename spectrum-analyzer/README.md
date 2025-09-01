# スペクトラムアナライザプロジェクト

このプロジェクトは、Web Audio APIを使用して音声データを取得・解析し、Canvasにグラフを描画するスペクトラムアナライザのWebサイトを作成するものです。

## プロジェクト構成

```
spectrum-analyzer
├── src
│   ├── index.html        # Webサイトの基本構造を定義
│   ├── styles
│   │   └── style.css     # Webサイトのスタイルを定義
│   ├── scripts
│   │   └── app.js        # 音声データの取得と解析を行うJavaScriptコード
│   └── assets            # 画像やフォントなどのアセットを格納
├── README.md             # プロジェクトの概要や使い方を説明
└── package.json          # npmの設定ファイル
```

## 使用方法

1. リポジトリをクローンまたはダウンロードします。
2. 必要な依存関係をインストールします。
   ```
   npm install
   ```
3. `src/index.html`をブラウザで開きます。
4. マイクのアクセスを許可し、音声を入力すると、スペクトラムが表示されます。

## 技術スタック

- HTML
- CSS
- JavaScript
- Web Audio API
- Canvas API

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。