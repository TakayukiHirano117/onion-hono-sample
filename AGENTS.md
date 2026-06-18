## Summary
このプロジェクトはオニオンアーキテクチャで実装されたマッチングアプリです。

Hono.js, TSで書かれています。

以下のルールを守って実装を行います。
- Domain層はどこにも依存せず、可能な限りライブラリへの依存を避ける。
- Infra層は外部APIとのやりとりやDBへの永続化など技術的な機能を担当する。
- UseCase層はユースケースを表現する。Domain, Infra層のオブジェクトを用いてユースケースを組み立てる。
- Presentation層はリクエストの受け取りと簡易バリデーション、レスポンスの返却を行う。
- UseCase層はInfra層とDomain層に依存する。
- Infra層はUseCase以外では基本的に使用しない。
- UseCase層はApplicationService, Domain層はDomain, Infra層はInfra, Presentation層はPresentationディレクトリに記載する。