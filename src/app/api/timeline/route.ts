// app/api/timeline/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// seed.tsから持ってきた、一日分のスケジュールとスロットを作成するヘルパー関数
const createScheduleWithSlots = async (date: Date) => {
  console.log(`Creating schedule and slots for: ${date.toISOString()}`);

  const timeSlots = [
    "09:10",
    "10:50",
    "13:10",
    "14:50",
    "16:30",
    "18:10",
    "19:50",
  ];
  const classDurationMinutes = 90; // 各授業の時間（分）

  const schedule = await prisma.schedule.create({
    data: {
      date: date,
      // 関係するスロットを一括で作成
      slots: {
        create: timeSlots.map((time) => {
          const [hour, minute] = time.split(":").map(Number);
          // startTimeとendTimeを正しくUTCで設定する
          const startTime = new Date(date);
          startTime.setUTCHours(hour, minute, 0, 0);
          const endTime = new Date(startTime);
          endTime.setMinutes(startTime.getMinutes() + classDurationMinutes);
          return { startTime, endTime };
        }),
      },
    },
  });
  return schedule;
};

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
    const targetDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    // まず、その日のスケジュールが存在するか確認する
    let schedule = await prisma.schedule.findUnique({
      where: { date: targetDate },
    });

    // もしスケジュールが存在しなければ、その場で作成する
    if (!schedule) {
      schedule = await createScheduleWithSlots(targetDate);
    }

    // 全ての部屋を取得し、その日の予約情報も一緒に取得する
    const rooms = await prisma.room.findMany({
      orderBy: { number: "asc" }, // 部屋名でソート
      include: {
        // 関連する予約を取得
        reservations: {
          // ただし、指定された日の予約のみ
          where: {
            status: "APPROVED", //ステータスが承認済みの予約のみを取得する
            slot: {
              startTime: {
                gte: targetDate, // Greater than or equal to (以上)
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

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("タイムラインデータの取得エラー:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
