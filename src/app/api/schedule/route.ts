// npg/src/app/api/schedule/route.ts
// スケジュールと時間枠の作成

// import { prisma } from "@/lib/prisma"; // Prismaクライアントのインポート
// import { NextRequest, NextResponse } from "next/server";

// // API: スケジュール管理
// export async function GET(req: NextRequest) {
//   const date = req.nextUrl.searchParams.get("date");

//   // 日付が指定されていない場合はエラーを返す
//   if (!date) {
//     return NextResponse.json({ error: "日付が必要です" }, { status: 400 });
//   }

//   // 日付に基づいて予約済みの時間を取得
//   const schedules = await prisma.schedule.findMany({
//     where: {
//       date: {
//         gte: new Date(`${date}T00:00:00Z`), // 日付の開始時刻
//         lt: new Date(`${date}T23:59:59Z`), // 日付の終了時刻
//       },
//     },
//     select: { time: true }, // 時間のみを取得
//   });

//   // 取得したスケジュールを返す
//   return NextResponse.json(schedules);
// }

// // スケジュールの新規作成
// export async function POST(req: Request) {
//   const { date, time } = await req.json();

//   // 日付と時間が指定されていない場合はエラーを返す
//   if (!date || !time) {
//     return NextResponse.json(
//       { error: "date と time は必須です" },
//       { status: 400 }
//     );
//   }

//   // Prismaを使用して新しいスケジュールを作成
//   const schedule = await prisma.schedule.create({
//     data: {
//       date: new Date(date),
//       time,
//     },
//   });

//   // 作成したスケジュールを返す
//   return NextResponse.json(schedule, { status: 201 });
// }

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: スケジュール作成（時間枠含む）
export async function POST(req: Request) {
  const { date, slots } = await req.json(); // slots: [{ startTime, endTime }]
  const schedule = await prisma.schedule.create({
    data: {
      date: new Date(date),
      slots: {
        create: slots.map((slot: any) => ({
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
        })),
      },
    },
    include: { slots: true },
  });
  return NextResponse.json(schedule);
}
