# Kysely + TypeScript IDE エラー（ts(2749)）のメモ

マイグレーションファイルなどで Kysely の型を使った際、IDE にだけ赤線が出た事象と対策の記録。

## 起きたこと

`src/Infra/Database/migrations/20260621000002_create_sessions_table.ts` などで、次のようなコードを書いた。

```typescript
import type { Kysely } from "kysely";
import type { Database } from "../types";
import { sql } from "kysely";

export async function up(db: Kysely<Database>): Promise<void> {
  // ...
}
```

IDE では次のエラーが出た。

- `'Kysely' は値を参照していますが、ここでは型として使用されています。'typeof Kysely' を意図していましたか?` ts(2749)
- `import type { Kysely }` が「使われていない」ように見える
- `sql` が「呼び出し可能ではない」
- スキーマビルダーの `col` / `cb` が暗黙的 `any`

コードの書き方としては `import type` + `db: Kysely<Database>` で問題ない。Bun での実行自体は通ることもある。

## 誤解しやすいポイント

### ts(2749) は import の書き方が悪いわけではない

`Kysely` を型注釈だけで使うなら `import type` が正しい。`typeof Kysely` に変える必要はない。

エラーメッセージは紛らわしいが、実際には「`Kysely` が型として解決できず、値（クラス）として見えている」状態の副作用。

### `import type` は未使用ではない

`Kysely<Database>` の型注釈で使っている。型解決が壊れていると IDE が参照を追えず、未使用に見えることがある。

## 根本原因

Kysely 0.27 以降は **TypeScript 5.4 以上** を前提とする。

- 一次ソース: [Kysely Getting started - Prerequisites](https://kysely.dev/docs/getting-started)

IDE の言語サーバーが 5.4 未満の TypeScript を使うと、Kysely は本来の型定義の代わりに `node_modules/kysely/outdated-typescript.d.ts` を読み込む。

このスタブでは `Kysely` / `sql` が「TS が古いので型安全を保証できない」旨のダミー定義になっており、次のような連鎖エラーになる。

| 症状 | 理由 |
|------|------|
| ts(2749) | スタブ上の `Kysely` がクラス（値）として定義されている |
| `sql` が呼び出せない | スタブ上の `sql` がタグ関数ではない |
| `col` が `any` | スキーマビルダーの型推論が壊れる |

同ファイルの別エラーに本質が書いてあることがある。

```text
KyselyTypeError<"The installed TypeScript version is outdated and cannot guarantee type-safety with Kysely. Please upgrade to version 5.4 or newer.">
```

## 対策

### 1. プロジェクトに TypeScript 5.4+ を入れる

`devDependencies` に `typescript`（例: `^5.9.2`）があることを確認し、`bun install` する。

### 2. IDE で Workspace の TypeScript を使う

`.vscode/settings.json` の例:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

設定後も赤線が残る場合:

1. コマンドパレット → **TypeScript: Select TypeScript Version**
2. **Use Workspace Version** を選択
3. 必要ならウィンドウをリロード

### 3. CLI で切り分ける

```bash
bunx tsc --noEmit
```

ここでエラーが出なければ、コードは問題なく **IDE 側の TS バージョン** が原因の可能性が高い。

## import の整理（参考）

型だけ使うファイル（マイグレーション、Repository のコンストラクタ引数など）:

```typescript
import type { Kysely } from "kysely";
import { sql } from "kysely"; // 値として使うものは通常 import
```

インスタンス生成するファイル（`database.ts` など）:

```typescript
import { Kysely, PostgresDialect } from "kysely";
```

## やらないこと

- `typeof Kysely` に変える（本件の正しい修正ではない）
- `as any` や `@ts-ignore` で黙らせる
- Kysely のバージョンを下げる

## 関連ファイル

- `package.json` … `devDependencies.typescript`
- `tsconfig.json`
- `.vscode/settings.json`
- `src/Infra/Database/migrations/*.ts`
