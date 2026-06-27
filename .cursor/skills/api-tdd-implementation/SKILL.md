---
name: api-tdd-implementation
description: TDD サイクルで API を実装し、Domain、Infra、ApplicationService、Controller をオニオンアーキテクチャに沿って追加する。Use when implementing APIs, adding endpoints, practicing TDD, or when the user mentions Domain, Infra, ApplicationService, Controller, or API 実装。
---

# API TDD Implementation

APIを実装するまでループで実装し続ける。
TDDサイクルに則って実装する。
Domain, Infra, ApplicationService, Controllerを実装する。

## 基本方針

- API 仕様、既存ルーティング、既存テスト、同種ユースケースの実装パターンを先に確認する。
- Red、Green、Refactor の順で進め、API が完成するまでテスト実行、失敗分析、修正をループする。
- 変更は Domain、ApplicationService、Infra、Presentation/Controller、Cmd の責務境界に沿って最小限にする。
- `as any` は使わない。型が足りない場合は、型定義、Value Object、interface、テストデータを適切に整える。
- 既存の失敗テストと今回の変更由来の失敗を切り分けて報告する。

## TDD ワークフロー

1. API の期待仕様を整理する。
   - HTTP method、path、request、response、status code、認証要否を確認する。
   - 仕様が曖昧で実装判断に影響する場合は、実装前にユーザーへ確認する。

2. Red: 失敗するテストを書く。
   - まずユースケースまたはドメインの振る舞いをテストする。
   - API の入出力やルーティングが重要な場合は Controller または統合寄りのテストも追加する。
   - テストを実行し、期待した理由で失敗していることを確認する。

3. Green: 必要最小限を実装する。
   - Domain: Entity、Value Object、DomainService、Repository interface を必要に応じて追加する。
   - ApplicationService: ユーザーができることを `execute` で表現し、Domain と Infra の interface を組み立てる。
   - Infra: Repository 実装、QueryService 実装、外部 API、DB 永続化など技術詳細を担当する。
   - Presentation/Controller: リクエスト受け取り、簡易バリデーション、レスポンス返却に限定する。
   - Cmd: DI、ルーティング、middleware、エラー変換の接続だけを行う。

4. Refactor: 責務と命名を整える。
   - Domain 層はライブラリ依存を避ける。
   - Controller から Domain 層、Infra 層を直接呼び出さない。
   - Presentation のバリデーションにビジネスルールを持ち込まない。
   - 既存のファイル名、ディレクトリ、例外処理、レスポンス形式に合わせる。

5. 完了までループする。
   - テストを実行する。
   - 失敗の原因を特定する。
   - 最小修正を行う。
   - 全ての対象テストが通るまで繰り返す。

## 実装順序の目安

- Domain の振る舞いが中心なら、Domain test から始める。
- DB 読み書きが中心なら、ApplicationService test で Repository interface を固定してから Infra を実装する。
- HTTP 契約が中心なら、Controller または app route のテストで request/response を固定する。
- 認証が必要な API は、既存 middleware と session/cookie の扱いを確認してから接続する。

## 完了報告

完了時は以下を簡潔に報告する。

- 実装した API と主な責務分担
- 追加または更新したテスト
- 実行した検証コマンドと結果
- 残っている既存失敗、未確認事項、運用上の注意
