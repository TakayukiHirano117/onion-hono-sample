To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000

## 設計

マッチングアプリ想定
いいね集約と会員集約

domain

- member
  - id
  - name
  - email
- good
  infra
- usecase
- 会員がいいねを送れる。
- 会員同士がマッチングできる
- 会員を閲覧できる。- 一覧 - 詳細
  presentation

## todos

- [ ] dockerでAPI, DB構築
- [ ] モデリング & 実装
- [ ]

会員一覧取得

- [ ] エントリーポイント
- [ ] controller
- [ ] usecase
- [ ] repository
- [x] domain

- [x] db用意
- [ ] コントローラーとユースケース繋ぐ
tsyringe入れる。
transactionManager作る
レスポンスの方定義する。
zodのvalidator作成
他のユースケース
マッチングも作りたい。