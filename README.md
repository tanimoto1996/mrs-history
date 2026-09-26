# mrs-history

Mrs. GREEN APPLE の歴史と曲の背景を学べる非公式ファンサイトです。年表と曲ページを行き来しながら読めます。

- 公開URL: https://tanimoto1996.github.io/mrs-history/
- 技術: [Astro](https://astro.build/)（静的サイト）＋ GitHub Pages
- 設計書: [docs/superpowers/specs/2026-09-27-mrs-history-design.md](docs/superpowers/specs/2026-09-27-mrs-history-design.md)

> **注意**
> このサイトの内容は AI（Claude）が作りました。人による確認はしていません。すべての記述に出典を付け、書いた AI とは別の AI が出典を開いて照合していますが、誤りが残っている可能性があります。正確な情報は各出典（公式サイトなど）で確かめてください。
> Mrs. GREEN APPLE・所属事務所・レーベルとは関係のない非公式サイトです。

## 対象読者

- **新しいファン**: 年表でバンドの流れをつかみ、気になった曲の背景を読む。
- **昔からのファン**: 曲ごとの本人発言や出典をたどって深掘りする。

日本語のみ。ログインや投稿はなく、読むだけのサイトです。スマホで読みやすいように作っています。

## ページ構成

| パス | 内容 |
| --- | --- |
| `/` | トップ。サイトの説明、「年表から読む」「曲から読む」、最近追加された解説、曲の検索（`/songs/?q=` へ） |
| `/timeline/` | 年表。フェーズ1／活動休止／フェーズ2／フェーズ3 ごとの出来事。種類（作品・ライブ・節目・受賞・メディア）で絞り込み |
| `/songs/` | 曲一覧。並び順（古い順・新しい順・曲名順）、時期・収録作品・解説あり・MVありで絞り込み、曲名・タイアップ作品名で検索 |
| `/songs/<slug>/` | 曲ページ。発売日・収録作品・クレジット・タイアップ・MV 埋め込み、解説（公式／考察／二次情報を色とラベルで区別）、出典一覧、関連する出来事、同じ作品の曲、前後の曲 |
| `/works/` | アルバム・シングルごとに曲をまとめた一覧（曲データの `works` から生成） |
| `/members/` | メンバー紹介（出典付き・照合済みの事実のみ） |
| `/about/` | このサイトについて。方針、AI 作成で人の確認がないこと、最終更新日 |

全ページに最終更新日（ビルド日）を表示します。

## 収録状況

2026-09-27 時点:

- 曲: 132 曲（解説あり `reviewed` 123 曲 / 基本情報のみ `basic` 9 曲）
- 年表の出来事: 92 件
- MV 埋め込み: 34 曲

最新の数は `npm run check` の出力で確認できます。

## 正確さの方針

このサイトで一番大事にしているルールです。詳しくは [CLAUDE.md](CLAUDE.md) を参照してください。

1. **記憶で書かない。** すべての事実は、実際に開いて中身を確かめた出典に基づきます。検索結果の要約だけでは書きません。
2. **出典の優先順**: 公式サイト・公式 SNS・公式 YouTube ＞ 本人が登場するインタビュー記事 ＞ 大手ニュース。
3. **記述の種類を分ける。**
   - `official`（公式）: 本人の発言・公式発表。出典と、出典中の根拠の一文（`evidence`）が必須。
   - `interpretation`（考察）: 歌詞の一節や発言などの根拠（`basis`）が必須。
   - `secondary`（二次情報）: 公式情報が見つからない曲に限り、ファンブログ・歌詞考察サイト・Wikipedia の内容を要約して載せるもの。出典と `evidence` が必須。
4. **別のエージェントが照合する。** 下書きしたのとは別のサブエージェントが出典を開いて照合し、合っていた記述だけを残して `status: reviewed` にします。合わなかった記述は削除します。
5. 確認できないことは書きません。

## 著作権の方針

- 歌詞は解説に必要な数行の引用だけ。全文は載せません。
- ジャケット画像やメンバー写真は置きません。映像は公式 YouTube（Mrs. GREEN APPLE／MrsGREENAPPLEVEVO）の埋め込みのみ、それ以外は公式ページへのリンクです。
- 検索エンジンに載りにくくするため、全ページに `noindex, nofollow` を入れています（[src/layouts/Base.astro](src/layouts/Base.astro)）。

## 開発

必要なもの: Node.js 22 以上（CI と同じ）

```sh
npm ci              # 依存関係のインストール
npm run dev         # 開発サーバー（http://localhost:4321/mrs-history/）
npm run check       # データの検査（下記）
npm run build       # dist/ に静的サイトを出力
npm run preview     # ビルド結果をローカルで確認
npm run verify-evidence [ファイル...]  # evidence が出典ページに実在するか確認（ネットワーク使用）
```

### ディレクトリ構成

```
src/
  content/
    songs/<slug>.yaml      曲データ（1曲1ファイル）
    events/<id>.yaml       年表の出来事（1件1ファイル）
  data/
    phases.yaml            時期（フェーズ）の定義
    members.yaml           メンバー情報
  content.config.ts        content collection のスキーマ（Zod）
  layouts/Base.astro       共通レイアウト（noindex など）
  lib/data.ts              ページ間で使うデータ処理
  pages/                   各ページ
scripts/
  check-content.mjs        出典参照・記述ルールの検査
  verify-evidence.mjs      evidence と出典本文の照合
docs/superpowers/specs/    設計書
.github/workflows/deploy.yml  GitHub Pages へのデプロイ
```

## データの書き方

### 曲（`src/content/songs/<slug>.yaml`）

```yaml
title: ANTENNA
releaseDate: 2023-07-05
phase: phase2                 # phases.yaml の id
works:                        # 収録作品
  - title: ANTENNA
    type: アルバム
    date: 2023-07-05
credits:                      # 書くなら sources と evidence が必須
  lyrics: 大森元貴
  music: 大森元貴
  sources: [am-song-1823814192]
  evidence: ...
tieups:
  - type: 応援ソング
    work: フジテレビ系「FIVB パリ五輪予選／ワールドカップバレー2023」日本代表応援ソング
    sources: [natalie-2023-antenna-volleyball]
mv: https://www.youtube.com/watch?v=XiSa_VIrGKE   # 公式 YouTube の watch URL のみ
status: reviewed              # basic | draft | reviewed
reviewedAt: 2026-09-27
basicSources: [um-pron-1061]  # 基本情報の出典（1件以上）
background:                   # 解説。reviewed のときだけサイトに出る
  - kind: official            # official | interpretation | secondary
    text: 藤澤涼架は、……と説明している。
    sources: [natalie-2023-antenna-volleyball]
    evidence: “アンテナ張っていこう”とか、……   # 出典中の根拠の一文
sources:                      # このファイルで使う出典の定義
  - id: natalie-2023-antenna-volleyball
    title: Mrs. GREEN APPLE「ANTENNA」が……
    media: 音楽ナタリー
    url: https://natalie.mu/music/news/534695
    date: 2023-07-28
```

`status` の意味:

- `basic`: 基本情報（発売日・収録作品など）だけ。解説は出さない。
- `draft`: 解説を下書きした段階。サイトには出さない。
- `reviewed`: 別エージェントの照合を通った。解説を表示する（解説が空だと検査エラー）。

### 出来事（`src/content/events/<id>.yaml`）

```yaml
date: "2013-04"               # YYYY / YYYY-MM / YYYY-MM-DD
title: 結成
kind: milestone               # release | live | milestone | award | media
description: 2013年4月、……
phase: phase1
relatedSongs: []              # 曲の slug
evidence: 2013年結成。
sources:
  - { id: profile, title: PROFILE, media: Mrs. GREEN APPLE OFFICIAL SITE, url: "https://mrsgreenapple.com/feature/profile" }
```

### 時期（`src/data/phases.yaml`）

`phase1`（フェーズ1）、`hiatus`（活動休止）、`phase2`（フェーズ2）、`phase3`（フェーズ3）。それぞれ `name`・`start`・`end`・`summary`・`sources` を持ちます。

## チェック

`npm run check` は次を行います。失敗したものは main に入れません。

1. `scripts/check-content.mjs`
   - 参照している出典 ID が同じファイルの `sources` に定義されている
   - `official` は出典と `evidence`、`interpretation` は `basis`、`secondary` は出典と `evidence` がある
   - クレジットを書いたら出典と `evidence` がある
   - タイアップに `type`・`work`・出典がある
   - `mv` が YouTube の watch URL の形になっている
   - `reviewed` の曲に解説がある
   - `phase` と `relatedSongs` の参照先が存在する
   - `members.yaml` のすべての事実に出典と `evidence` がある
2. `astro sync` で content collection のスキーマ（Zod）を検査

`npm run verify-evidence` は `reviewed` の曲の `evidence` が出典ページの本文に実際にあるかを取得して確かめます。ネットワークを使うため CI では動かさず、手元で使います。

## 作業の流れ

1. **基本情報**: 公式ディスコグラフィなどから集め、出典付きで登録（`status: basic`）。
2. **解説の下書き**: サブエージェント A が出典を開いて下書き（`draft`）。
3. **照合**: サブエージェント B が出典を開いて各記述を照合。合格した記述だけ残して `reviewed` に。不合格の記述は削除。
4. **反映**: 作業ごとにブランチを切り、`npm run check` と `npm run build` が通ったら main にマージして push。

## デプロイ

main に push すると GitHub Actions（[.github/workflows/deploy.yml](.github/workflows/deploy.yml)）が `npm ci` → `npm run check` → `npm run build` を実行し、`dist/` を GitHub Pages に公開します。

- `site`: `https://tanimoto1996.github.io`
- `base`: `/mrs-history`（リンクには `import.meta.env.BASE_URL` を使う）
- `trailingSlash: 'always'`

## 誤りを見つけたら

[Issues](https://github.com/tanimoto1996/mrs-history/issues) で、ページの URL・誤っている箇所・正しい内容の出典を教えてください。
