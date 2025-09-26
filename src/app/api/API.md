```bash
        API	                       機能
POST /api/room	                部屋の作成
GET /api/room	                全部屋の取得
POST /api/schedule	            スケジュール+スロット作成
GET /api/schedule/:date	        指定日の予約枠の空き状況
POST /api/reservation	        予約の作成
GET /api/reservation	        予約一覧（部屋・時間枠含む）
```

## リクエスト〜レスポンスの流れ（GET 例）

```bash
[ブラウザ / fetch]
   ↓  HTTPリクエスト (GET /api/users)
[Next.js API Route Handler]
   ↓  PrismaでDBからデータ取得
   ↓  JSON形式に変換
   ↓  NextResponseで返却
[ブラウザ / fetch]
   ↓  JSONを受け取り画面に表示
```

### 実際のコードと流れ

```bash
# route.ts
import { prisma } from "@/lib/prisma"; # Prisma Clientを読み込み
import { NextResponse } from "next/server";

#  GETメソッドでアクセスされた時に動く関数
export async function GET() {
#    1. DBから全ユーザーを取得
  const users = await prisma.user.findMany();

#    2. JSON形式でレスポンスを返す
  return NextResponse.json(users);
}
```

## POST リクエストの流れ（データ作成）

```bash
[ブラウザ / fetch (POST)]
   ↓  HTTPリクエスト (POST /api/users, body: JSON)
[Next.js API Route Handler]
   ↓  req.json()で送られたデータを取得
   ↓  PrismaでDBにINSERT
   ↓  作成されたレコードをJSONで返却
[ブラウザ]
   ↓  成功したデータを受け取り画面更新
```

### 実際のコードと流れ

```bash
# route.ts
export async function POST(req: Request) {
#    1. リクエストボディをパース
  const { name, email } = await req.json();

#    2. DBに新規ユーザーを作成
  const newUser = await prisma.user.create({
    data: { name, email },
  });

#    3. 作成結果をJSONで返す（201 Created）
  return NextResponse.json(newUser, { status: 201 });
}
```

## フロント側での呼び出し例

```bash
# route.ts
#  GET
const res = await fetch("/api/users");
const users = await res.json();

#  POST
await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Taro", email: "taro@example.com" })
  });
```
