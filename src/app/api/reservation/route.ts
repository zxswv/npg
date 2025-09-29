// src/app/api/Reservation/route.ts
// 予約の登録・取得（部屋・スロット含む）

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: 予約作成
export async function POST(req: Request) {
  try {
    // リクエストボディから必要なデータを取得
    const { date, time, roomId, personName } = await req.json();
    // 必須項目のチェック
    if (!date || !time || !roomId || !personName) {
      return NextResponse.json(
        { error: "必要項目が足りていません" },
        { status: 400 }
      );
    }

    // dateとtimeを組み合わせてDateオブジェクトを作成
    const targetDate = new Date(date);
    targetDate, setUTCHours(0, 0, 0, 0); // 日付部分のみを比較するために時刻をリセット

    // 指定された日にちのスケジュールを取得
    let schedule = await prisma.schedule.findUnique({
      where: { date: targetDate },
    });

    // スケジュールが存在しない場合はエラーを返す
    if (!schedule) {
      return NextResponse.json(
        { error: "指定された日にちのスケジュールが存在しません" },
        { status: 400 }
      );
    }

    // 指定された日にちと時間、部屋で既に予約が存在するかチェック
    const startTime = new Date(date);
    const [hour, minute] = time.split(":").map(Number);
    startTime.setHours(hour, minute, 0, 0); // 時刻を設定

    // 既に同じ部屋・同じ時間枠で予約が存在するか確認
    const slot = await prisma.slot.findFirst({
      where: {
        scheduleId: schedule.id,
        startTime: startTime,
      },
    });

    // スロットが存在しない場合はエラーを返す
    const newReservation = await prisma.reservation.create({
      data: {
        personName,
        roomId,
        slotId: slot.id,
      },
    });

    // 予約を作成して成功レスポンスを返す
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "この部屋のこの時間帯枠はすでに予約済みです" },
        { status: 409 }
      );
    }

    // その他のエラー処理
    console.error("予約作成エラー:", error);
    return NextResponse.json(
      { error: "予約の作成に失敗しました" },
      { status: 500 }
    );
  }
}

// // GET: 予約取得（部屋・スロット含む）
// export async function GET() {
//   const reservations = await prisma.reservation.findMany({
//     include: {
//       slot: true,
//       room: true,
//     },
//   });
//   return NextResponse.json(reservations);
// }
