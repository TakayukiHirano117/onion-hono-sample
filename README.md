# onion-hono-sample

マッチングアプリを想定した API の学習・実験用プロジェクトです。  
DDD とオニオンアーキテクチャの責務分離を意識して実装しています。

Web UI は親リポジトリの [`next-front`](https://github.com/TakayukiHirano117/next-front)（BFF）が担当します。全体構成は [macching-app/README.md](https://github.com/TakayukiHirano117/macching-app/blob/main/README.md) を参照。

## API ルート

```bash
make routes
```

### トップ画像の 2 段階アップロード

認証済み会員は、API サーバーを経由せず S3 に画像を送り、その後 API で確定する。

1. `POST /api/v1/mypage/top-image/upload`
   - JSON: `{ "contentType": "image/jpeg" }`
   - 応答: `{ "status": "ok", "url": "...", "fields": { ... }, "uploadId": "..." }`
   - `url` と `fields` を multipart/form-data に使い、画像本体を S3 へ直接 POST する
2. `POST /api/v1/mypage/top-image/upload/complete`
   - JSON: `{ "uploadId": "...", "contentType": "image/jpeg" }`
   - 応答: `{ "status": "ok", "topImageUrl": "https://<CloudFrontドメイン>/photos/..." }`

許可形式は JPEG、PNG、WebP。サイズ上限 5 MiB。署名有効期間 300 秒。

S3 直接アップロード route の有効化には `AWS_REGION`、`AWS_S3_BUCKET`、`CLOUDFRONT_PUBLIC_BASE_URL` が必要。3項目が揃った Bun / AWS runtime だけが、S3 uploader と CloudFront resolver を組にした `directTopImageUpload` capability を注入する。AWS SDK の標準認証情報プロバイダーを使うため、ECS では Task Role を利用できる。

complete は同じ `uploadId` の再実行に対応する。DB が対象キーを参照し、S3 object が存在する場合は同じ CloudFront URL を返す。pending の先行削除で Copy が失敗した場合も、DB と final object を再確認する。同一会員の complete 競合では、所有権を証明できない final object を削除せず S3 lifecycle cleanup に委ねる。DB 更新後の旧画像削除失敗はログへ残し、成功済みの更新を 500 にしない。

`POST /api/v1/members` は画像なしで会員登録する。既存の `POST /api/v1/mypage/top-image` multipart API と R2 / ローカルファイル保存コードは Cloudflare 互換用に維持する。

### R2 から S3 への移行順序

既存 `profiles.top_image_path` を変更せず、R2 の全画像を同じキーで S3 へ先にコピーする。コピー後に AWS ECS の `ITopImageUrlResolver` を CloudFront ベース URL へ切り替える。この順序により、complete が S3 上の旧画像を削除できる。

Cloudflare Worker は S3 capability を注入せず、S3 prepare / complete route を登録しない。既存 R2 用の `MEDIA_PUBLIC_BASE_URL` resolver と multipart route を維持する。AWS ECS では後続インフラフェーズで DB path の URL 解決を CloudFront へ統一する。S3 設定のない Local Bun も既存 Local multipart 処理だけを登録する。

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
| 2 段階画像アップロード | Amazon S3 署名付き POST |
| S3 画像配信 | Amazon CloudFront |
| コンテナ | Docker / Docker Compose |

## Git ブランチ戦略

| ブランチ | 役割 |
|----------|------|
| `main` | 本番（production） |
| `develop` | ステージング（stg） |
| `epic/*` | まとまった機能単位（例: いいね機能一式） |
| `feature/*` | epic を進めるための小タスク（例: 〇〇 API の実装） |

流れのイメージ:

```
feature/*  →  epic/*  →  develop（stg）  →  main（本番）
```

- 実装は `feature/*` で行い、完了したら親の `epic/*` へ合流する
- epic が揃ったら `develop` へ合流し、stg で確認する
- 本番反映は `develop` から `main` へ合流する

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

集約ルート Entity は `private constructor` とし、生成は factory に分ける。

- `create` … 新規作成（Entity 固有の不変条件をここで検証）
- `reconstruct` … DB などからの再構築（Entity 固有バリデーションは基本しない）

Repository の行マッピングでは `reconstruct` を使う。詳細は [`.cursor/rules/ddd-onion-architecture.mdc`](.cursor/rules/ddd-onion-architecture.mdc)。

認証まわり（`sessions` テーブル、Cookie、middleware）はインフラ都合の横断関心事として扱い、Domain 集約には含めていません。

### ユースケース

ApplicationService は「ユーザーができること」を 1 ファイル・1 `execute` メソッドで表現します。

DTO は対応する `*_app_service.ts` に直書きし、`*_app_service_dto.ts` など別ファイルには切らない。命名はユースケース共通で次のとおり。

- 入力: `RequestDto`
- 出力: `ResponseDto`

詳細は [`.cursor/rules/ddd-onion-architecture.mdc`](.cursor/rules/ddd-onion-architecture.mdc)。

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
