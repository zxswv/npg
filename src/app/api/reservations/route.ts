// src/app/api/Reservation/route.ts
// 予約の登録・取得（部屋・スロット含む）

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: 予約作成
export async function POST(req: Request) {
  try {
    // リクエストボディから必要なデータを取得
    const {
      date,
      time,
      roomId,
      personName,
      grade,
      className,
      purpose,
      numberOfUsers,
      note,
    } = await req.json();
    // 必須項目のチェック
    if (!date || !time || !roomId || !personName || !grade || !className) {
      return NextResponse.json(
        { error: "必要項目が足りていません" },
        { status: 400 }
      );
    }

    // dateとtimeを組み合わせてDateオブジェクトを作成
    const targetDate = new Date(`${date}T00:00:00.000Z`);
    // targetDate.setUTCHours(0, 0, 0, 0); // 日付部分のみを比較するために時刻をリセット

    // console.log("--- デバッグ開始 ---");
    // console.log("フロントエンドから受け取った日付:", date);
    // console.log("検索するScheduleの日付 (UTC):", targetDate.toISOString());

    // 指定された日にちのスケジュールを取得
    const schedule = await prisma.schedule.findUnique({
      where: { date: targetDate },
    });

    // スケジュールが存在しない場合はエラーを返す
    if (!schedule) {
      // console.log("エラー: Scheduleが見つかりませんでした。");
      // console.log("--- デバッグ終了 ---");
      return NextResponse.json(
        {
          error:
            "指定された日にちのスケジュールが存在しません（管理者に連絡してください）",
        },
        { status: 404 }
      );
    }

    console.log("成功: Scheduleが見つかりました:", schedule);

    // time文字列を使ってスロットの開始時間を作成
    // 例: "14:00" -> "2023-10-01T14:00:00.000Z"
    const startTimeString = `${date}T${time}:00.000Z`;
    const startTime = new Date(startTimeString);

    // console.log("検索するSlotの開始時間 (UTC):", startTime.toISOString());
    // console.log("検索するSlotのscheduleId:", schedule.id);

    // 指定されたスケジュールIDと開始時間でスロットを検索
    // const allSlotsForSchedule = await prisma.slot.findMany({
    //   where: { scheduleId: schedule.id },
    // });
    // console.log(
    //   "データベース内の該当Scheduleの全スロット:",
    //   allSlotsForSchedule.map((s) => s.startTime.toISOString())
    // );

    // 指定されたスケジュールIDと開始時間でスロットを検索
    const slot = await prisma.slot.findFirst({
      where: {
        scheduleId: schedule.id,
        startTime: startTime,
      },
    });

    // スロットが存在しない場合はエラーを返す
    if (!slot) {
      // console.log("エラー: Slotが見つかりませんでした。");
      // console.log("--- デバッグ終了 ---");
      console.error(
        `Slot not found for scheduleId: ${
          schedule.id
        } and startTime: ${startTime.toISOString()}`
      );
      return NextResponse.json(
        { error: `指定された時間枠(${time})が見つかりません` },
        { status: 404 }
      );
    }

    // console.log("成功: Slotが見つかりました:", slot);
    // console.log("--- デバッグ終了 ---");

    // numberOfUsersがnullまたは空文字の場合はnullに設定、それ以外は数値に変換
    const processedNumberOfUsers =
      numberOfUsers !== null && numberOfUsers !== ""
        ? Number(numberOfUsers)
        : null;

    // 予約を作成
    const newReservation = await prisma.reservation.create({
      data: {
        personName,
        grade,
        className,
        purpose: purpose || null,
        numberOfUsers: processedNumberOfUsers,
        note: note || null,
        // 外部キー
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
      { error: "予約の作成に失敗しました", details: String(error) },
      { status: 500 }
    );
  }
}

// GET: 予約取得（部屋・スロット含む）
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      // 予約が作成された順（新しいものが先頭）に並び替え
      orderBy: {
        createdAt: "desc",
      },
      // 関連するデータも一緒に取得する
      include: {
        // Roomモデルからnameだけを取得
        room: {
          select: {
            name: true,
          },
        },
        // SlotモデルからstartTimeだけを取得
        slot: {
          select: {
            startTime: true,
          },
        },
      },
    });
    return NextResponse.json(reservations);
  } catch (error) {
    console.error("予約取得エラー:", error);
    return NextResponse.json(
      { error: "予約の取得に失敗しました" },
      { status: 500 }
    );
  }
}
