---
name: github-actions
description: GitHub Actions の CI ワークフローを Bun プロジェクト向けに実装・更新する。Use when implementing GitHub Actions, CI, workflows, lint/test jobs, or when the user mentions GitHub Actions, CI, workflow, lint job, test job。
---

# GitHub Actions

github actionsの実装を行います。

この Skill は、以下の一次ソースを確認した内容を前提に GitHub Actions を実装する。

- GitHub Docs: Workflow syntax, `permissions`, `concurrency`, `timeout-minutes`
  - https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- GitHub Docs: Secure use, script injection, `pull_request_target` の注意
  - https://docs.github.com/en/actions/reference/security/secure-use
  - https://docs.github.com/en/actions/concepts/security/script-injections
- Bun Docs: GitHub Actions での `oven-sh/setup-bun@v2`
  - https://bun.com/docs/guides/runtime/cicd
- Bun Docs: `bun ci` と `bun install --frozen-lockfile`
  - https://bun.sh/docs/pm/cli/install
- Bun Docs: global cache path
  - https://bun.com/docs/pm/global-cache
- actions/cache README / GitHub Docs: dependency caching
  - https://github.com/actions/cache
  - https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching

## 前提

- Runtime は Bun。Web Framework は Hono。
- 検証コマンドは `package.json` の scripts を使う。
  - `bun run lint` → `eslint .`
  - `bun run test` → `bunx --bun vitest`
  - `bun run format:check` → `prettier . --check`（CI に含める場合のみ）
- ワークフロー配置先は `.github/workflows/`。
- 既存 CI の参照実装: `.github/workflows/ci.yml`

## 実装前の調査

実装・変更前に必ず以下を確認する。

1. `package.json` の scripts（lint / test / format など）
2. 既存の `.github/workflows/*.yml`
3. テストが DB や外部サービスを必要とするか（現状は Domain の unit test が中心）
4. `bun.lock` がコミットされているか（`--frozen-lockfile` 利用の前提）

## ベストプラクティス（このリポジトリ基準）

### トリガー

- `pull_request` は常に対象にする。
- `push` は `main` ブランチのみ対象にする。
- 通常の CI では `pull_request_target` を使わない。fork PR の未信頼コードを privileged context で実行しない。

### 権限

- workflow か job に `permissions` を明示する。
- 通常の lint/test CI は repository contents の読み取りだけで足りるため、トップレベルに以下を置く。

```yaml
permissions:
  contents: read
```

- GitHub Docs では、`permissions` を指定すると未指定 permission は `none` になると説明されている。
- secrets や write permission が必要な workflow は、必要な job にだけ job-level `permissions` を追加する。

### 同時実行制御

- 同一 branch / PR の古い CI はキャンセルする。
- workflow level に以下を置く。

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Runner / セットアップ

- `runs-on: ubuntu-latest`
- job ごとに `timeout-minutes` を設定する。短い lint/test ではまず `10` 分を目安にする。
- `actions/checkout@v4`
- `oven-sh/setup-bun@v2`（Bun 公式 GitHub Action）
- 依存インストールは `bun ci`
- `bun ci` は Bun 公式 docs 上で `bun install --frozen-lockfile` と等価と説明されており、CI で lockfile と `package.json` の不整合を失敗にできる。
- `bun.lock` が存在しない、または lockfile を使わない理由がある場合だけ `bun install` を検討する。

### Cache

- CI が遅い場合だけ `actions/cache` で Bun の global cache を使う。
- Bun の global cache path は `~/.bun/install/cache`。
- cache key は `bun.lock` を含める。

```yaml
- name: Cache Bun dependencies
  uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
    restore-keys: |
      ${{ runner.os }}-bun-
```

参考:
- https://bun.com/docs/guides/runtime/cicd
- https://github.com/oven-sh/setup-bun

### Job 分割

- `lint` と `test` は**別 job** にする。
- 各 job は独立して checkout / setup / install を行う。
- 一方の失敗が他方の実行を止めないようにする。

### 実行コマンド

- lint job: `bun run lint`
- test job: `bun run test`
- format check を CI に入れる場合は別 job または lint job に `bun run format:check` を追加する。

### Security

- `${{ github.event.*.title }}`、`${{ github.event.*.body }}`、`${{ github.head_ref }}` などの未信頼 context を `run` に直接埋め込まない。
- 未信頼値を shell で使う必要がある場合は、まず `env` に渡し、shell 内では quote して扱う。
- secrets や `.env` を workflow に直書きしない。
- `pull_request_target` と checkout した未信頼 PR code を組み合わせない。

### やらないこと

- workflow 内で `npm install` を使わない（Bun プロジェクト）
- lint と test を 1 job にまとめない（このリポジトリの方針）

## 標準テンプレート

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      - name: Install dependencies
        run: bun ci
      - name: Lint
        run: bun run lint

  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      - name: Install dependencies
        run: bun ci
      - name: Test
        run: bun run test
```

## DB 連携テストを追加する場合

現状の unit test は DB 不要。integration test で PostgreSQL が必要になったら `services` を追加する。

```yaml
services:
  db:
    image: postgres:18-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: onion_hono
    ports:
      - 5432:5432
    options: >-
      --health-cmd "pg_isready -U postgres -d onion_hono"
      --health-interval 5s
      --health-timeout 5s
      --health-retries 5
```

- `DATABASE_URL` は job の `env` で設定する。
- migration が必要なら test 前に `bun run migrate` を実行する。

## 完了報告

- 追加・更新した workflow ファイル
- 各 job の役割（lint / test / format など）
- トリガー条件
- ローカルで再現するコマンド
- CI 失敗時に想定される既存エラーがあれば明記する
