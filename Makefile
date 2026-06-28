.PHONY: help up up-d up-build down build logs ps shell db-shell migrate test setup

COMPOSE := docker compose

.DEFAULT_GOAL := help

help: ## 利用可能なコマンド一覧を表示
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

up: ## API / DB を起動（フォアグラウンド）
	$(COMPOSE) up

up-d: ## API / DB を起動（バックグラウンド）
	$(COMPOSE) up -d

up-build: ## イメージをビルドして起動（フォアグラウンド）
	$(COMPOSE) up --build

build: ## Docker イメージをビルド
	$(COMPOSE) build

down: ## 停止
	$(COMPOSE) down

logs: ## ログを追跡
	$(COMPOSE) logs -f

ps: ## コンテナの状態を表示
	$(COMPOSE) ps

shell: ## API コンテナに入る
	$(COMPOSE) exec api sh

db-shell: ## PostgreSQL に接続
	$(COMPOSE) exec db psql -U postgres -d onion_hono

migrate: ## Kysely マイグレーションを実行
	$(COMPOSE) run --rm api bun run migrate

test: ## 全てのテストを実行
	bun run test

setup: build up-d migrate ## 初回セットアップ（build → 起動 → migrate）
