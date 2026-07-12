# onion-hono-sample

マッチングアプリを想定した API の学習・実験用プロジェクトです。  
DDD とオニオンアーキテクチャの責務分離を意識して実装しています。

Web UI は親リポジトリの [`next-front`](https://github.com/TakayukiHirano117/next-front)（BFF）が担当します。全体構成は [macching-app/README.md](https://github.com/TakayukiHirano117/macching-app/blob/main/README.md) を参照。

## API ルート

```bash
make routes
```

## 技術スタック

| 区分 | 採用技術 |
|------|----------|
| 言語 | TypeScript |
| Runtime（ローカル） | Bun |
| Runtime（本番） | Cloudflare Workers |
| Web Framework | Hono |
| DB（ローカル） | PostgreSQL（Docker Compose） |
| DB（本番） | Supabase PostgreSQL + Hyperdrive |
| Query Builder | Kysely |
| バリデーション | Zod |
| オブジェクトストレージ（ローカル） | ファイルシステム（`.storage/`） |
| オブジェクトストレージ（本番） | Cloudflare R2 |
| コンテナ | Docker / Docker Compose |

## アーキテクチャ

オニオンアーキテクチャを採用し、外側の層が内側の層に依存する形で構成しています。

```
Presentation → ApplicationService → Domain
                    ↓
                  Infra
```

レイヤー責務・依存ルールは [`.cursor/rules/ddd-onion-architecture.mdc`](.cursor/rules/ddd-onion-architecture.mdc) を参照。

### 集約

集約は `src/domain/<集約名>/` 配下に、ディレクトリ名と同名の `.ts`（集約ルートの Entity）として置く。現状の集約はそこを見ること。

認証まわり（`sessions` テーブル、Cookie、middleware）はインフラ都合の横断関心事として扱い、Domain 集約には含めていません。

### ユースケース

ApplicationService は「ユーザーができること」を 1 ファイル・1 `execute` メソッドで表現します。

実装一覧は `src/application_service/` 以下を参照。

### Presentation の設計方針

- 1 controller = 1 action
- 親 controller（例: `MemberController`）がルーティングと DI を担当
- バリデーションは「パラメータが来ているか」程度に留め、ビジネスルールは Domain 層で検証する

### Infra

Repository は集約の永続化を担う。それ以外（QueryService、DomainService 実装、オブジェクトストレージ、セッションなど）は技術的な関心事の実装。配置・責務の詳細は [`.cursor/rules/ddd-onion-architecture.mdc`](.cursor/rules/ddd-onion-architecture.mdc) を参照。

トップ画像の保存方針は [`.cursor/rules/object-storage-and-top-image.mdc`](.cursor/rules/object-storage-and-top-image.mdc)。

## ディレクトリ構成

```bash
make tree
```

## 参考

- 実装ルールの詳細: [AGENTS.md](./AGENTS.md)
- 層構造ルール: [`.cursor/rules/ddd-onion-architecture.mdc`](.cursor/rules/ddd-onion-architecture.mdc)
- トップ画像・R2: [`.cursor/rules/object-storage-and-top-image.mdc`](.cursor/rules/object-storage-and-top-image.mdc)
- Cloudflare セットアップ: [`scripts/cloudflare-setup.md`](scripts/cloudflare-setup.md)
- 今後の予定: [todo.md](./todo.md)
