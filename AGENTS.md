# AGENTS.md

## Project Overview

- マッチングアプリを想定した API 学習用プロジェクトです。
- Runtime は Bun、Web Framework は Hono、DB は PostgreSQL、Query Builder は Kysely です。
- DDD とオニオンアーキテクチャの責務分離を優先します。
- 詳細なドメイン説明は `README.md`、細かい実装規約は `.cursor/rules/` を確認してください。

## Commands

- 依存関係の追加・更新: `bun install`
- 開発サーバー起動（Bun / Docker）: `bun run dev`
- Workers ローカル起動: `bun run dev:worker`
- Cloudflare へデプロイ: `bun run deploy`
- テスト実行: `bun run test`
- Lint: `bun run lint`
- Format 確認: `bun run format:check`
- Format 適用: `bun run format`
- DB migration 実行: `bun run migrate`
- DB / mail を使う作業では必要に応じて `docker compose up db mail` を使います。

## Architecture Rules

- `src/Domain`: Entity、Value Object、Repository interface、DomainService interface を置きます。
- `src/ApplicationService`: ユースケースを 1 ファイル 1 `execute` メソッドで表現します。
- `src/Infra`: Repository / QueryService / DomainService の実装、DB、外部 API など技術詳細を置きます。
- `src/Presentation`: HTTP 入力、簡易バリデーション、レスポンス返却を担当します。
- `src/Cmd`: アプリ起動、middleware、DI、ルーティング、共通エラーハンドリングを担当します。
- 依存方向は外側から内側へ保ち、Domain は他の層へ依存させません。

## Implementation Rules

- Domain 層ではライブラリ依存を可能な限り避け、ビジネスルールを Value Object / Entity に寄せます。
- Presentation 層のバリデーションは必須項目や大まかな型の確認に留めます。
- 文字数、形式、許可値などのビジネスルールは Domain 層で検証します。
- Presentation から Domain / Infra を直接 import せず、ApplicationService 経由で接続します。
- Infra は Presentation / Cmd に依存させません。
- `as any` は使わず、型を正しく表現してください。
- アプリ組み立て（DI、ルーティング、エラーハンドリング）のエントリーポイントは `src/Cmd/index.ts` とする。`create_app.ts` などへリネームしない。
- 例外変換は `src/Cmd/index.ts` の `app.onError` に集約します。
- Controller 内や ApplicationService 内に不要な try/catch を増やさないでください。
- 本質的な実装と関係ないリファクタリングやフォーマット変更は避けます。

## Verification

- TypeScript は `strict` 前提です。型エラーを握りつぶさないでください。
- 変更範囲に応じて `bun run test`、`bun run lint`、`bun run format:check` を実行します。
- Domain の仕様変更では、対応する `*.test.ts` を追加または更新します。
- DB スキーマ変更では `src/Infra/Database/migrations/` と `src/Infra/Database/types.ts` の整合性を確認します。
- API 変更では Controller、ApplicationService、必要な Repository / QueryService の境界を確認します。
- 実行できなかった検証がある場合は、理由を最終報告に明記します。

## Git / PR

- コミットはユーザーが明示的に依頼した場合だけ行います。
- コミットメッセージは Conventional Commits に従い、subject / body は日本語で書きます。