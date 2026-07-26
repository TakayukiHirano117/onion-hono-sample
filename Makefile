.PHONY: help up up-d up-db up-build down build logs ps shell db-shell migrate migrate-prod \
	restart install setup test lint lint-fix format format-check dev-worker deploy routes tree

COMPOSE := docker compose
API_DIR := .
DATABASE_URL ?= postgresql://postgres:postgres@localhost:5432/onion_hono

.DEFAULT_GOAL := help

help: ## 利用可能なコマンド一覧を表示
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## 依存関係をインストール（ホスト + api コンテナ）
	bun install
	$(COMPOSE) run --rm api bun install

setup: install build up-d migrate ## 初回セットアップ（install → build → 起動 → migrate）

up: ## API / DB / Mail を起動（フォアグラウンド）
	$(COMPOSE) up

up-d: ## API / DB / Mail を起動（バックグラウンド）
	$(COMPOSE) up -d

up-db: ## DB / Mail のみ起動（ホストで bun run dev する場合）
	$(COMPOSE) up -d db mail

up-build: ## イメージをビルドして起動（フォアグラウンド）
	$(COMPOSE) up --build

build: ## Docker イメージをビルド
	$(COMPOSE) build

down: ## コンテナを停止
	$(COMPOSE) down

restart: ## API コンテナを再起動（コード変更が反映されないとき）
	$(COMPOSE) restart api

logs: ## ログを追跡
	$(COMPOSE) logs -f

ps: ## コンテナの状態を表示
	$(COMPOSE) ps

shell: ## API コンテナに入る
	$(COMPOSE) exec api sh

db-shell: ## PostgreSQL に接続
	$(COMPOSE) exec db psql -U postgres -d onion_hono

migrate: ## ローカル DB へ migration（Docker api 経由）
	$(COMPOSE) run --rm api bun run migrate

migrate-prod: ## 本番 Supabase へ migration（SUPABASE_DATABASE_URL 必須）
	@test -n "$(SUPABASE_DATABASE_URL)" || (echo "SUPABASE_DATABASE_URL を設定してください" && exit 1)
	$(COMPOSE) run --rm -e DATABASE_URL="$(SUPABASE_DATABASE_URL)" api bun run migrate

dev: ## ホストで API を起動（up-db 実行後）
	DATABASE_URL="$(DATABASE_URL)" bun run dev

dev-worker: ## Workers ローカル起動
	bun run dev:worker

deploy: ## Cloudflare Workers へ deploy
	bun run deploy

test: ## テスト実行
	bun run test

lint: ## ESLint
	bun run lint

lint-fix: ## ESLint（自動修正）
	bun run lint:fix

format: ## Prettier 適用
	bun run format

format-check: ## Prettier チェック
	bun run format:check

routes: ## 登録済み API ルート一覧を表示（hono/dev の showRoutes）
	DATABASE_URL="$(DATABASE_URL)" bun run scripts/show_routes.ts

tree: ## src のディレクトリ構成を表示
	@tree src -d --dirsfirst
