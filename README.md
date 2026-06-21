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

ドメインサービス: すでにいいねしたかとか
いいねしてお互いにいいねしたってなったら、
マッチング成立してレコード作成

複数集約の判断
→
いいねした瞬間に、その会員が今月に何回いいねしたか見てこれ以上送れません的な

voリファクタリング

いいねが送れるかを判定するドメインロジックを

statusを使って判定する。

ブロックされてなかったら送れる。

年齢判断ロジックをmemberに置く。
それとかあと証明書提出フローがどうなってるかとか。

いいね:自分にはいいねできない


controllerでのビジネスロジックのバリデーションは不要。

- [ ] 認証とミドルウェア実装
  - [ ] cookieとサーバーセッション方式で実装する。
    - [x] membersテーブルにpassword_hashカラム追加
    - [x] sessionsテーブル作成、id, member_id, expires_at

登録時 → ユーザーのプロフィール情報と共に、最初にメールアドレス・パスワードも入力してもらう。
- [x] create_member_controller.tsで受け取るparam追加
- [x] infraでパスワードハッシュ生成処理作成

※ 最初は画面のフローとか気にせずやる。
一旦cookie, サーバーセッションで実装したらあとでパスワードレスでemail → ６桁の番号みたいな
ありがちなやつにしてみる。

その後、
- [ ] ログイン処理実装
  - [ ] ログイン時にメールアドレス・パスワードが正しければセッションID生成
  - [ ] sessionsテーブルに保存。
  - [ ] HttpOnly: true, Secure: true, SameSite: 'Lax'でレスポンスヘッダーに付与

- [ ] controller
  - [ ] emailとpasswordを受け取る
  - [ ] 簡易的なバリデーション
  - [ ] ユースケースを呼び出す
  - [ ] ユースケースでメールアドレスとパスワードが正し以下どうかチェックする
    - [ ] domain_serviceで行う。
  - [ ] レスポンスを返す
- [ ] usecase
- [ ] infra


##
メンバー登録改修
同じemailを持つユーザーで登録できない様にする。
  emailでユーザーの存在チェックをできる様にする。
