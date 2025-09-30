# .env

```bash
DATABASE_URL="postgresql://tt:tt@localhost:5432/DB?schema=public"

DIRECT_URL="postgresql://tt:tt@localhost:5432/DB?schema=public"
```

# 実装予定

・部屋を選択した際に 24 時間グラフを使って視覚的に一目で空いている時間が分るやつ
・借りれない時間帯を選択できないようにする
・登録情報を完成させる

## 実装検討

・ユーザー管理
・権限管理
・授業登録画面
・掲示板
・インターネットアクセス

# 技術スタック

## 共通

- Node.js

- Next.js

## フロントエンド

- React
- [ui.shadcn](https://ui.shadcn.com/)

## バックエンド

## データベース

- PostgreSQL

## ライブラリー

- framer-motion
- react-icons
- nodemailer
- npm install nodemailer
- TypeScript を使用している場合は、型定義もインストールする
- npm install --save-dev @types/nodemailer

# サーバーコマンド一覧

## prisma コマンド

```bash
npm run db:seed #データベースに必要なデータを作成する
# or
npx prisma studio #prismaを直接操作確認できる
# or
npx prisma generate #スキーマやモデルを変えた際反映させるコマンド
```

## 起動コマンド

```bash
npm run dev # next.jsの起動コマンド
# or
npm run build # 確認コマンド
# or
docker-compose up # 起動コマンド
# or

```

## prisma コマンド

```bash
npx prisma studio --port 5555   #確認
# ro
npx prisma generate # Prismaクライアントを更新して新しいスキーマを反映
# or
npx prisma migrate dev --name init # マイグレーションフォルダの生成
# or
npx prisma init # Prismaの初期化

```

## docker 操作

```bash
docker-compose up # 起動コマンド
# or
docker-compose up -d # 動作確認
# or
docker compose exec database bash # dockerからMySQLコンテナ(database)に接続
# or
docker inspect -f '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -aq) # コンテナのIPアドレスを表示
# or
docker volume rm ボリューム名 # volumeの削除
# or
docker volume ls # ボリューム一覧
# or
docker ps -a --filter volume=my-app_database # コンテナID一覧
# or
docker stop コンテナID # コンテナを止める
# or
docker rm コンテナID # コンテナの削除
# or
```

## データベース操作

```bash
psql -U tt -d DB # データベースにログイン
# or
SELECT * FROM テーブル名; # 中身を確認
# or
\dt; # データベースのテーブル一覧を表示する
# or
SHOW DATABASES; # データベースの一覧を表示する
# or
docker compose exec database bash # dockerからSQLコンテナ(database)に接続
# or
USE データベース名; # テーブルの一覧を表示する
# or
DESCRIBE table_name; # テーブルの構造を表示する
# or
docker ps -a
# or
docker exec -it next.js-test-network-db psql -U tt -d DB  # コンテナ内でユーザー（ロール）を確認
# or
docker exec -it <正しいコンテナ名> psql -U postgres -d DB
# or
docker exec -it next.js-test-network-db ls -l /docker-entrypoint-initdb.d/
#or
\q #終了
#or

```

## SQl

```bash
CREATE DATABASE IF NOT EXISTS データベース名;
#
CREATE DATABASE # 新しいデータベースを作成するコマンドです。
# or
IF NOT EXISTS # 同名のデータベースが既に存在する場合にエラーを防ぐための条件です。


```

### SQL の情報

```bash

```

### SHOW DATABASES; を実行した際

```bash
    Reservation_Site # 今回使うデータベース名
    information_schema # MySQLデータベースのメタデータ
    mysql # MySQLサーバーに関するユーザーアカウントや特権情報
    performance_schema # MySQLサーバーのパフォーマンスに関する情報
    shop # 今回準備した初期データを入れる用のデータベース
    sys # MySQLの内部管理、セッション、ステートメントなどの情報
```

# docker 説明

### docker-compose.yml と docker-compose-prod.yml 主な違いのまとめ

- 用途の違い\
  docker-compose.yml: 開発環境用。ローカルでの開発とデバッグに最適。\
  docker-compose-prod.yml: 本番環境用。デプロイと運用に最適。\

- 設定の違い:\
  開発用では、ホットリロードやデバッグツールの設定を含むことが多い。\
  本番用では、パフォーマンスやセキュリティを考慮し、不要な開発ツールやデバッグ設定を省略。\

- 環境変数:\
  本番用では NODE_ENV=production のように環境変数を設定し、最適なパフォーマンスを発揮するようにします。\

### docker-compose.yml

主な用途: 開発環境の設定。

- 特徴:

- ローカル開発で必要な設定を含む。
  より頻繁なコード変更やデバッグに対応。\
  デバッグツールやホットリロードなど、開発を助けるための設定が含まれることが多い。\
  ボリュームマウントを利用して、ホストのファイルシステムとコンテナ内のファイルシステムを同期。\

#

### docker-compose-prod.yml

主な用途: 本番環境の設定。

- 特徴:

- 本番環境でのデプロイに必要な設定を含む。\
  高可用性、スケーラビリティ、セキュリティを考慮した設定。\
  デバッグツールやホットリロードなどの開発用の設定を省略。\
  パフォーマンス最適化のための設定が含まれることが多い。

# エラー

<!-- 401 → JWT Cookie が送られていない / 無効（未ログイン）

403 → ロールに CREATE_EVENTS パーミッションがない

400 → text や date が空

500 → サーバー側で何らかのエラー（DB, SQL 文, 予期しない null など） -->

# 参考資料

[Next.js の理解](https://qiita.com/tomy0610/items/f07d586c08a0a2aadb01#%E5%89%8D%E6%8F%90)

[【入門】Prisma を始めるときに押さえておきたいポイントまとめ](https://share.google/bHz3caiBXmmhBTbIK)

![alt text](l1Jg54Y-1.png)
