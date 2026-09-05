# media-notes

[中文](README.md) · [English](README.en.md)

> 音声・動画 → 構造化ノートのワンストップワークスペース。

`media-notes` は、音声・動画コンテンツを抽出し**人間が読める構造化ノート**に整理するためのワークスペースです。`media-content-distiller` スキルで B 站（ビリビリ）・YouTube などの字幕を取得し（BibiGPT が提供）、AI エージェントがその字幕をもとに `笔记`（ノート）/ `指南`（ガイド）/ `手册`（マニュアル）に整理。ワンコマンドで個人サイトに公開もできます。

## 特徴

| 特徴 | 説明 |
| --- | --- |
| 🎬 マルチプラットフォーム字幕取得 | B 站・YouTube などの字幕を取得し、生の cue を証跡として保存 |
| 🤖 エージェントによる整理 | 字幕 → 構造化ノート：合意した命名規則・索引・相互リンク |
| 📂 主成果物 / 副成果物の分離 | 人間が読むノートは `media-note/`、字幕などの副成果物は `byproducts/` |
| 📤 一方向パブリッシュ | `scripts/publish-notes.mjs` で個人サイトへ公開。副成果物は公開しない |
| 🔒 公開リポジトリの安全境界 | ASR 全文転写はローカルのみ（gitignore 済み）。公開リポジトリに副成果物は含まれない |

公開先サイト：<https://dithob.github.io/notes/>（Astro · GitHub Pages / Actions による自動ビルド）。

## ディレクトリ構成

```text
media-notes/
├── README.md / README.en.md / README.ja.md   # 3言語対応 README
├── AGENTS.md                                 # エージェント向け操作マニュアル（命名・ワークフロー・安全）
├── media-note/                               # 主成果物：完成したノート（フラット配置）
│   ├── README.md                             # ノート索引
│   └── <タイトル> <タイプ>.md
├── byproducts/                               # 副成果物：字幕・メタデータ・転写（ローカルのみ）
│   └── <source-id>/
├── scripts/                                  # 公開スクリプト publish-notes.mjs
├── skills/                                   # skills.sh スキルソース（media-content-distiller など）
├── .pi/skills/                               # pi プロジェクトスキル（media-notes-publishing）
└── docs/                                     # 設計ドキュメント
```

## クイックスタート

1. 字幕取得：`python <skill>/scripts/acquire_subtitle.py subtitle --input "<URL>" --output-dir ./byproducts --main-product-dir ./media-note --preflight`
2. エージェントが字幕をもとに主成果物 `media-note/<タイトル> <タイプ>.md` を作成
3. `media-note/README.md` の索引を更新し、ノート末尾に `## 副产物导航`（副成果物ナビゲーション）を追加
4. （任意）`node scripts/publish-notes.mjs --write` で個人サイトへ公開

命名規則・ワークフロー詳細・既知の落とし穴は [AGENTS.md](AGENTS.md)（中国語）を参照。公開の完全な設計は [docs/site-notes-publishing.md](docs/site-notes-publishing.md)（中国語）。

## 個人サイトへの公開

```bash
node scripts/publish-notes.mjs           # ドライラン：報告のみ、ファイルは書かない
node scripts/publish-notes.mjs --write   # サイトリポジトリの src/content/notes/ へ書き込み
```

公開するのはノート本文のみ。副成果物は公開しません。各ノートには `scripts/publish.config.mjs` にエントリ（slug・カテゴリ・要約など、スクリプトが推測できないフィールドのみ）が必要です。それ以外のメタデータは、ファイル名・索引テーブル・本文冒頭の出典ブロックから解析します。

## スキルソース（skills.sh）

このリポジトリは [skills.sh](https://skills.sh) のスキルソースでもあります。[`skills/`](skills/README.md) には `media-content-distiller` と `extract-tool-registration`、プロジェクト自身の `media-notes-publishing` は `.pi/skills/`（pi プロジェクトスキル。ソースの一部）にあります。エージェントは以下のコマンドでインストールできます：

```bash
npx skills add Dithob/media-notes --skill media-content-distiller
npx skills add Dithob/media-notes --skill extract-tool-registration
npx skills add Dithob/media-notes --skill media-notes-publishing
npx skills add Dithob/media-notes --list        # 一覧表示
```

[![skills.sh](https://skills.sh/b/Dithob/media-notes)](https://skills.sh/Dithob/media-notes)

## セキュリティ

**このリポジトリは公開リポジトリです。** `byproducts/`（生字幕・タイムライン転写）は gitignore され、追跡も停止済み。過去のコミットに副成果物が含まれる場合は、`git filter-repo --path byproducts/ --invert-paths` で履歴を書き換えてください。トークンやアカウントファイルも同様にリポジトリ外に置きます。完全な方針は [AGENTS.md](AGENTS.md#安全红线)（中国語）を参照。
