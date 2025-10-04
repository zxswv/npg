// app/api/timeline/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // "YYYY-MM-DD"形式の文字列

    if (!date) {
      return NextResponse.json(
        { error: "日付を指定してください" },
        { status: 400 }
      );
    }

    // 1日の始まりと終わりのDateオブジェクトをUTCで作成
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    // 全ての部屋を取得し、その日の予約情報も一緒に取得する
    const roomsWithReservations = await prisma.room.findMany({
      orderBy: { number: "asc" }, // 部屋名でソート
      include: {
        // 関連する予約を取得
        reservations: {
          // ただし、指定された日の予約のみ
          where: {
            slot: {
              startTime: {
                gte: startDate, // Greater than or equal to (以上)
                lt: endDate, // Less than (未満)
              },
            },
          },
          // 予約に紐づくスロットと予約者名も取得
          select: {
            id: true,
            personName: true,
            grade: true,
            className: true,
            purpose: true,
            slot: {
              select: {
                startTime: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(roomsWithReservations);
  } catch (error) {
    console.error("タイムラインデータの取得エラー:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
