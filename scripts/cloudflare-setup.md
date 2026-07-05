# Cloudflare + Supabase 本番セットアップ手順

Supabase（本番用データベース）と Cloudflare（API・フロント・画像のホスティング）へ **初回デプロイ** する手順。  
ローカル開発（Docker Compose）は [`README.md`](../README.md) を参照。

各ステップ末尾の「確認」が通るまで次に進まないこと。

**用語メモ（この手順書だけ）**

| 言葉 | 意味 |
|---|---|
| **migration** | アプリ用のテーブルなどを DB に作る作業（`bun run migrate`） |
| **接続文字列（URI）** | `postgresql://ユーザー:パスワード@ホスト:5432/postgres` の 1 行。Dashboard の **Connect** からコピーする |
| **Direct connection** | Supabase の DB に **直接** つなぐ URI。Cloudflare の Hyperdrive 設定で使う |
| **Session pooler** | 手元の PC や Docker からつなぎやすい **中継** 付き URI。migration をローカルから流すとき向け |
| **Hyperdrive** | Cloudflare Worker から Supabase につなぐための Cloudflare 側の機能 |
| **Worker** | Cloudflare 上で API / フロントを動かす実行環境 |
| **R2** | Cloudflare 上のファイル置き場（本番のプロフィール画像） |
| **Service Binding** | フロント Worker から API Worker を **内部** で呼ぶ仕組み（API をインターネットに公開しない） |

## 前提

| 項目 | 内容 |
|---|---|
| ツール | Bun、`npx wrangler`（`onion-hono-sample` で `bun install` 済み） |
| アカウント | [Supabase](https://supabase.com/)、[Cloudflare](https://dash.cloudflare.com/)（Workers 利用可） |
| 対象 DB | **Supabase の Postgres**（Docker Compose の `onion_hono` とは別） |

## 全体の流れ

```
1.  Supabase で DB を用意 + 接続文字列をコピー
2.  Cloudflare にログイン + API Token 作成
3.  Hyperdrive 作成 → wrangler.toml 更新
4.  R2 バケット作成（画像用）
5.  Supabase に migration
6.  API Worker deploy
7.  フロント Worker deploy
8.  MEDIA_PUBLIC_BASE_URL 更新 → API 再 deploy
9.  GitHub Secrets（CI）
10. 本番 E2E 確認
```

**デプロイ順は API → フロント。** フロントが API を内部参照（Service Binding）するため、API を先にデプロイする。  
参考: [Service bindings - Deployment](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/#deployment)

---

## 1. Supabase プロジェクト作成

### 1-1. プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. **Database Password** を生成し保存
3. **Region**: 可能なら Tokyo 付近
4. **Create new project** → `Active` まで待つ

### 1-2. 接続文字列をコピー（Connect から）

**やること**: Supabase の画面から **1 行の URI をコピー** する。ホスト名や ID を自分で組み立てない。

1. Dashboard 上部の **Connect** をクリック
2. 用途に応じて次の 2 種類をコピー（後述）。**表示された URI をそのまま** メモ帳などに貼る

**URI の見方（読めなくてもコピーだけで OK）**

```txt
postgresql://postgres:●●●@db.altvdfhfkdgwnpoycpyq.supabase.co:5432/postgres
              ^^^^^^^^     ^^^^^^^^^^^^^^^^^^^^^^^^
              DB ユーザー   あなたの Supabase プロジェクトを表すランダムな名前
                            （URL の /project/ の直後にも同じ文字列が出る）
```

- `●●●` はプロジェクト作成時に決めた **Database Password**（接続文字列に含まれる）
- `altvdfhfkdgwnpoycpyq` の部分は **人によって違う**。自分の Dashboard に表示されたものを使う

**2 種類の URI を使い分ける**

| 変数名 | Connect で選ぶ項目 | 何に使う |
|---|---|---|
| **`SUPABASE_DIRECT_URL`** | **Direct connection** | Hyperdrive 作成（ステップ 3） |
| **`SUPABASE_DATABASE_URL`** | 下記「ローカルから migration するとき」参照 | migration（ステップ 5）、GitHub Secret `DATABASE_URL` |

Direct connection の URI では、ホストが `db.（ランダムな名前）.supabase.co` になっていること。`pooler.supabase.com` という文字列が **入っていない** こと。

パスワードに `@` `#` `%` などが含まれる場合は [URL エンコード](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) が必要。

### 1-3. ローカルから migration するときの URI

Direct connection は **IPv6 経由** になることが多い。Docker から migrate すると `ECONNREFUSED` と IPv6 アドレス（`2406:...`）が出る場合、手元のネットワークから Direct では届いていない。

一次ソース: [Supabase - Connect to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)

**対処（どちらか）:**

**A. Session pooler を使う（無料・ローカル migrate 向け）**

1. Dashboard 上部 **Connect** → **Session pooler**（port **5432**）
2. 表示 URI をコピー → **`SUPABASE_DATABASE_URL`** にする  
   （ユーザー名が `postgres.（プロジェクト名）`、ホストに `pooler.supabase.com` が含まれる）

**B. IPv4 add-on を有効化（Direct だけに統一したい場合・有料）**

**Project Settings** → **Database** → IPv4 add-on を有効化。  
その後 **Connect** から Direct URI を再コピーし、`SUPABASE_DIRECT_URL` と `SUPABASE_DATABASE_URL` の **両方** に同じ URI を使える。

**Hyperdrive（ステップ 3）は Direct connection の URI のまま**（Cloudflare のサーバーから Supabase に接続するため、手元 PC とは経路が違う）。  
参考: [Hyperdrive + Supabase](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/)

**確認**: `SUPABASE_DIRECT_URL`（Hyperdrive 用）と `SUPABASE_DATABASE_URL`（migrate 用）が手元にあること。

**次へ**: ステップ 2（Cloudflare 認証）。migration（ステップ 5）と Hyperdrive（ステップ 3）は deploy 前に両方完了していればよい。

---

## 2. Cloudflare ログイン + API Token

### 2-1. wrangler ログイン

```bash
cd onion-hono-sample
npx wrangler login
```

ブラウザで **Allow** → 確認:

```bash
npx wrangler whoami
```

**Account ID** をメモ（GitHub Secret `CLOUDFLARE_ACCOUNT_ID` に使う）。

### 2-2. API Token 作成

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **My Profile** → **API Tokens** → **Create Token**
2. テンプレート **Edit Cloudflare Workers**、または Custom で:
   - Workers Scripts: **Edit**
   - Workers R2 Storage: **Edit**
   - Hyperdrive: **Edit**
3. Token をコピーして保存

```bash
export CLOUDFLARE_API_TOKEN="your-token-here"   # CI 用。ローカル deploy は wrangler login でも可
```

**確認**: `wrangler whoami` が成功すること。

---

## 3. Hyperdrive 作成

ステップ 1 の `SUPABASE_DIRECT_URL` とステップ 2 の wrangler 認証が必要。

```bash
cd onion-hono-sample

npx wrangler hyperdrive create onion-hono-db \
  --connection-string="$SUPABASE_DIRECT_URL"
```

成功時、出力の `id` をコピー:

```json
{ "hyperdrive": [{ "id": "57b7076f58be42419276f058a8968187" }] }
```

[`wrangler.toml`](../wrangler.toml) を更新:

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "57b7076f58be42419276f058a8968187"   # 実 ID に差し替え
```

**確認**:

```bash
npx wrangler hyperdrive list
```

`onion-hono-db` が一覧に出ること。

---

## 4. R2 バケット作成

```bash
cd onion-hono-sample
npx wrangler r2 bucket create macching-photos
```

**確認**:

```bash
npx wrangler r2 bucket list
```

`macching-photos` があり、[`wrangler.toml`](../wrangler.toml) の `bucket_name = "macching-photos"` と一致すること。

---

## 5. Supabase へ migration

**Supabase に直接** スキーマを流し込む。Docker Compose の **ローカル Postgres には触らない**。

### 推奨 — api コンテナから実行

`docker compose exec` は **使わない**（コンテナ内の `DATABASE_URL` がローカル DB のままになる）。  
`run --rm -e DATABASE_URL=...` で **Supabase の URL を上書き** する:

```bash
cd onion-hono-sample

docker compose run --rm \
  -e DATABASE_URL="$SUPABASE_DATABASE_URL" \
  api bun run migrate
```

Makefile から:

```bash
SUPABASE_DATABASE_URL="postgresql://..." make migrate-prod
```

`db` サービスは起動不要（`run` が一時コンテナを立てる）。

### 方法 B — ホストから実行

ホストで `bun install` 済みかつ `kysely/migration` が解決できる場合のみ:

```bash
cd onion-hono-sample
DATABASE_URL="$SUPABASE_DATABASE_URL" bun run migrate
```

`Cannot find module 'kysely/migration'` が出る場合は上の **コンテナ経由** を使う。

**確認** — 7 本成功 + Supabase **SQL Editor**:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

`members`, `profiles`, `likes`, `sessions`, `matches` 等があること。

---

## 6. API Worker 初回 deploy

ステップ 3（Hyperdrive ID 設定済み）、4（R2）、5（migration 済み）のあと。

```bash
cd onion-hono-sample
bun run deploy
```

**確認**:

- 出力に `Deployed onion-hono-api`
- Dashboard → **Workers & Pages** → **onion-hono-api** → **Domains & Routes** で `*.workers.dev` が **Disabled**

---

## 7. フロント Worker deploy

**ステップ 6 成功後**:

```bash
cd next-front
bun run deploy:cloudflare
```

表示 URL を **`FRONT_URL`** としてメモ（例: `https://macching-app.<subdomain>.workers.dev`）。

**確認** — Dashboard → **macching-app** → **Settings** → **Bindings** → `ONION_API` = Service `onion-hono-api`

---

## 8. MEDIA_PUBLIC_BASE_URL 更新（必須）

初回 deploy 時のデフォルト `http://localhost:3001/api/media` のままだと本番の `topImageUrl` が壊れる。

[`wrangler.toml`](../wrangler.toml):

```toml
[vars]
AUTH_COOKIE_SECURE = "true"
MEDIA_PUBLIC_BASE_URL = "https://macching-app.YOUR_SUBDOMAIN.workers.dev/api/media"
```

| 公開方法 | 値 |
|---|---|
| workers.dev | `https://macching-app.<subdomain>.workers.dev/api/media` |
| カスタムドメイン | `https://app.example.com/api/media` |

末尾スラッシュ **なし**。

```bash
cd onion-hono-sample
bun run deploy
```

---

## 9. GitHub Secrets（CI 自動 deploy）

各 **サブモジュールの GitHub リポジトリ** に登録（親 repo ではない）。

### onion-hono-sample

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | ステップ 2-2 の Token |
| `DATABASE_URL` | ステップ 1-2 の `SUPABASE_DATABASE_URL` |

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml): `main` への push で migrate → deploy。

### next-front

| Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 同上 |
| `CLOUDFLARE_ACCOUNT_ID` | ステップ 2-1 の Account ID |

Workflow: [`next-front/.github/workflows/deploy.yml`](../../next-front/.github/workflows/deploy.yml)

初回は **ステップ 6〜8 を手動で完了してから** CI に任せる。

---

## 10. 本番 E2E 確認

`FRONT_URL` をブラウザで開き:

- [ ] `/signup` → 会員登録 → `/login`
- [ ] ログイン → `/members`（500 / ZodError なし）
- [ ] トップ画像アップロード → 一覧 / マイページで表示
- [ ] DevTools → `topImageUrl` が `https://.../api/media/photos/...`
- [ ] その URL を直接開くと画像が返る（200）
- [ ] API Worker の URL に直接アクセス **不可**（非公開）

---

## よくある失敗と対処

| 症状 | 原因 | 対処 |
|---|---|---|
| migrate 後も Supabase にテーブルがない | `docker compose exec` を使った | `run --rm -e DATABASE_URL=...` を使う（ステップ 5） |
| `ECONNREFUSED` + IPv6 アドレス | Direct connection を IPv6 で張った | migrate は **Session pooler**（ステップ 1-3 A）を使う |
| Hyperdrive create で localhost 拒否 | ローカル Docker の URL を渡した | Supabase Direct connection を使う（ステップ 1-2） |
| R2 `Please enable R2` [10042] | R2 未有効化 | Dashboard → R2 → Overview でサブスク追加 |
| Hyperdrive create 失敗 | 接続文字列・IPv4 | Direct connection / URL エンコード / IPv4 add-on |
| フロント deploy で Service Binding エラー | API Worker 未 deploy | ステップ 6 を先に |
| 画像だけ 404 | `MEDIA_PUBLIC_BASE_URL` が localhost | ステップ 8 |
| migrate CI 失敗 | Secret `DATABASE_URL` 誤り | Supabase Direct 文字列を再設定 |
| R2 put 失敗 | バケット未作成 or binding 不一致 | ステップ 4 を確認 |

---

## 参照リンク

| トピック | URL |
|---|---|
| Hyperdrive 入門 | https://developers.cloudflare.com/hyperdrive/get-started/ |
| Hyperdrive + Supabase | https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/ |
| Service Binding | https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/ |
| workers.dev 無効化 | https://developers.cloudflare.com/workers/configuration/routing/workers-dev/ |
| OpenNext on Cloudflare | https://opennext.js.org/cloudflare/get-started |
| R2 Wrangler CLI | https://developers.cloudflare.com/r2/get-started/ |
