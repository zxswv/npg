//src/app/api/Room/route.ts
//部屋の登録 & 一覧取得

import { prisma } from "@/lib/prisma"; // Prismaクライアントのインポート
import { NextResponse } from "next/server";

// POST: 部屋の作成
export async function POST(req: Request) {
  const { name, capacity } = await req.json();
  const room = await prisma.room.create({
    data: { name, capacity },
  });
  return NextResponse.json(room);
}

// GET: 全部屋一覧
// GETメソッドでアクセスされた時に動く関数
export async function GET() {
  // 1. DBから全ユーザーを取得
  const rooms = await prisma.room.findMany();

  // 2. JSON形式でレスポンスを返す
  return NextResponse.json(rooms);
}
