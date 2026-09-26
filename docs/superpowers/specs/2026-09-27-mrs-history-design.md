# mrs-history 設計書（2026-09-27）

## 目的
Mrs. GREEN APPLEの歴史と曲の背景を、新しいファン（追いつきたい人）と昔からのファン（深掘りしたい人）が学べるサイト。年表と曲ページを行き来できる。

## 前提
- 日本語のみ。読むだけ（ログイン・投稿なし）。スマホで読みやすく。
- GitHub Pagesで公開（実質一般公開）。noindex。歌詞は数行引用のみ、画像なし、公式YouTube埋め込み。
- 全曲を対象。基本情報と年表を先にそろえ、解説は検証済みの曲から順に表示。
- 人による確認はしない。正確さは「出典必須＋別エージェントによる照合＋スキーマチェック」で担保し、その旨をサイトに明記。

## ページ
- `/` トップ：説明、「年表から読む」「曲から読む」、最近追加された解説
- `/timeline/` 年表：フェーズ（フェーズ1／活動休止／フェーズ2／フェーズ3）ごとに出来事。各時期の曲へのリンク
- `/songs/` 曲一覧：発売順。時期・収録作品・解説ありで絞り込み、曲名・タイアップ作品名で検索（クライアントJS）
- `/songs/<slug>/` 曲ページ：基本情報（発売日・収録作品・作詞作曲・タイアップ・MV埋め込み）、解説（公式／考察を色とラベルで区別、出典番号）、出典一覧、年表の該当時期へのリンク、前後の曲
- `/about/` このサイトについて：方針、AI作成・人の確認なし、最終更新日
- 全ページに最終更新日（ビルド日）を表示

## データ（`src/content/`）
- `songs/<slug>.yaml`：title, releaseDate, phase, works[{title,type}], credits{lyrics,music}, mv?, tieups[{type,work,sources}], status(basic|draft|reviewed), background[{kind(official|interpretation), text, sources, evidence?, basis?}], sources[{id,title,media,url,date?}], basicSources[]
- `events/<id>.yaml`：date, title, description, phase, sources, relatedSongs
- `phases.yaml`：id, name, start, end?, sources
- 出典IDは同じファイル内の sources に定義されている必要がある。

## チェック（`npm run check`）
- Astroのcontent collectionスキーマ（Zod）で型を検査。
- 追加スクリプト `scripts/check-content.mjs`：
  - 参照している出典IDが存在する
  - official の記述は出典1件以上＋evidence必須、interpretation は basis 必須
  - status=reviewed 以外の background はビルドに出さない（draftは表示しない）
  - relatedSongs・phase の参照先が存在する
- `npm run build` が通ること。

## 作業の流れ
1. 基本情報：公式ディスコグラフィ等から収集し出典付きで登録（status: basic）
2. 解説：サブエージェントAが出典を開いて下書き（draft）→ サブエージェントBが出典を開いて各記述を照合 → 合格したものだけ reviewed、不合格の記述は削除
3. ブランチ → check/build → mainへマージ → push → GitHub Actionsで Pages にデプロイ

## デプロイ
- GitHub Actions（withastro/action）で main push 時に Pages へ。site: https://tanimoto1996.github.io, base: /mrs-history
