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
  try {
    const rooms = await prisma.room.findMany();
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("部屋の取得エラー:", error); //サーバー側でエラーをログに出力
    // クライアントには具体的なエラー内容は隠蔽し、汎用的なメッセージを返す
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 } //HTTPステータスコード500を返す
    );
  }
}
