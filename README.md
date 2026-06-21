# onion-hono-sample

マッチングアプリを想定した API の学習・実験用プロジェクトです。  
DDD とオニオンアーキテクチャの責務分離を意識して実装しています。

## このプロジェクトでできること

- 会員の登録・一覧閲覧
- 会員同士のいいね送信
- メールアドレス + パスワードによるログイン / ログアウト（Cookie + サーバーセッション）
- 認証が必要な API への middleware によるアクセス制御

将来的にはマッチング成立（相互いいね）や、パスワードレス認証などへの拡張を想定しています。

## 技術スタック

| 区分 | 採用技術 |
|------|----------|
| 言語 | TypeScript |
| Runtime | Bun |
| Web Framework | Hono |
| DB | PostgreSQL |
| Query Builder | Kysely |
| バリデーション | Zod |
| コンテナ | Docker / Docker Compose |

## アーキテクチャ

オニオンアーキテクチャを採用し、外側の層が内側の層に依存する形で構成しています。

```
Presentation → ApplicationService → Domain
                    ↓
                  Infra
```

### レイヤーと責務

| レイヤー | ディレクトリ | 責務 |
|----------|-------------|------|
| Presentation | `src/Presentation` | HTTP リクエストの受け取り、簡易バリデーション、レスポンス返却 |
| ApplicationService | `src/ApplicationService` | ユースケースの組み立て・実行 |
| Domain | `src/Domain` | Entity、Value Object、ビジネスルール、Repository interface |
| Infra | `src/Infra` | DB 永続化、外部 API、DomainService の実装など技術的詳細 |
| Cmd | `src/Cmd` | Middleware などアプリケーション起動周りの横断関心事 |

### 依存のルール

- **Domain** はどの層にも依存しない。ライブラリ依存も可能な限り避ける
- **ApplicationService** は Domain と Infra のオブジェクトを使ってユースケースを組み立てる
- **Infra** は Repository 実装・QueryService 実装・DomainService 実装を担う
- **Presentation** は ApplicationService を呼び出す。Domain / Infra を直接呼ばない

### 集約

| 集約 | 主な概念 |
|------|----------|
| Member | 会員（名前、メールアドレス、パスワード） |
| Profile | プロフィール（自己紹介、性別、生年月日） |
| Like | いいね（送信元・送信先の会員） |
| Match | マッチング（テーブルのみ用意、ロジックは未実装） |

認証まわり（`sessions` テーブル、Cookie、middleware）はインフラ都合の横断関心事として扱い、Domain 集約には含めていません。

### ユースケースの例

ApplicationService は「ユーザーができること」を 1 ファイル・1 `execute` メソッドで表現します。

```
create_member_app_service.ts   … 会員を登録する
find_all_member_app_service.ts … 会員一覧を取得する
send_like_app_service.ts       … いいねを送る
login_app_service.ts           … ログインする
logout_app_service.ts          … ログアウトする
```

### Presentation の設計方針

- 1 controller = 1 action
- 親 controller（例: `MemberController`）がルーティングと DI を担当
- バリデーションは「パラメータが来ているか」程度に留め、ビジネスルールは Domain 層で検証する

### Infra の主な構成

| 種別 | 役割 | 例 |
|------|------|-----|
| Repository | 集約の永続化 | `MemberRepositoryImpl` |
| QueryService | 読み取り専用のクエリ | `FindByEmailForLoginQueryServiceImpl` |
| DomainService | Domain interface の実装 | `PasswordVerificationDomainService` |
| shared | UUID 生成、パスワードハッシュ、セッション管理など | `PasswordHashGenerator`, `LoginSessionGeneratorImpl` |

Repository は Domain 集約用。`sessions` のような認証用テーブルは Repository ではなく shared / QueryService / Writer として扱います。

## ディレクトリ構成

```
src/
├── Domain/
│   ├── Member/
│   ├── Profile/
│   ├── Like/
│   └── shared/vo/
├── ApplicationService/
│   ├── Member/
│   ├── Like/
│   └── Auth/
├── Infra/
│   ├── Repository/
│   ├── QueryService/
│   ├── DomainService/
│   ├── Database/
│   └── shared/
├── Presentation/
│   ├── Member/
│   ├── Like/
│   └── auth/
├── Cmd/
│   └── middlewares/
└── index.ts
```

## 参考

- 実装ルールの詳細: [AGENTS.md](./AGENTS.md)
- 今後の予定: [todo.md](./todo.md)
